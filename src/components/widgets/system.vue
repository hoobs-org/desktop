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
                    <td>{{ $t("cpu") }}</td>
                    <td>{{ cpu.load || 0 }}%</td>
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

            heap() {
                const bytes = this.$store.state.heap || 0;
                const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                if (bytes === 0) return "0 Bytes";

                const power = Math.floor(Math.log(bytes) / Math.log(1024));

                return `${parseFloat((bytes / (1024 ** power)).toFixed(1))} ${sizes[power]}`;
            },

            memory() {
                const bytes = (this.$store.state.heap || 0) + this.$store.state.bridges.map((item) => item.heap || 0).reduce((accumulator, item) => accumulator + item);
                const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                if (bytes === 0) return "0 Bytes";

                const power = Math.floor(Math.log(bytes) / Math.log(1024));

                return `${parseFloat((bytes / (1024 ** power)).toFixed(1))} ${sizes[power]}`;
            },
        },

        data() {
            return {
                node: "",
                version: "",
                updated: "",
                loading: true,
                system: {},
            };
        },

        async mounted() {
            const status = await this.$hoobs.status();

            this.version = status.version;
            this.node = status.node_version;

            this.updated = status.upgraded && status.cli_upgraded && status.node_upgraded;
            this.system = (await this.$hoobs.system()).system;

            this.loading = false;
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
        -ms-overflow-style: none;
        scrollbar-width: none;
        overflow: auto;
        cursor: default;

        &::-webkit-scrollbar {
            display: none;
        }

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
