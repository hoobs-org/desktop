<template>
    <div id="terminal">
        <div class="actions">
            <div v-on:click="$router.back()" :title="$t('back')" class="icon">arrow_back</div>
            <div class="action-seperator"></div>
            <div v-on:click="refreshTerminal()" :title="$t('refresh')" class="icon">refresh</div>
        </div>
        <div class="flow" ref="flow">
            <div class="container" ref="container">
                <div ref="terminal" class="shell"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import Semver from "compare-versions";

    import { Terminal } from "xterm";
    import { AttachAddon } from "xterm-addon-attach";
    import { FitAddon } from "xterm-addon-fit";
    import { WebLinksAddon } from "xterm-addon-web-links";

    export default {
        name: "terminal",

        data() {
            return {
                status: null,
                term: null,
                device: null,
                socket: null,
                screen: null,
                closing: false,
                opening: true,
                rows: 0,
                cols: 0
            }
        },

        computed: {
            dimensions() {
                return this.$store.state.dimensions;
            }
        },

        async mounted() {
            this.closing = false;
            this.opening = true;

            const devices = this.Settings.get("devices");
            const index = devices.findIndex(d => d.mac === this.$route.params.mac && d.port === parseInt(this.$route.params.port, 10))

            if (index > -1) {
                this.device = devices[index];

                await this.API.login(this.device.ip, this.device.port);

                this.status = await this.API.get(this.device.ip, this.device.port, "/status");

                this.term = new Terminal({
                    cursorBlink: false,
                    fontSize: 12,
                    theme: {
                        background: "#262626",
                        foreground: "#d1d1d1"
                    }
                });

                this.screen = new FitAddon();

                this.term.loadAddon(this.screen);
                this.term.loadAddon(new WebLinksAddon());
                this.term.open(this.$refs.terminal);

                this.connectTerminal();
            }
        },

        created() {
            this.watcher = this.$store.subscribe((mutation) => {
                if (mutation.type === "resizeWindow") {
                    this.resizeTerminal();
                }
            });
        },

        destroyed() {
            if (this.watcher) {
                this.watcher();
            }

            this.term = null;
            this.screen = null;
            this.closing = true;

            if (this.socket) {
                this.socket.send("{EXIT}");
                this.socket.close();
            }

            this.socket = null;
        },

        methods: {
            refreshTerminal() {
                if (this.socket) {
                    this.opening = true;
                    this.socket.send("{EXIT}");
                    this.socket.close();
                }
            },

            connectTerminal() {
                const session = this.Settings.get("sessions")[`${this.device.ip}:${this.device.port}`];

                this.socket = new WebSocket(`ws://${this.device.ip}:${this.device.port}/shell?a=${session || ""}&t=${new Date().getTime()}`);

                this.socket.onopen = () => {
                    this.term.loadAddon(new AttachAddon(this.socket));

                    if (this.opening) {
                        this.term.clear();

                        this.term.write(`HOOBS ${this.status.hoobs_version}\r\n`);

                        this.term.write(" _    _  ____   ____  ____   _____   \r\n");
                        this.term.write("| |  | |/ __ \\ / __ \\|  _ \\ / ____|  \r\n");
                        this.term.write("| |__| | |  | | |  | | |_) | (___    \r\n");
                        this.term.write("|  __  | |  | | |  | |  _ < \\___ \\   \r\n");
                        this.term.write("| |  | | |__| | |__| | |_) |____) |  \r\n");
                        this.term.write("|_|  |_|\\____/ \\____/|____/|_____/   \r\n");
                        this.term.write("\r\n");

                        this.term.write("This terminal is here to help manage this\r\n");
                        this.term.write("device. If you need to install a plugn\r\n");
                        this.term.write("please use the interface.\r\n");

                        this.term.write("\r\n");

                        this.socket.send("");

                        this.resizeTerminal();

                        this.opening = false;
                    }
                };

                this.socket.onclose = () => {
                    if (!this.closing) {
                        this.connectTerminal();
                    }
                };

                this.socket.onerror = () => {
                    this.socket.close();
                };
            },

            resizeTerminal() {
                this.$refs.container.style.display = "none";

                this.cols = Math.floor((this.$refs.flow.clientWidth + 1) / this.dimensions.width);
                this.rows = Math.floor((this.$refs.flow.clientHeight + 1) / this.dimensions.height) + 3;

                setTimeout(() => {
                    this.$refs.container.style.display = "block";

                    this.screen.fit();
                    this.term.resize(this.cols, this.rows);

                    if (Semver.compare(this.status.hoobs_version, "3.1.21", ">=")) {
                        this.socket.send(`{RESIZE}:${this.cols}:${this.rows}`);
                    }

                    this.term.focus();
                }, 10);
            }
        }
    }
</script>

<style>
    .shell {
        width: 100%;
        height: 100%;
    }

    .xterm {
        font-feature-settings: "liga" 0;
        position: relative;
        user-select: none;
        -ms-user-select: none;
        -webkit-user-select: none;
    }

    .xterm.focus,
    .xterm:focus {
        outline: none;
    }

    .xterm .xterm-helpers {
        position: absolute;
        top: 0;
        z-index: 10;
    }

    .xterm .xterm-helper-textarea {
        position: absolute;
        opacity: 0;
        left: -9999em;
        top: 0;
        width: 0;
        height: 0;
        z-index: -10;
        white-space: nowrap;
        overflow: hidden;
        resize: none;
    }

    .xterm .composition-view {
        background: #262626 !important;
        color: #fff;
        display: none;
        position: absolute;
        white-space: nowrap;
        z-index: 1;
    }

    .xterm .composition-view.active {
        display: block;
    }

    .xterm .xterm-viewport {
        background-color: #262626 !important;
        overflow-y: scroll;
        cursor: default;
        position: absolute;
        right: 0;
        left: 0;
        top: 0;
        bottom: 0;
    }

    .xterm .xterm-screen {
        position: relative;
    }

    .xterm .xterm-screen canvas {
        position: absolute;
        left: 0;
        top: 0;
    }

    .xterm .xterm-scroll-area {
        visibility: hidden;
    }

    .xterm-char-measure-element {
        display: inline-block;
        visibility: hidden;
        position: absolute;
        top: 0;
        left: -9999em;
        line-height: normal;
    }

    .xterm {
        cursor: text;
    }

    .xterm.enable-mouse-events {
        cursor: default;
    }

    .xterm.xterm-cursor-pointer {
        cursor: pointer;
    }

    .xterm.column-select.focus {
        cursor: crosshair;
    }

    .xterm .xterm-accessibility,
    .xterm .xterm-message {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        z-index: 100;
        color: transparent;
    }

    .xterm .live-region {
        position: absolute;
        left: -9999px;
        width: 1px;
        height: 1px;
        overflow: hidden;
    }

    .xterm-dim {
        opacity: 0.5;
    }

    .xterm-underline {
        text-decoration: underline;
    }
</style>

<style scoped>
    #terminal {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 20px 10px 20px;
    }

    #terminal .actions {
        height: 23px;
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        margin: 0 0 10px 0;
        border-bottom: 1px #424242 solid;
    }

    #terminal .actions .icon {
        font-size: 18px;
        margin: 5px 7px 0 0;
        cursor: pointer;
    }

    #terminal .actions .icon:hover {
        color: #fff;
    }

    #terminal .actions .action-seperator {
        display: inline;
        margin: 5px 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #terminal .flow {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    #terminal .flow .container {
        width: 100%;
        height: 100%;
        overflow: auto;
    }

    #terminal .flow .container ::-webkit-scrollbar {
        display: none;
    }
</style>