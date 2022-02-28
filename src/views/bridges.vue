<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2020 HOOBS                                                                       |
 |                                                                                                |
 | This program is free software: you can redistribute it and/or modify                           |
 | it under the terms of the GNU General Public License as published by                           |
 | the Free Software Foundation, either version 3 of the License, or                              |
 | (at your option) any later version.                                                            |
 |                                                                                                |
 | This program is distributed in the hope that it will be useful,                                |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of                                 |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  |
 | GNU General Public License for more details.                                                   |
 |                                                                                                |
 | You should have received a copy of the GNU General Public License                              |
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.                          |
 -------------------------------------------------------------------------------------------------->

<template>
    <div :key="version" v-if="user.permissions.bridges" id="bridges">
        <context>
            <router-link v-if="id !== 'add'" to="/bridges/add" class="button">
                <icon name="plus" class="icon" />
                {{ $t("add_bridge") }}
            </router-link>
        </context>
        <div v-if="!loading" class="content">
            <list v-if="bridges.length > 0" value="id" display="display" :values="bridges" :selected="id" controller="bridges" />
            <form v-if="id === 'add'" class="screen form">
                <div class="wrapper">
                    <div class="row section">{{ $t("import") }}</div>
                    <div class="row">
                        <input type="file" ref="file" v-on:change="upload()" accept=".bridge" hidden />
                        <div v-on:click="$refs.file.click()" class="button">{{ $t("upload_file") }}</div>
                        <div v-if="file" class="filename">{{ filename }}</div>
                    </div>
                    <div class="row section">{{ $t("details") }}</div>
                    <div class="row">
                        <text-field :title="$t('name')" style="flex: 1; padding-right: 5px" v-model="display" />
                        <text-field :title="$t('bridge_pin')" style="flex: 1; padding-right: 0; padding-left: 5px" v-model="pin" />
                    </div>
                    <div class="row">
                        <port-field :title="$t('bridge_port')" style="flex: 1; padding-right: 5px" v-model="port" />
                        <select-field :title="$t('bridge_advertiser')" style="flex: 1; padding-right: 0; padding-left: 5px" :options="advertisers" v-model="advertiser" />
                    </div>
                    <div class="row actions">
                        <div v-if="!loading" v-on:click="save(true)" class="button primary">{{ $t("save") }}</div>
                        <router-link to="/bridges" class="button">{{ $t("cancel") }}</router-link>
                    </div>
                </div>
            </form>
            <form v-else-if="subject" class="screen form">
                <div class="wrapper">
                    <div class="row title">{{ display }}</div>
                    <div class="row section">{{ $t("pairing") }}</div>
                    <div v-if="!loading && running && (status || {}).setup_id" class="row">
                        <p style="margin-top: 0">{{ $t("pairing_description") }}</p>
                    </div>
                    <div v-if="!loading && running && (status || {}).setup_id" class="row qrcode">
                        <qrcode :value="(status || {}).setup_id" :options="{ width: 200, color: { dark: theme.widget.text.default, light: '#00000000' }}" />
                    </div>
                    <div class="row actions">
                        <div v-if="running" v-on:click="control('restart')" class="button">{{ $t("restart") }}</div>
                        <div v-if="!running" v-on:click="control('start')" class="button">{{ $t("start") }}</div>
                        <div v-if="running" v-on:click="control('stop')" class="button">{{ $t("stop") }}</div>
                        <div v-on:click="cache" class="button">{{ $t("cache") }}</div>
                    </div>
                    <div class="row section">{{ $t("export") }}</div>
                    <div class="row">
                        <div v-on:click="backup()" class="button">{{ $t("export_bridge") }}</div>
                    </div>
                    <div class="row section">{{ $t("details") }}</div>
                    <div class="row">
                        <label-field :title="$t('bridge_port')" style="flex: 1; padding-right: 5px;" :value="port" />
                        <label-field :title="$t('memory')" style="flex: 1; padding-right: 0; padding-left: 5px;" :value="heap" />
                    </div>
                    <div class="row">
                        <text-field :title="$t('name')" style="flex: 1; padding-right: 5px" v-model="display" />
                        <text-field :title="$t('bridge_pin')" style="flex: 1; padding-right: 0; padding-left: 5px" v-model="pin" />
                    </div>
                    <div class="row">
                        <text-field :title="$t('bridge_id')" style="flex: 1; padding-right: 5px" v-model="username" />
                        <select-field :title="$t('bridge_advertiser')" style="flex: 1; padding-right: 0; padding-left: 5px" :options="advertisers" v-model="advertiser" />
                    </div>
                    <div class="row">
                        <div v-on:click="generate()" class="button">{{ $t("bridge_generate_new_id") }}</div>
                    </div>
                    <div class="row section">{{ $t("service") }}</div>
                    <div class="row">
                        <integer-field :title="$t('bridge_autostart')" :description="$t('bridge_autostart_description')" :min="-1" :max="300" v-model="autostart" />
                    </div>
                    <div class="row" style="padding: 0 0 0 5px;">
                        <checkbox id="debugging" :title="$t('enable_debugging')" v-model="debugging" />
                    </div>
                    <div class="row section" style="margin-bottom: 10px">{{ $t("bridge_port_pool") }}</div>
                    <p style="margin-top: 0">{{ $t("bridge_port_pool_description") }}</p>
                    <div class="row">
                        <port-field :title="$t('bridge_port_pool_start')" style="flex: 1; padding-right: 5px" v-model="start" />
                        <port-field :title="$t('bridge_port_pool_end')" style="flex: 1; padding-right: 0; padding-left: 5px" v-model="end" />
                    </div>
                    <div class="row actions">
                        <div v-if="!loading" v-on:click="save()" class="button primary">{{ $t("save") }}</div>
                        <div v-on:click="remove()" class="button">{{ $t("remove") }}</div>
                        <router-link to="/bridges" class="button">{{ $t("cancel") }}</router-link>
                    </div>
                </div>
            </form>
            <div v-else-if="bridges.length > 0" class="screen grid">
                <div class="cards">
                    <router-link v-for="(bridge, index) in bridges" :key="`bridge:${index}`" :to="`/bridges/${bridge.id}`" class="card">
                        <div class="qr">
                            <qrcode v-if="details[bridge.id].setup_id" :value="details[bridge.id].setup_id" :options="{ width: 160, color: { dark: theme.widget.text.default, light: '#00000000' }}" />
                            <icon v-else name="alert" class="icon"></icon>
                        </div>
                        <div class="details">
                            <span class="title">{{ bridge.display }}</span>
                        </div>
                    </router-link>
                </div>
            </div>
            <div v-else class="initial desktop">
                <div class="message">
                    {{ $t("bridge_initilize") }}
                    <router-link to="/bridges/add">{{ $t("bridge_add") }}</router-link>
                </div>
            </div>
        </div>
        <div v-else class="loading">
            <spinner />
        </div>
    </div>
