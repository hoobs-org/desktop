<template>
    <div v-if="connected > 0" id="log">
        <div class="actions">
            <div v-on:click.stop="$store.commit('toggleMenu', 'logFilter')" title="Filters" class="icon">router</div>
            <div class="action-seperator"></div>
            <div v-on:click="refresh()" title="Refresh Configuration" class="icon">refresh</div>
        </div>
        <div class="messages" ref="messages">
            <div v-if="show.loading && messages.length === 0" class="loading">
                <div class="loading-message">Loading...</div>
                <marquee :height="3" color="#feb400" background="#856a3b" />
            </div>
            <span class="message" v-for="(entry, midx) in messages.filter(m => expression.test(m.message))" :key="midx" v-html="colorCodeDevice(entry.message)"></span>
        </div>
        <dropdown v-if="menus['logFilter']" v-on:click.stop.prevent class="filter-menu">
            <div v-on:click.stop v-for="(device) in devices" :key="`${device.mac}:${device.port}`" class="item">
                <checkbox :value="`^\\[${device.hostname}\\]`" theme="light" v-model="filters">{{ device.hostname }}</checkbox>
            </div>
        </dropdown>
    </div>
    <loader v-else id="loader" value="Connecting..." />
</template>

<script>
    export default {
        name: "log",

        data() {
            return {
                show: {
                    loading: false
                },
                devices: [],
                filters: [],
                expression: new RegExp("^\\[\\]")
            }
        },

        computed: {
            menus() {
                return this.$store.state.menus;
            },

            connected() {
                return this.$store.state.connected;
            },

            messages() {
                return this.$store.state.messages;
            }
        },

        mounted() {
            if (this.connected > 0) {
                this.devices = this.Settings.get("devices");
                this.filters = this.devices.map(d => `^\\[${d.hostname}\\]`);
                this.expression = new RegExp(`^\\[\\]${this.filters.length > 0 ? `|${this.filters.join("|")}` : ""}`);

                if (this.messages.length > 0) {
                    this.show.loading = false;
                }

                setTimeout(() => {
                    if (this.$refs.messages) {
                        this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
                    }
                }, 10);
            }
        },

        updated() {
            if (this.connected > 0) {
                if (this.messages.length > 0) {
                    this.show.loading = false;
                }

                setTimeout(() => {
                    if (this.$refs.messages) {
                        this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
                    }
                }, 10);
            }
        },

        watch: {
            filters() {
                this.expression = new RegExp(`^\\[\\]${this.filters.length > 0 ? `|${this.filters.join("|")}` : ""}`);
            }
        },

        methods: {
            refresh() {
                this.show.loading = true;

                this.$emit("refresh");
            },

            colorCodeDevice(line) {
                const parts = line.split("]");

                let value = parts.shift();
                let hash = 0;

                value = value.replace("[", "");
                line = parts.join("]");

                for (let i = 0; i < value.length; i++) {
                    hash = value.charCodeAt(i) + ((hash << 6) - hash); /* eslint-disable-line */
                }

                const hex = (hash & 0x00FFFFFF).toString(16).toLowerCase(); /* eslint-disable-line */

                return `[<span style="color: #${"000000".substring(0, 6 - hex.length) + hex};">${value}</span>]${line}`;
            }
        }
    }
</script>

<style scoped>
    #log {
        flex: 1;
        display: flex;
        position: relative;
        flex-direction: column;
        margin: 0 20px 20px 0;
        padding: 0 0 0 7px;
        background: #262626;
        text-align: left;
        font-size: 12px;
        overflow: hidden;
    }

    #log .actions {
        height: 23px;
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        border-bottom: 1px #424242 solid;
    }

    #log .actions .icon,
    #log .actions .icon:link,
    #log .actions .icon:active,
    #log .actions .icon:visited {
        font-size: 18px;
        color: #999;
        margin: 5px 7px 0 0;
        cursor: pointer;
    }

    #log .actions .icon:hover {
        color: #fff;
        text-decoration: none;
    }

    #log .actions .action-seperator {
        display: inline;
        margin: 5px 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #log .loading {
        text-align: left;
        user-select: none;
        cursor: default;
    }

    #log .loading .loading-message {
        font-size: 14px;
        margin: 7px 0;
    }

    #log .messages {
        flex: 1;
        overflow: auto;
    }

    #log .messages::-webkit-scrollbar {
        display: none;
    }

    #log .messages .message {
        display: block;
        unicode-bidi: embed;
        font-family: monospace;
        white-space: pre-wrap;
        color: #d1d1d1;
    }

    #log .filter-menu {
        position: absolute;
        top: 23px;
        left: 7px;
        z-index: 1000;
    }

    #loader {
        margin: 7em auto;
        width: 350px;
    }
</style>
