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
    <modal :title="$t('hub_settings')" :draggable="true" width="780px" height="920px">
        <div id="settings">
            <div v-if="!loading" class="content">
                <restore v-if="show.restore" v-on:restore="() => { show.cancel = false; }" />
                <location v-if="show.location" v-on:update="select" />
                <div v-if="show.settings" class="form">
                    <div v-if="(product === 'box' || product === 'card') && mdns" class="row section">{{ $t("hostname") }}</div>
                    <div v-if="(product === 'box' || product === 'card') && mdns" class="row input-field">
                        <text-field :description="$t('hostname_description')" v-model="hostname" />
                    </div>
                    <div v-if="(product === 'box' || product === 'card') && mdns" class="row title label">{{ $t("access_url") }}</div>
                    <div v-if="(product === 'box' || product === 'card') && mdns" class="row title url">{{ `http://${broadcast}` }}</div>
                    <div v-if="user.permissions.reboot" class="row section" style="margin-bottom: 7px;">{{ $t("backup_restore") }}</div>
                    <div v-if="user.permissions.reboot" class="row">
                        <div v-on:click="backup()" class="button">{{ $t("backup") }}</div>
                        <div v-on:click="restore()" class="button">{{ $t("restore") }}</div>
                    </div>
                    <div class="row section">{{ $t("weather") }}</div>
                    <div class="row">
                        <div style="width: 180px;">
                            <div class="row title">{{ $t("temperature_units") }}</div>
                            <div class="row">
                                <radio id="celsius" name="units" :title="$t('celsius')" v-model="units" value="celsius" />
                            </div>
                            <div class="row">
                                <radio id="fahrenheit" name="units" :title="$t('fahrenheit')" v-model="units" value="fahrenheit" />
                            </div>
                        </div>
                        <div style="flex: 1;">
                            <div class="row title">{{ $t("location") }}</div>
                            <div class="row">
                                <input type="submit" class="hidden-submit" value="submit" />
                                <div v-on:click="change()" class="button">{{ $t("change") }}</div>
                                <div class="location">
                                    <div v-if="location" class="details">
                                        <div>
                                            {{ $t("location_city") }}
                                            <span class="value">{{ location.name }}</span>
                                        </div>
                                        <div>
                                            {{ $t("location_country") }}
                                            <span class="value">{{ (country.find((country) => country.value === location.country) || {}).text || location.country }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row section">{{ $t("monitor") }}</div>
                    <div class="row input-field">
                        <integer-field :description="$t('update_interval_description')" :min="2" :max="300" v-model="interval" />
                    </div>
                    <div v-if="user.permissions.reboot" class="row section" style="margin-bottom: 7px;">{{ $t("cache") }}</div>
                    <div v-if="user.permissions.reboot" class="row">
                        <div v-on:click="purge()" class="button">{{ $t("purge_cache") }}</div>
                    </div>
                    <div v-if="user.permissions.reboot" class="row section" style="margin-bottom: 7px;">{{ $t("system") }}</div>
                    <div v-if="user.permissions.reboot" class="row">
                        <div v-if="platform !== 'docker'" v-on:click="reboot()" class="button">{{ $t("reboot") }}</div>
                        <div v-if="platform !== 'docker'" v-on:click="shutdown()" class="button">{{ $t("shutdown") }}</div>
                        <div v-on:click="reset()" class="button">{{ $t("factory_reset") }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="status">
                <div class="loading">
                    <spinner :value="message" />
                </div>
                <div class="messages" style="height: 70%;">
                    <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" :compact="true" />
                </div>
            </div>
            <div v-if="!loading && (show.restore || show.location)" class="actions modal">
                <div v-if="show.cancel" class="button" v-on:click="back()">{{ $t("cancel") }}</div>
            </div>
            <div v-if="!loading && show.settings" class="actions modal">
                <div v-on:click="$dialog.close('settings')" class="button">{{ $t("cancel") }}</div>
                <div v-on:click="save()" class="button primary">{{ $t("apply") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    import Countries from "@/lang/countries.json";

    import MessageComponent from "@/components/elements/message.vue";
    import RestoreComponent from "@/components/dialogs/restore.vue";
    import LocationComponent from "@/components/dialogs/location.vue";

    const REDIRECT_DELAY = 1000;

    export default {
        name: "settings",

        components: {
            "restore": RestoreComponent,
            "location": LocationComponent,
            "message": MessageComponent,
        },

        computed: {
            user() {
                return this.$store.state.user;
            },

            mdns() {
                return this.$store.state.mdns;
            },

            broadcast() {
                return this.$store.state.broadcast;
            },

            product() {
                return this.$store.state.product;
            },

            platform() {
                return this.$store.state.platform;
            },

            hostname: {
                get() {
                    return this.url;
                },

                set(value) {
                    let formatted = value || "";

                    formatted = formatted.replace("https://", "");
                    formatted = formatted.replace("http://", "");
                    formatted = formatted.replace(/ /g, "-");
                    formatted = formatted.split(".")[0]; // eslint-disable-line prefer-destructuring

                    this.url = formatted;
                },
            },
        },

        data() {
            return {
                loading: true,
                show: {
                    settings: true,
                    restore: false,
                    location: false,
                    cancel: true,
                },
                url: "",
                logger: null,
                location: {},
                units: "celsius",
                interval: 5,
                country: Countries,
                messages: [],
                message: "",
            };
        },

        async mounted() {
            const config = await this.$hoobs.config.get();

            this.url = `${this.broadcast}`;
            this.interval = (config.api || {}).polling_seconds || 5;
            this.units = (config.weather || {}).units || "celsius";
            this.location = (config.weather || {}).location;
            this.loading = false;
        },

        watch: {
            interval() {
                if (this.interval < 2) this.interval = 2;
                if (this.interval > 300) this.interval = 300;
            },
        },

        methods: {
            change() {
                this.show.settings = false;
                this.show.restore = false;
                this.show.location = true;
            },

            async backup() {
                this.loading = true;

                this.messages.push({
                    level: "info",
                    bridge: "hub",
                    display: "hub",
                    timestamp: new Date().getTime(),
                    message: "generating backup",
                }, {
                    level: "info",
                    bridge: "hub",
                    display: "hub",
                    timestamp: new Date().getTime(),
                    message: ".",
                });

                const interval = setInterval(() => {
                    if ((this.messages[this.messages.length - 1] || {}).message === ".................................") {
                        (this.messages[this.messages.length - 1] || {}).message = ".";
                    } else {
                        (this.messages[this.messages.length - 1] || {}).message += ".";
                    }
                }, 500);

                const url = await this.$hoobs.backup.execute();
                const link = document.createElement("a");

                this.loading = false;
                this.messages = [];

                link.href = url;
                link.id = `backup_${(new Date()).getTime()}`;
                link.download = "hoobs.backup";
                link.click();

                clearInterval(interval);
            },

            restore() {
                this.show.settings = false;
                this.show.location = false;
                this.show.restore = true;
            },

            reboot() {
                this.$confirm(this.$t("reboot"), this.$t("reboot_warning"), async () => {
                    this.loading = true;

                    this.messages.push({
                        level: "warn",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: "device reboot command received",
                    }, {
                        level: "info",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: "rebooting",
                    }, {
                        level: "info",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: ".",
                    });

                    setInterval(() => {
                        if (this.messages[this.messages.length - 1].message === ".................................") {
                            this.messages[this.messages.length - 1].message = ".";
                        } else {
                            this.messages[this.messages.length - 1].message += ".";
                        }
                    }, 500);

                    this.messages = this.messages.slice(Math.max(this.messages.length - 100, 0));

                    await (await this.$hoobs.system()).reboot();

                    this.$action.on("io", "disconnected", () => {
                        this.$action.emit("io", "reload");

                        setTimeout(() => {
                            this.$dialog.close("settings");
                        }, REDIRECT_DELAY);
                    });
                });
            },

            shutdown() {
                this.$confirm(this.$t("shutdown"), this.$t("shutdown_warning"), async () => {
                    this.loading = true;

                    this.messages.push({
                        level: "warn",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: "device shutdown command received",
                    }, {
                        level: "info",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: "shutting down",
                    }, {
                        level: "info",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: ".",
                    });

                    setInterval(() => {
                        if (this.messages[this.messages.length - 1].message === ".................................") {
                            this.messages[this.messages.length - 1].message = ".";
                        } else {
                            this.messages[this.messages.length - 1].message += ".";
                        }
                    }, 500);

                    this.messages = this.messages.slice(Math.max(this.messages.length - 100, 0));

                    await (await this.$hoobs.system()).shutdown();

                    this.$action.on("io", "disconnected", () => {
                        this.$dialog.close("settings");
                    });
                });
            },

            purge() {
                this.$confirm(this.$t("purge"), this.$t("purge_hub_warning"), async () => {
                    this.loading = true;

                    await (await this.$hoobs.system()).purge();

                    this.loading = false;
                });
            },

            async clear(id) {
                const bridge = await this.$hoobs.bridge(id);

                await bridge.purge();
            },

            reset() {
                this.$confirm(this.$t("reset"), this.$t("reset_warning"), async () => {
                    this.loading = true;

                    this.messages.push({
                        level: "warn",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: "service restart command received",
                    }, {
                        level: "info",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: "restarting",
                    }, {
                        level: "info",
                        bridge: "hub",
                        display: "hub",
                        timestamp: new Date().getTime(),
                        message: ".",
                    });

                    setInterval(() => {
                        if (this.messages[this.messages.length - 1].message === ".................................") {
                            this.messages[this.messages.length - 1].message = ".";
                        } else {
                            this.messages[this.messages.length - 1].message += ".";
                        }
                    }, 500);

                    this.messages = this.messages.slice(Math.max(this.messages.length - 100, 0));

                    await (await this.$hoobs.system()).reset();

                    this.$action.on("io", "disconnected", () => {
                        this.$action.emit("io", "reload");

                        setTimeout(() => {
                            this.$dialog.close("settings");
                        }, REDIRECT_DELAY);
                    });
                });
            },

            async save() {
                this.loading = true;
                this.message = `${this.$t("saving_changes")}...`;

                const config = await this.$hoobs.config.get();
                const weather = {};

                if ((this.product === "box" || this.product === "card") && this.url !== "" && this.url !== this.broadcast) {
                    await this.$hoobs.hostname.update(this.broadcast);
                }

                if (this.location && this.location.id && this.location.id > 0) weather.location = this.location;
                if (!config.api) config.api = {};

                weather.units = this.units.toLowerCase() === "celsius" ? "celsius" : "fahrenheit";
                config.weather = weather;
                config.api.polling_seconds = this.interval < 2 ? 2 : this.interval;

                await this.$hoobs.config.update(config);

                this.message = `${this.$t("applying_changes")}...`;

                this.$dialog.close("settings");
                this.$action.emit("settings", "update");
            },

            back() {
                this.show.settings = true;
                this.show.restore = false;
                this.show.location = false;
            },

            select(location) {
                this.location = location;
                this.back();
            },
        },
    };
</script>

<style lang="scss" scoped>
    #settings {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;

        .spaced {
            margin: 20px 0 0 0;
        }

        .label {
            margin: -10px 0 0 0 !important;
            padding: 0 !important;
        }

        .url {
            color: var(--modal-highlight);
            user-select: all !important;
        }

        .input-field {
            width: 250px;
        }

        .location {
            display: flex;
            flex-direction: column;

            .details {
                flex: 1;
                display: flex;
                flex-direction: column;
                margin: 4px 0 0 7px;
                font-size: 13px;
                user-select: none;

                .value {
                    font-weight: bold;
                }
            }
        }

        .status {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            margin: 0 14px 0 0;

            .loading {
                flex: 1;
                padding: 0 0 4% 0;
            }
        }
    }
</style>
