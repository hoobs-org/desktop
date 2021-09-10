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
    <div id="widget">
        <div class="status">
            <div v-if="bridges.filter((item) => item.running).length === bridges.length" class="running">
                <div class="up all"></div>
                <div class="title">{{ $t("bridges_up") }}</div>
            </div>
            <div v-else-if="bridges.filter((item) => item.running).length > 0" class="running">
                <div class="up partial"></div>
                <div class="title">{{ bridges.filter((item) => item.running).length }} {{ $t("of") }} {{ bridges.length }} {{ $t("bridges_partial") }}</div>
            </div>
            <div v-else class="running">
                <div class="up none"></div>
                <div class="title">{{ $t("bridges_none") }}</div>
            </div>
        </div>
        <table v-if="!loading">
            <tbody>
                <tr>
                    <td>{{ $t("version") }}</td>
                    <td v-if="!updated">
                        {{ version }}
                        <a v-if="user.permissions.reboot" v-on:click.stop="$dialog.open('updates')" class="update">{{ $t("update_avaliable") }}</a>
                    </td>
                    <td v-else>
                        {{ version }}
                        <a v-if="user.permissions.reboot" v-on:click.stop="$dialog.open('updates')" class="update">{{ $t("check_updates") }}</a>
                    </td>
                </tr>
                <tr>
                    <td>{{ $t("version_node") }}</td>
                    <td>{{ node }}</td>
                </tr>
                <tr>
                    <td>{{ $t("version_homebridge") }}</td>
                    <td>{{ homebridge }}</td>
                </tr>
                <tr>
                    <td>{{ $t("cpu") }}</td>
                    <td>{{ cpu.used || 0 }}%</td>
                </tr>
                <tr>
                    <td>{{ $t("memory") }}</td>
                    <td>{{ memory }} ({{ heap }})</td>
                </tr>
                <tr v-for="(value, index) in Object.keys(system)" :key="`value:${index}`">
                    <td>{{ $t(`system_${value}`) }}</td>
                    <td>{{ system[value] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    export default {
        name: "system-widget",

        computed: {
            user() {
                return this.$store.state.user;
            },

            bridges() {
                return this.$store.state.bridges;
            },

            cpu() {
                return this.$store.state.cpu;
            },

            version() {
                return this.$store.state.version.hoobsd;
            },

            node() {
                return this.$store.state.version.node;
            },

            homebridge() {
                return this.$store.state.version.homebridge;
            },

            updated() {
                return this.$store.state.version.updated;
            },

            heap() {
                const bytes = this.$store.state.heap || 0;
                const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                if (bytes === 0) return "0 Bytes";

                const power = Math.floor(Math.log(bytes) / Math.log(1024));

                return `${parseFloat((bytes / (1024 ** power)).toFixed(1))} ${sizes[power]}`;
            },

            memory() {
                let bytes = this.$store.state.heap || 0;
                const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                if (this.$store.state.bridges && this.$store.state.bridges.length > 0) bytes += this.$store.state.bridges.map((item) => item.heap || 0).reduce((accumulator, item) => accumulator + item);
                if (bytes === 0) return "0 Bytes";

                const power = Math.floor(Math.log(bytes) / Math.log(1024));

                return `${parseFloat((bytes / (1024 ** power)).toFixed(1))} ${sizes[power]}`;
            },
        },

        data() {
            return {
                loading: true,
                system: {},
            };
        },

        mounted() {
            this.$hoobs.system().then((response) => {
                this.system = response.system;
            }).finally(() => {
                this.loading = false;
            });
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        padding: 20px;
        overflow: auto;
        cursor: default;

        .status {
            display: flex;
            flex-direction: row;
            padding: 10px 10px 20px 10px;
            user-select: none;

            .running {
                display: flex;
                flex-direction: row;
                align-items: center;
                font-size: 14px;
            }

            .up {
                width: 24px;
                height: 24px;
                border-radius: 100%;
                background: var(--widget-text);
                margin: 0 14px 0 0;

                &.all {
                    background: #07963d;
                }

                &.partial {
                    background: #feb400;
                }

                &.none {
                    background: #e30505;
                }
            }
        }

        .update {
            margin: 0 0 0 14px;
        }

        table {
            width: 100%;
            border-spacing: 0;

            tr {
                td {
                    width: 30%;
                    height: 26px;
                    min-height: 26px;
                    padding: 10px;
                    text-align: left;
                    font-size: 13px;
                    border-top: 1px var(--widget-border) solid;

                    &:first-child {
                        user-select: none;
                    }

                    &:last-child {
                        width: 70%;
                        word-break: break-all;
                    }
                }
            }
        }
    }
</style>
