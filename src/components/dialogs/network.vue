<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2021 HOOBS                                                                       |
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
    <modal :title="$t('network')" :draggable="true" width="780px" height="820px">
        <div id="network">
            <div v-if="!loading" class="content">
                <div v-if="!selected" class="form">
                    <div class="stack">
                        <div v-if="connected" class="item">
                            <div class="name">{{ $t("status") }}</div>
                            <div class="value">{{ $t("connected") }}</div>
                        </div>
                        <div class="item">
                            <div class="name">{{ $t("wifi") }}</div>
                            <div class="value">
                                <checkbox v-model="wireless" />
                            </div>
                        </div>
                        <div v-if="wireless && connection" class="item">
                            <div class="name">{{ connection.ssid }}</div>
                            <signal style="margin-right: 5px;" :quality="connection.quality" :secure="connection.security.mode && connection.security.mode !== '' && connection.security.mode !== 'none'" />
                        </div>
                    </div>
                    <div v-if="wireless" class="row section" style="margin: 0;">{{ $t("networks") }}</div>
                    <div v-if="!scanning && wireless" class="networks">
                        <div v-for="(network, index) in networks" :key="`network:${index}`" v-on:click="select(network)" class="item">
                            <div class="name">{{ network.ssid }}</div>
                            <signal :quality="network.quality" :secure="network.security.mode && network.security.mode !== '' && network.security.mode !== 'none'" />
                            <chevron class="chevron" />
                        </div>
                    </div>
                    <div v-else-if="wireless" class="status">
                        <div class="loading">
                            <spinner />
                        </div>
                    </div>
                </div>
                <div v-else class="form">
                    <div class="row input-field security">
                        <div class="password">
                            <password-field :description="message" :placeholder="$t('password')" v-model="password" />
                        </div>
                    </div>
                    <div class="row connect">
                        <div v-on:click="cancel" class="button">{{ $t("cancel") }}</div>
                        <div v-on:click="connect(selected)" class="button primary">{{ $t("connect") }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="status">
                <div class="loading">
                    <spinner />
                </div>
            </div>
            <div v-if="!loading" class="actions modal">
                <div v-on:click="$dialog.close('network')" class="button">{{ $t("cancel") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "netwsork",

        components: {
            "signal": () => import(/* webpackChunkName: "common" */ "@/components/elements/signal.vue"),
            "chevron": () => import(/* webpackChunkName: "common" */ "@/components/elements/chevron.vue"),
        },

        data() {
            return {
                loading: true,
                scanning: true,
                intermediate: true,
                connected: false,
                connection: null,
                connections: [],
                devices: [],
                hotspot: {},
                wireless: false,
                networks: [],
                selected: null,
                password: "",
            };
        },

        computed: {
            message() {
                return `${this.$t("wifi_password_message")} "${this.selected.ssid}"`;
            },
        },

        watch: {
            async wireless() {
                if (!this.intermediate) await this.confirm();

                this.intermediate = false;
            },
        },

        async mounted() {
            this.loading = true;
            this.scanning = true;

            await this.load();
            await this.scan();
        },

        methods: {
            async load() {
                this.selected = null;

                const status = (await this.$hoobs.network.status()) || {};

                this.connected = status.connected;
                [this.connection] = status.connections.filter((item) => item.ssid);
                this.connections = status.connections;
                this.devices = status.devices;
                this.hotspot = status.hotspot;
                this.wireless = status.wireless;

                this.loading = false;
                this.intermediate = false;
            },

            async scan() {
                let networks = [];

                if (this.wireless) networks = await this.$hoobs.networks();
                if (this.connection) networks = networks.filter((item) => item.ssid !== this.connection.ssid);

                this.networks = networks;
                this.scanning = false;
            },

            async confirm() {
                if (!this.wireless && this.connections.filter((item) => !item.ssid).length === 0) {
                    this.$confirm(this.$t("ok"), this.$t("wifi_disable_warning"), async () => {
                        await this.$hoobs.wireless.disable();
                        await this.load();
                    }, () => {
                        this.intermediate = true;
                        this.wireless = true;
                    });
                } else if (!this.wireless) {
                    await this.$hoobs.wireless.disable();
                    await this.load();
                } else {
                    await this.$hoobs.wireless.enable();
                    await this.load();
                    await this.scan();
                }
            },

            select(network) {
                this.password = "";

                if (network.security.mode && network.security.mode !== "" && network.security.mode !== "none") {
                    this.selected = { ...network };
                } else {
                    this.connect(network);
                }
            },

            async connect(network) {
                this.loading = true;
                this.scanning = true;

                const iface = ((this.devices || []).find((device) => device.type === "wifi") || {}).iface || null;

                await this.$hoobs.wireless.connect(iface, network.ssid, this.password);

                await this.load();
                await this.scan();
            },

            async cancel() {
                await this.load();
                await this.scan();
            },
        },
    };
</script>

<style lang="scss" scoped>
    #network {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
        overflow: hidden;

        .content {
            overflow: hidden;

            .form {
                overflow: hidden;

                .stack {
                    display: flex;
                    flex-direction: column;

                    .item {
                        display: flex;
                        align-items: center;
                        padding: 14px 7px;
                        border-top: var(--modal-border) 1px solid;

                        &:first-child {
                            border-top: 0 none;
                        }

                        .name {
                            flex: 1;
                            opacity: 0.7
                        }
                    }
                }

                .security {
                    padding: 14px;
                    margin: 0 0 10px 0;
                    background: var(--widget-background);

                    .password {
                        flex: 1;
                        padding: 10px 0 0 10px;
                    }
                }

                .connect {
                    justify-content: flex-end;

                    .button {
                        margin: 0 0 0 10px;
                    }
                }

                .networks {
                    flex: 1;
                    overflow: auto;

                    .item {
                        display: flex;
                        align-items: center;
                        padding: 14px 7px;
                        border-top: var(--modal-border) 1px solid;
                        cursor: pointer;

                        &:first-child {
                            border-top: 0 none;
                        }

                        .name {
                            flex: 1;
                            opacity: 0.7;
                        }

                        .chevron {
                            opacity: 0.7;
                        }

                        &:hover {
                            .name {
                                opacity: 1;
                            }

                            .chevron {
                                opacity: 1;
                            }
                        }
                    }
                }
            }
        }

        .status {
            height: 40%;
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
