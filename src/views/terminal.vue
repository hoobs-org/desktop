<template>
    <div id="terminal">
        <div class="actions">
            <div v-on:click="$router.back()" title="Back" class="icon">arrow_back</div>
            <div class="action-seperator"></div>
            <div v-on:click="refreshTerminal()" title="Reload Terminal" class="icon">refresh</div>
        </div>
        <div class="flow">
            <div ref="terminal" class="shell"></div>
        </div>
    </div>
</template>

<script>
    import { Terminal } from "xterm";
    import { AttachAddon } from "xterm-addon-attach";
    import { FitAddon } from "xterm-addon-fit";
    import { WebLinksAddon } from "xterm-addon-web-links";

    export default {
        name: "terminal",

        data() {
            return {
                term: null,
                device: null,
                socket: null,
                screen: null,
                closing: false,
                opening: true
            }
        },

        async mounted() {
            this.closing = false;
            this.opening = true;

            const devices = this.Settings.get("devices");
            const index = devices.findIndex(d => d.mac === this.$route.params.mac && d.port === parseInt(this.$route.params.port, 10))

            if (index > -1) {
                this.device = devices[index];

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

                this.screen.fit();
                this.connectTerminal();
            }

            window.addEventListener("resize", this.resizeTerminal);
        },

        destroyed() {
            window.removeEventListener("resize", this.resizeTerminal);

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
                        this.term.focus();

                        this.socket.send("{CLEAR}");

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
                this.screen.fit();
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
        display: flex;
        flex-direction: row;
        padding: 0 0 7px 0;
        margin: 0 0 10px 0;
        border-bottom: 1px #424242 solid;
    }

    #terminal .actions .icon {
        font-size: 18px;
        margin: 0 7px 0 0;
        cursor: pointer;
    }

    #terminal .actions .icon:hover {
        color: #fff;
    }

    #terminal .actions .action-seperator {
        display: inline;
        margin: 0 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #terminal .flow {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
    }

    #terminal .flow ::-webkit-scrollbar {
        display: none;
    }
</style>