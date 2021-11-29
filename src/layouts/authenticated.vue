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
    <div v-on:click="$menu.close()" id="authenticated">
        <navigation :class="(loading || dialogs > 0) ? 'disable' : 'enable'" />
        <div v-if="!loading" :class="dialogs > 0 ? 'screen disable' : 'screen'">
            <slot />
            <menu-view />
        </div>
        <div v-else class="disconnected">
            <context :login="true" />
            <div class="loading">
                <spinner v-if="dialogs <= 0" />
            </div>
        </div>
        <dialog-view />
    </div>
</template>

<script>
    import { decompressJson } from "../services/json";
    import NavigationComponent from "@/components/navigation.vue";

    const SOCKET_RECONNECT_DELAY = 0.5 * 1000;

    export default {
        name: "authenticated",

        components: {
            "navigation": NavigationComponent,
        },

        computed: {
            current() {
                return this.$store.state.current;
            },
        },

        data() {
            return {
                reload: false,
                loading: true,
                dialogs: 0,
            };
        },

        async created() {
            if (this.current) {
                this.io.on("connect", () => this.$action.emit("io", "connected"));
                this.io.on("reconnect", () => this.$action.emit("io", "connected"));
                this.io.on("disconnect", () => this.$action.emit("io", "disconnected"));

                this.io.on("log", (data) => this.$action.emit("io", "log", decompressJson(data)));
                this.io.on("monitor", (data) => this.$action.emit("io", "monitor", decompressJson(data)));
                this.io.on("notification", (data) => this.$action.emit("io", "notification", decompressJson(data)));
                this.io.on("accessory_change", (data) => this.$action.emit("io", "accessory_change", decompressJson(data)));
                this.io.on("room_change", (data) => this.$action.emit("io", "room_change", decompressJson(data)));

                this.io.connect(this.current.ip, this.current.port);

                this.$action.emit("log", "history");

                const status = { ...(await this.$hoobs.status() || {}), auth: await this.$hoobs.auth.status() };

                this.$store.commit("AUTH:STATE", status.auth);
                this.$store.commit("VERSION:STATE", status);
                this.$store.commit("MDNS:STATE", status.mdns);
                this.$store.commit("BROADCAST:STATE", status.broadcast);
                this.$store.commit("PRODUCT:STATE", status.product);
                this.$store.commit("TERMINAL:STATE", status.terminal);
                this.$store.commit("PLATFORM:STATE", status.platform);

                this.$action.on("io", "connected", () => {
                    setTimeout(async () => {
                        if (this.reload) {
                            window.location.reload();
                        } else {
                            this.loading = false;
                        }
                    }, SOCKET_RECONNECT_DELAY);
                });

                this.$action.on("io", "disconnected", () => {
                    this.loading = true;
                });

                this.$action.on("io", "reload", () => {
                    this.reload = true;
                });

                this.$action.on("app", "update", async (payload) => {
                    const file = await this.$electron.download(payload.url, `hoobs-desktop-v${payload.version}.${this.$os === "mac" ? "dmg" : "exe"}`);

                    if (file) {
                        const error = await this.$electron.open(file);

                        if (error && error !== "") {
                            this.$alert(error);
                        } else {
                            this.$electron.quit();
                        }
                    } else {
                        this.$alert("Unable to download update.");
                    }
                });

                this.$dialog.on("open", () => {
                    this.dialogs += 1;
                });

                this.$dialog.on("close", () => {
                    this.dialogs -= 1;
                });
            }
        },

        async mounted() {
            this.$scanner.stop();

            if (this.current) {
                this.$scanner.detect(this.current.ip, this.current.port).then(async (response) => {
                    if (response) {
                        this.loading = false;
                    } else {
                        this.exit();
                    }
                }).catch(() => {
                    this.exit();
                });
            } else {
                this.exit();
            }
        },

        methods: {
            exit() {
                this.$store.commit("IO:DEVICE:SET", null);
                this.$router.push({ path: "/login", query: { scan: "true", url: "/" } });
            },
        },
    };
</script>

<style lang="scss">
    #authenticated {
        width: 100%;
        height: 100%;
        display: flex;
        font-family: "Montserrat", sans-serif;
        color: var(--application-text);
        background: var(--application-background);
        overflow: hidden;

        .disable {
            opacity: 0.5;
            pointer-events: none;
            user-select: none;
        }

        .screen {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }

        .disconnected {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .form {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 20px;

            .spacer {
                margin: 7px 0 14px 0;
            }

            .grid {
                display: grid;
                grid-template-columns: auto auto;
            }

            .row {
                display: flex;
                flex-direction: row;

                &.section {
                    padding: 20px 0 10px 0;
                    border-bottom: var(--application-border) 1px solid;
                    color: var(--application-highlight);
                    margin: 0 0 20px 0;
                    user-select: none;

                    &:first-child {
                        padding: 0 0 10px 0;
                    }
                }

                &.actions {
                    padding: 20px 0 10px 0;
                    margin: 0;
                    user-select: none;

                    &:first-child {
                        padding: 0 0 10px 0;
                    }
                }

                &.title {
                    padding: 0 0 7px 0;
                    user-select: none;
                }
            }
        }
    }
</style>
