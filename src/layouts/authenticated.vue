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
            <div v-if="snack" class="snack">
                <notification :message="snack.notification" :snack="true" />
            </div>
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
    import NavigationComponent from "@/components/navigation.vue";
    import NotificationComponent from "@/components/elements/notification.vue";

    const SOCKET_RECONNECT_DELAY = 0.5 * 1000;

    export default {
        name: "authenticated",

        components: {
            "navigation": NavigationComponent,
            "notification": NotificationComponent,
        },

        computed: {
            current() {
                return this.$store.state.current;
            },

            notifications() {
                return this.$store.state.notifications;
            },

            snack() {
                return this.$store.state.latest;
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
                this.io.connect(this.current.ip, this.current.port);
                this.$action.emit("log", "history");

                this.$store.commit("AUTH:STATE", (await this.$hoobs.auth.status()));

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

        .tray {
            position: absolute;
            top: 2px;
            right: 0;
            display: flex;
            padding: 0 0 0 10px;
            justify-content: flex-end;
            z-index: 1100;

            .icon {
                width: 28px;
                height: 20px;
                padding: 4px 0;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: relative;
                border-radius: 100%;
                margin: 5px 0;
                cursor: pointer;

                .active {
                    font-size: 32px;
                    position: absolute;
                    right: 4px;
                    color: var(--application-error-text);
                }

                &:last-child {
                    margin: 5px 10px 5px 0;
                }

                &:hover {
                    color: var(--application-highlight-text);
                }
            }
        }

        .snack {
            width: 370px;
            position: absolute;
            bottom: 7px;
            right: 0;
        }
    }
</style>
