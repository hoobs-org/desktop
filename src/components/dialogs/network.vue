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
                <div class="form">
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
                        <div v-if="connection" class="item">
                            <div class="name">{{ connection.ssid }}</div>
                            <signal style="margin-right: 5px;" :quality="connection.quality" :secure="connection.security.mode && connection.security.mode !== '' && connection.security.mode !== 'none'" />
                        </div>
                    </div>
                    <div class="row section" style="margin: 0;">{{ $t("networks") }}</div>
                    <div v-if="!scanning" class="networks">
                        <div v-for="(network, index) in networks" :key="`network:${index}`" class="item">
                            <div class="name">{{ network.ssid }}</div>
                            <signal :quality="network.quality" :secure="network.security.mode && network.security.mode !== '' && network.security.mode !== 'none'" />
                            <chevron class="chevron" />
                        </div>
                    </div>
                    <div v-else class="status">
                        <div class="loading">
                            <spinner />
                        </div>
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
                connected: false,
                connection: null,
                devices: [],
                hotspot: {},
                wireless: false,
                networks: [],
            };
        },

        async mounted() {
            const status = (await this.$hoobs.network.status()) || {};

            this.loading = false;

            this.connected = status.connected;
            [this.connection] = status.connections;
            this.devices = status.devices;
            this.hotspot = status.hotspot;
            this.wireless = status.wireless;

            if (this.wireless) this.networks = (await this.$hoobs.networks()).filter((item) => item.ssid !== this.connection.ssid);

            this.scanning = false;
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