</template>

<script>
    import Sanitize from "@hoobs/sdk/lib/sanitize";

    import QRCodeComponent from "@chenfengyuan/vue-qrcode";
    import ListComponent from "@/components/elements/list.vue";

    import Validators from "../services/validators";
    import { mac } from "../services/formatters";

    const RESTART_LOADING_SAFETY = 1 * 60 * 1000;

    export default {
        name: "bridges",
        props: { id: String },
        components: { "qrcode": QRCodeComponent, "list": ListComponent },

        computed: {
            user() {
                return this.$store.state.user;
            },

            running() {
                return (this.$store.state.bridges.find((item) => item.id === this.id) || {}).running || false;
            },

            heap() {
                const bytes = (this.$store.state.bridges.find((item) => item.id === this.id) || {}).heap || 0;
                const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                if (bytes === 0) return "0 Bytes";

                const power = Math.floor(Math.log(bytes) / Math.log(1024));

                return `${parseFloat((bytes / (1024 ** power)).toFixed(1))} ${sizes[power]}`;
            },
        },

        data() {
            return {
                version: 0,
                loading: true,
                theme: null,
                bridges: [],
                subject: null,
                status: null,
                details: {},
                file: null,
                filename: null,
                display: "",
                pin: "031-45-154",
                username: "",
                port: 51826,
                autostart: 0,
                debugging: false,
                start: null,
                end: null,
                timer: null,
                advertiser: "bonjour",
                advertisers: [
                    { value: "bonjour", text: this.$t("bridge_bonjour") },
                    { value: "ciao", text: this.$t("bridge_ciao") },
                ],
            };
        },

        watch: {
            id(value) {
                this.load(value);
            },

            running() {
                if (this.loading && this.timer) this.loading = false;
                if (!(this.status || {}).setup_id) this.load(this.id);
                if (this.timer) clearTimeout(this.timer);

                this.timer = null;
            },
        },

        created() {
            this.$store.subscribe((mutation) => {
                if (mutation.type === "THEME:SET") this.load(this.id);
            });
        },

        async mounted() {
            this.load(this.id);
        },

        methods: {
            cache() {
                this.$dialog.open("cache", { bridge: this.id });
            },

            async load(id) {
                this.loading = true;
                this.theme = await this.$hoobs.theme.get(this.$store.state.theme);
                this.bridges = await this.$hoobs.bridges.list();

                this.bridges.sort((a, b) => {
                    if (a.display < b.display) return -1;
                    if (a.display > b.display) return 1;

                    return 0;
                });

                this.subject = null;
                this.status = null;
                this.details = {};
                this.file = null;
                this.filename = null;
                this.display = "";
                this.pin = "031-45-154";
                this.username = "";
                this.port = 51826;
                this.autostart = 0;
                this.debugging = false;
                this.advertiser = "bonjour";
                this.start = null;
                this.end = null;

                if (id && id !== "add" && id !== "hub" && id !== "") {
                    this.subject = await this.$hoobs.bridge(id);

                    if (this.subject) {
                        this.status = await this.subject.status();
                        this.port = this.status.bridge_port;
                        this.display = this.subject.display;
                        this.pin = this.subject.pin;
                        this.username = this.subject.username;
                        this.autostart = parseInt(this.subject.autostart, 10) || 0;
                        this.debugging = this.subject.debugging;
                        this.advertiser = this.subject.advertiser || "bonjour";

                        if (this.status.ports) {
                            this.start = this.status.ports.start;
                            this.end = this.status.ports.end;
                        }
                    }
                } else {
                    this.generate();
                    this.details = (await this.$hoobs.status()).bridges;
                    this.port = this.port || 50826;

                    const bridges = await this.$hoobs.bridges.list();

                    while (bridges.findIndex((item) => parseInt(`${item.port}`, 10) === this.port) >= 0) {
                        this.port += 10;
                    }
                }

                this.loading = false;
            },

            async control(action) {
                this.loading = true;

                switch (action) {
                    case "start":
                        await this.subject.start();

                        this.timer = setTimeout(() => { this.loading = false; }, RESTART_LOADING_SAFETY);
                        break;

                    case "stop":
                        await this.subject.stop();

                        this.loading = false;
                        break;

                    case "restart":
                        await this.subject.restart();

                        this.timer = setTimeout(() => { this.loading = false; }, RESTART_LOADING_SAFETY);
                        break;

                    default:
                        this.loading = false;
                        break;
                }
            },

            async save(create) {
                const validation = Validators.bridge(create, await this.$hoobs.bridges.list(), this.display, this.pin, this.port, this.username, this.autostart, this.start, this.end);

                let restart = false;

                if (validation.valid) {
                    if (create) {
                        this.loading = true;

                        if (this.file) {
                            await this.$hoobs.bridges.import(this.file, this.display, this.port, this.pin, this.username, this.advertiser);
                        } else {
                            await this.$hoobs.bridges.add(this.display, this.port, this.pin, this.username, this.advertiser);
                        }

                        this.bridges = await this.$hoobs.bridges.list();
                        this.$router.push({ path: `/bridges/${this.bridges.find((item) => item.id === Sanitize(this.display)).id}` });
                    } else if (this.subject) {
                        this.loading = true;

                        await this.subject.update(this.display, this.autostart, this.pin, this.username, this.advertiser, this.debugging);

                        if (this.start && this.end) {
                            restart = true;

                            await this.subject.ports(this.start, this.end);
                        }

                        if (restart) await this.subject.restart();

                        this.load(this.id);
                    }
                } else {
                    this.$alert(this.$t(validation.error));
                }
            },

            generate() {
                this.username = mac();
            },

            remove() {
                if (this.subject) {
                    this.$confirm(this.$t("remove"), this.$t("remove_bridge_warning"), async () => {
                        this.loading = true;

                        await this.subject.remove();

                        this.$router.push({ path: "/bridges" });
                    });
                }
            },

            async backup() {
                if (this.subject) {
                    this.loading = true;

                    const url = await this.subject.export();
                    const link = document.createElement("a");

                    this.loading = false;

                    link.href = url;
                    link.id = `bridge_${(new Date()).getTime()}`;
                    link.download = `${this.subject.id}.bridge`;
                    link.click();
                }
            },

            async upload() {
                if (this.$refs.file && this.$refs.file.files[0]) {
                    [this.file] = this.$refs.file.files;
                    this.filename = this.file.name;
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #bridges {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .content {
            flex: 1;
            display: flex;
            overflow: hidden;

            .screen {
                flex: 1;
                display: flex;
                margin: 0 20px 20px 10px;
                color: var(--widget-text);
                background: var(--widget-background);
                backdrop-filter: var(--transparency);
                overflow: auto;

                &.grid {
                    background: transparent;
                }

                .title {
                    font-size: 17px;
                }

                .wrapper {
                    max-width: 800px;
                }

                .field {
                    flex: 1;
                    padding-right: 0;
                    padding-left: 5px;

                    &:first-child {
                        padding-right: 5px;
                    }
                }

                .restarting {
                    display: flex;
                    align-items: center;
                }

                .actions {
                    padding-top: 0;
                }

                .cards {
                    display: flex;
                    flex-wrap: wrap;

                    .card {
                        width: 160px;
                        height: 205px;
                        position: relative;
                        margin: 0 0 10px 10px;
                        display: flex;
                        flex-direction: column;
                        color: var(--widget-text) !important;
                        text-decoration: none !important;
                        background: var(--widget-background);
                    }

                    .qr {
                        flex: 1;
                        display: flex;
                        justify-content: space-around;
                        align-items: center;

                        .icon {
                            color: var(--widget-highlight);
                            height: 30%;
                        }
                    }

                    .details {
                        padding: 0 17px 17px 17px;
                        display: flex;
                        flex-direction: column;
                        color: var(--widget-text);
                        text-decoration: none;
                        overflow: hidden;

                        .title {
                            font-size: 16px;
                            overflow: hidden;
                            text-align: center;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                    }
                }
            }

            .qrcode {
                margin: -10px -10px 5px -10px;
            }

            .initial {
                flex: 1;
                display: flex;
                flex-direction: row;
                padding: 0 20px 20% 20px;
                align-items: center;
                overflow: hidden;

                .message {
                    margin: 0 auto;
                }
            }
        }
    }
</style>
