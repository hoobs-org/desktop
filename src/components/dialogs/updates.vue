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
    <modal :title="$t('updates')" :draggable="true" width="740px" height="547px">
        <div id="updates">
            <div class="content">
                <div v-if="!loading && !updating" class="form">
                    <div v-if="client" class="row section">{{ $t("desktop") }}</div>
                    <div v-if="client" class="row">
                        {{ $t("version_desktop") }}: {{ desktop.version }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="plugins.length > 0" class="row section">{{ $t("plugins") }}</div>
                    <div v-if="plugins.length > 0">
                        <div v-for="(plugin, index) in plugins" :key="`plugin:${index}`" class="row">
                            {{ $hoobs.repository.title(plugin.name) }}: {{ plugin.latest }}
                            <span class="value">{{ $t("available") }}</span>
                        </div>
                    </div>
                    <div v-if="stack" class="row section">{{ $t("software") }}</div>
                    <div v-if="!status.upgraded" class="row">
                        {{ $t("version_server") }}: {{ status.current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!status.gui_upgraded" class="row">
                        {{ $t("version_gui") }}: {{ status.gui_current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!status.cli_upgraded" class="row">
                        {{ $t("version_cli") }}: {{ status.cli_current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="!status.node_upgraded" class="row">
                        {{ $t("version_node") }}: {{ status.node_current }}
                        <span class="value">{{ $t("available") }}</span>
                    </div>
                    <div v-if="status.upgradable.length > 0" class="row section">{{ $t("system") }}</div>
                    <div v-if="status.upgradable.length > 0">
                        <div v-for="(application, index) in status.upgradable" :key="`application:${index}`" class="row">
                            {{ $hoobs.repository.title(application.package) }}: {{ application.available }}
                            <span class="value">{{ $t("available") }}</span>
                        </div>
                    </div>
                    <div v-if="updated" class="row updated">
                        <icon name="update" class="icon" />
                        <div class="text">{{ $t("updated") }}</div>
                    </div>
                </div>
                <div v-else class="status">
                    <div class="loading">
                        <spinner />
                    </div>
                    <div class="messages" style="height: 50%;">
                        <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" :compact="true" />
                    </div>
                </div>
            </div>
            <div class="actions modal">
                <div v-if="!updating" v-on:click="$dialog.close('updates')" class="button">{{ $t("cancel") }}</div>
                <div v-if="!loading && !updating && (plugins.length > 0 || client || stack || status.upgradable.length > 0)" v-on:click="upgrade()" class="button primary">{{ $t("update") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    import Semver from "compare-versions";
    import Request from "@hoobs/sdk/lib/request";

    import MessageComponent from "@/components/elements/message.vue";

    import { cloneJson } from "../../services/json";

    export default {
        name: "updates",

        components: {
            "message": MessageComponent,
        },

        data() {
            return {
                loading: true,
                logging: false,
                desktop: {},
                status: {},
                version: "",
                plugins: [],
                client: false,
                stack: false,
                updated: false,
                updating: false,
                messages: [],
            };
        },

        async mounted() {
            this.load();
        },

        methods: {
            async load() {
                this.loading = true;

                this.status = await (await this.$hoobs.system()).updates();
                this.version = await this.$hoobs.version();

                this.desktop = (((await Request.get(`https://support.hoobs.org/api/releases/desktop/${this.status.repo === "edge" || this.status.repo === "bleeding" ? "beta" : "latest"}`)).data) || {}).results;
                this.plugins = ((await this.$hoobs.plugins()) || []).filter((item) => !Semver.compare(item.version, item.latest, ">="));
                this.status.upgradable = this.status.upgradable || [];

                if (!this.status.gui_version) this.status.gui_upgraded = true;

                this.client = !Semver.compare(this.$version, this.desktop.version || this.$version, ">=");
                this.stack = !(this.status.upgraded && this.status.cli_upgraded && this.status.node_upgraded && this.status.gui_upgraded);
                this.updated = !(this.client || this.stack || this.plugins.length > 0 || this.status.upgradable.length > 0);

                this.loading = false;
                this.updating = false;

                const status = { ...(await this.$hoobs.status() || {}), auth: await this.$hoobs.auth.status() };

                this.$store.commit("VERSION:STATE", status);
                this.$store.commit("TERMINAL:STATE", status.terminal);
                this.$store.commit("PLATFORM:STATE", status.platform);

                this.$action.emit("dashboard", "update");
            },

            async upgrade() {
                this.updating = true;
                this.logging = true;
                this.messages = [];

                this.$store.subscribe(async (mutation) => {
                    if (mutation.type === "IO:LOG" && this.logging) {
                        if (!mutation.payload.bridge || mutation.payload.bridge === "hub" || mutation.payload.bridge === "") {
                            this.messages.push(mutation.payload);
                            this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));
                        }

                        if ((mutation.payload.message || "").toLowerCase().indexOf("service restart") >= 0) {
                            this.logging = false;

                            this.messages.push({
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

                            this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));

                            setInterval(() => {
                                if (this.messages[this.messages.length - 1].message === ".................................") {
                                    this.messages[this.messages.length - 1].message = ".";
                                } else {
                                    this.messages[this.messages.length - 1].message += ".";
                                }
                            }, 500);

                            this.messages = this.messages.slice(Math.max(this.messages.length - 12, 0));
                        }
                    }
                });

                const waits = [];

                for (let i = 0; i < this.plugins.length; i += 1) {
                    const plugin = cloneJson(this.plugins[i]);

                    waits.push(new Promise((resolve) => {
                        this.$hoobs.bridge(plugin.bridge).then((bridge) => {
                            bridge.plugins.upgrade(plugin.identifier).then(() => {
                                resolve();
                            });
                        });
                    }));
                }

                await Promise.all(waits);

                if (this.stack || this.status.upgradable.length > 0) {
                    await (await this.$hoobs.system()).upgrade();

                    if (this.client) {
                        this.$action.emit("app", "update", { url: this.desktop[`download_${this.$os}`], version: this.desktop.version });
                    } else {
                        this.$action.on("io", "disconnected", () => {
                            this.$action.emit("io", "reload");
                            this.$dialog.close("updates");
                        });
                    }
                } else if (this.client) {
                    this.$action.emit("app", "update", { url: this.desktop[`download_${this.$os}`], version: this.desktop.version });
                } else {
                    this.$dialog.close("updates");
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #updates {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;

        .form {
            overflow: auto;
            max-height: 380px;
        }

        .value {
            font-weight: bold;
            margin: 0 4px;
        }

        .loading {
            margin: 7px 0 0 0;
        }

        .updated {
            flex: 1;
            align-items: center;
            margin: 0 auto;
            padding-bottom: 10%;

            .icon {
                height: 37px;
                color: var(--modal-highlight);
            }

            .text {
                font-size: 22px;
                margin: 0 0 0 14px;
            }
        }

        .status {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;

            .loading {
                flex: 1;
                padding: 0 0 4% 0;
            }
        }
    }
</style>
