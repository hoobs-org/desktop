<template>
    <div id="app" v-on:click="$store.commit('hideAllMenus')" class="hoobs-dark">
        <div v-on:click="titleToggle()" class="header">
            <div class="logo">
                <svg width="20" height="20" viewBox="0 0 80 80.92" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#feb400" d="M65.05,0H15A15.08,15.08,0,0,0,0,15.12V65.8A15.09,15.09,0,0,0,15,80.92h50.1A15.09,15.09,0,0,0,80,65.8V15.12A15.08,15.08,0,0,0,65.05,0Zm2,39.07a2.09,2.09,0,0,1-1.79,1.71,1.76,1.76,0,0,1-2.09-1c-.83-2.21-2.63-3.55-4.2-5.07a5.66,5.66,0,0,1-2-4.81c.09-1.24,0-2.49,0-3.73h0c0-1.66,0-3.32,0-5,0-1.5-.94-1.78-2.15-1.76s-2.64-.21-2.72,1.65c-.07,1.5,0,3-.06,4.51,0,.5.25,1.2-.23,1.44s-.83-.45-1.18-.78c-3.29-3.11-6.59-6.22-9.83-9.39-1-1-1.74-1-2.71,0Q27.51,27.79,16.75,38.57c-.94.94-1.07,1.7,0,2.57.24.19.44.44.66.65,1.41,1.4,1.62,1.36,3.13,0,4.68-4.35,9.08-9,13.63-13.48,1-.94,2-1.81,2.93-2.74a3.81,3.81,0,0,1,5.74,0c2,1.9,3.84,3.89,5.78,5.82C52.18,34.88,55.8,38.4,59.37,42c2.35,2.36,2.31,4.44,0,6.83-3.65,3.72-5.08,3.7-8.77,0-3.21-3.2-6.5-6.32-9.7-9.53-1-1-1.76-.91-2.71.06Q33,44.63,27.81,49.8c-.91.9-.91,1.65,0,2.48a13.05,13.05,0,0,1,1,1,1.48,1.48,0,0,0,2.48,0c1.82-1.83,3.7-3.59,5.55-5.38a4,4,0,0,1,5.9-.13q3.09,2.91,6.07,6a4,4,0,0,1,0,5.72c-1.36,1.47-2.82,2.87-4.23,4.3a8.46,8.46,0,0,0-2.22,2.92,1.84,1.84,0,0,1-2.1,1.23,2,2,0,0,1-1.84-1.63,2.09,2.09,0,0,1,1.09-2.5c2.93-1.4,4.61-4.19,6.94-6.26a1.08,1.08,0,0,0,0-1.75l-5.57-5.59c-.75-.75-1.43-.54-2.13.14-1.84,1.8-3.71,3.57-5.56,5.37a4,4,0,0,1-5.9.26c-.51-.43-1-.92-1.44-1.4-2.38-2.44-2.38-4.57,0-7Q31,42.31,36.22,37c2.22-2.23,4.32-2.25,6.57-.06l10.6,10.39c1.5,1.46,1.67,1.44,3.45-.37,1.51-1.54,1.53-1.76,0-3.25-5.21-5.21-10.46-10.39-15.65-15.62-.88-.89-1.58-.95-2.46-.07-2.41,2.4-4.84,4.77-7.27,7.16q-4.8,4.71-9.59,9.42a3.94,3.94,0,0,1-5.79.13c-3.81-3.46-4.75-5.29-.33-9.57,6.88-6.67,13.53-13.58,20.29-20.39,2.41-2.43,4.49-2.44,6.91-.07,1.65,1.62,3.35,3.2,5,4.81.68.66,1.15,1.07,1.51-.3a3.4,3.4,0,0,1,3-2.57,14.24,14.24,0,0,1,1.83-.21c4.28-.12,5.77,1.36,5.78,5.68,0,2.6,0,5.19,0,7.78a3.09,3.09,0,0,0,1.06,2.61c1.66,1.44,2.86,3.38,5,4.27A1.88,1.88,0,0,1,67.1,39.07Z" />
                </svg>
                <h1>HOOBS</h1>
            </div>
        </div>
        <div class="chrome">
            <button v-on:click.stop="$store.commit('toggleMenu', 'header')" class="title-action icon">menu</button>
            <div class="seperator"></div>
            <button v-on:click="$minimize()" class="title-button icon">remove</button>
            <button v-if="maximized" v-on:click="windowToggle()" class="title-button icon">fullscreen_exit</button>
            <button v-else v-on:click="windowToggle()" class="title-button icon">fullscreen</button>
            <button v-on:click="$close()" class="title-button icon">close</button>
        </div>
        <navigation :route="$route.name" :devices="devices" />
        <div class="content">
            <router-view v-on:refresh="connectAll()" />
        </div>
        <div class="notifications">
            <notification v-for="(notification, nidx) in notifications" :key="nidx" :value="notification"></notification>
        </div>
        <dropdown v-if="menus['header']" class="header-menu">
            <div class="item" v-on:click="() => { show.about = true }">{{ $t("about") }}</div>
            <div class="item" v-on:click="() => { show.help = true }">{{ $t("help") }}</div>
            <div v-if="!serviceRoute() && devices.length > 0" class="seperator"></div>
            <router-link v-if="!serviceRoute() && devices.length > 0" to="/devices" class="item">{{ $t("manage_devices") }}</router-link>
        </dropdown>
        <modal v-if="show.about" v-on:confirm="() => { show.about = false }" v-on:cancel="$browse('https://www.paypal.me/hoobsofficial')" :cancel-title="$t('donate')" width="450px">
            <about />
        </modal>
        <modal v-if="show.help" v-on:confirm="() => { show.help = false }" :title="$t('help')" :cancel-button="false" width="550px">
            <help />
        </modal>
    </div>
</template>

<script>
    import Navigation from "@/components/navigation.vue";
    import About from "@/components/about.vue";
    import Help from "@/components/help.vue";

    export default {
        name: "app",

        components: {
            "navigation": Navigation,
            "about": About,
            "help": Help
        },

        data() {
            return {
                sockets: {},
                maximized: false,
                show: {
                    about: false,
                    help: false
                },
                header: {
                    delay: 700,
                    clicks: 0,
                    timer: null
                },
                devices: [],
                sessions: []
            }
        },

        computed: {
            menus() {
                return this.$store.state.menus;
            },

            connected() {
                return this.$store.state.connected;
            },

            notifications() {
                return this.$store.state.notifications;
            }
        },

        async mounted() {
            this.maximized = this.$maximized();

            this.devices = this.Settings.get("devices");
            this.sessions = this.Settings.get("sessions");
        },

        created() {
            window.addEventListener("resize", () => {
                this.$store.commit("resizeWindow");
            });

            window.addEventListener("keydown", (event) => {
                switch (event.which) {
                    case 83:
                        if (process.platform === "darwin" ? event.metaKey : event.ctrlKey) {
                            this.$store.commit("saveChanges");
                        }

                        break;

                    case 13:
                        this.$store.commit("accept");
                        break;

                    case 27:
                        this.$store.commit("cancel");
                        break;
                }
            });
        },

        destroyed() {
            for (let i = 0; i < this.devices.length; i++) {
                this.Device.heartbeat.stop(this.devices[i].ip, this.devices[i].port);
                this.Device.wait.stop(this.devices[i].ip, this.devices[i].port, true);
            }
        },

        watch: {
            devices: function () {
                this.connectAll();
            }
        },

        methods: {
            serviceRoute() {
                switch(this.$route.name) {
                    case "devices":
                    case "system":
                    case "terminal":
                    case "etcher":
                        return true;

                    default:
                        return false;
                }
            },

            async connectAll() {
                this.$store.commit("resetStore");

                for (let i = 0; i < this.devices.length; i++) {
                    this.Device.heartbeat.stop(this.devices[i].ip, this.devices[i].port);

                    this.Device.wait.start(this.devices[i].ip, this.devices[i].port, () => {
                        this.connectInstance(this.devices[i].ip, this.devices[i].port, this.devices[i].hostname);
                    }, true);
                }
            },

            async connectInstance(ip, port, hostname) {
                await this.API.login(ip, port);

                const instance = `${ip}:${port}`;
                const session = this.Settings.get("sessions")[instance];

                let delay = 0;

                if (this.sockets[instance] && this.sockets[instance].socket) {
                    this.sockets[instance].closing = true;
                    this.sockets[instance].socket.close();

                    delay = 3500;
                }

                setTimeout(() => {
                    this.sockets[instance] = {
                        closing: false,
                        socket: new WebSocket(`ws://${instance}/monitor?a=${session || ""}&t=${new Date().getTime()}`)
                    };

                    this.sockets[instance].socket.onmessage = (message) => {
                        const now = new Date();

                        message = JSON.tryParse(message.data, {});

                        switch (message.event) {
                            case "log":
                                if ((message.data.message || message.data || "") === "{CLEAR}") {
                                    this.$store.commit("updateMessages", {
                                        hostname,
                                        clear: true
                                    });
                                } else {
                                    const lines = (message.data.message || message.data || "").split(/\r?\n/);

                                    for (let i = 0; i < lines.length; i++) {
                                        this.$store.commit("updateMessages", {
                                            hostname,
                                            timestamp: message.data.timestamp,
                                            message: lines[i]
                                        });
                                    }
                                }

                                break;

                            case "push":
                                message.data.instance = instance;
                                message.data.hostname = hostname;

                                this.$store.commit("updateNotifications", message.data);
                                break;
                            
                            case "monitor":
                                message.data.instance = instance;

                                this.$store.commit("updateMonitor", message.data);
                                break;

                            case "update":
                                if (!this.refresh || now.getTime() - this.refresh.getTime() > 1000) {
                                    this.$store.commit("updateAccessories", instance);
                                }

                                break;
                        }
                    };

                    this.sockets[instance].socket.onopen = () => {
                        this.sockets[instance].socket.send("{HISTORY}");
                    };

                    this.sockets[instance].socket.onclose = () => {
                        if (!this.sockets[instance].closing) {
                            setTimeout(() => {
                                this.Device.wait.start(ip, port, () => {
                                    this.connectInstance(ip, port, hostname);
                                }, true);
                            }, 3000);
                        }
                    };

                    this.sockets[instance].socket.onerror = () => {
                        if (!this.sockets[instance].closing) {
                            this.sockets[instance].socket.close();
                        }
                    };

                    this.$store.commit("deviceConnected");

                    this.Device.heartbeat.start(ip, port, () => {
                        if (this.sockets[instance] && this.sockets[instance].socket) {
                            this.sockets[instance].closing = true;
                            this.sockets[instance].socket.close();
                        }

                        this.$store.commit("deviceDisconected");
                    });
                }, delay);
            },

            titleToggle() {
                this.header.clicks += 1;

                if(this.header.clicks === 1) {
                    this.header.timer = setTimeout(() => {
                        this.header.clicks = 0
                    }, this.header.delay);
                } else {
                    clearTimeout(this.header.timer);  

                    if (this.maximized){
                        this.$unmaximize();
                    } else{
                        this.$maximize();
                    }

                    this.maximized = this.$maximized();
                    this.header.clicks = 0;
                }         
            },

            windowToggle() {
                if (this.maximized){
                    this.$unmaximize();
                } else{
                    this.$maximize();
                }

                this.maximized = this.$maximized();
            }
        }
    }
</script>

<style>
    #app {
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    #nav {
        padding: 30px;
    }

    #nav a {
        font-weight: bold;
        color: #2c3e50;
    }

    #nav a.router-link-exact-active {
        color: #42b983;
    }
</style>

<style>
    @font-face {
        font-family: "Montserrat";
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local("Montserrat Regular"),
             local("Montserrat-Regular"),
             url(./assets/montserrat.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }

    @font-face {
        font-family: "Montserrat Black";
        font-style: normal;
        font-weight: 900;
        font-display: swap;
        src: local("Montserrat Black"),
             local("Montserrat-Black"),
             url(./assets/montserrat-black.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
      
    @font-face {
        font-family: "Material Icons";
        font-style: normal;
        font-weight: 400;
        src: url(./assets/material.eot);
        src: local("Material Icons"),
             local("MaterialIcons-Regular"),
             url(./assets/material.woff2) format('woff2'),
             url(./assets/material.woff) format('woff'),
             url(./assets/material.ttf) format('truetype');
}
</style>

<style>
    html,
    body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
        background: #262626;
    }

    .icon {
        font-family: "Material Icons";
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        user-select: none;
        font-feature-settings: "liga";
        -webkit-font-smoothing: antialiased;
    }

    .button,
    .button:link,
    .button:active,
    .button:visited {
        background: #1a1a1a;
        color: #fff !important;
        text-decoration: none !important;
        display: inline-block;
        border: 1px #1a1a1a solid;
        border-radius: 3px;
        padding: 10px;
        cursor: pointer;
        user-select: none;
        margin: 0 10px 0 0;
        white-space: pre;
    }

    .button-primary,
    .button-primary:link,
    .button-primary:active,
    .button-primary:visited {
        background: #feb400;
        color: #fff !important;
        border: 1px #feb400 solid;
    }

    .button-warning,
    .button-warning:link,
    .button-warning:active,
    .button-warning:visited {
        background: #e30505;
        color: #fff !important;
        border: 1px #e30505 solid;
    }

    .button:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 1px rgba(0, 0, 0, 0.3);;
    }

    ::placeholder {
        color: #999;
    }

    .hidden-submit {
        width: 1px;
        height: 1px;
        overflow: hidden;
        opacity: 0;
        position: absolute;
    }

    #app {
        flex: 1;
        margin: 0;
        padding: 0;
        height: 100%;
        background: #262626;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: hidden;
        color: #999;
        display: flex;
        flex-direction: row;
    }

    #app a,
    #app a:link,
    #app a:active,
    #app a:visited {
        color: #feb400;
        text-decoration: none;
    }

    #app a:hover {
        text-decoration: underline;
    }

    #app .header {
        -webkit-app-region: drag;
        position: fixed;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        top: 0;
        left: 0;
        width: 100%;
        height: 37px;
        z-index: 100;
    }

    #app .header .logo {
        display: flex;
        align-content: center;
        align-items: center;
        margin: 0 0 0 9px;
        user-select: none;
    }

    #app .header .logo svg {
        margin: 0 3px 0 0;
        user-select: none;
    }

    #app .header .logo h1 {
        font-size: 18px;
        margin: 2px 0 0 3px;
    }

    #app .header-menu {
        position: absolute;
        top: 32px;
        right: 95px;
        z-index: 300;
    }

    #app .chrome {
        -webkit-app-region: no-drag;
        position: fixed;
        top: 10px;
        right: 14px;
        display: flex;
        z-index: 100;
    }

    #app .chrome .title-button {
        height: 18px;
        font-size: 18px;
        margin: 0 0 0 3px;
        color: #999;
        background: transparent;
        border: 0 none;
        outline: 0 none !important;
        cursor: pointer;
        padding: 0;
    }

    #app .chrome .title-action {
        height: 18px;
        font-size: 18px;
        margin: 0 0 0 7px;
        color: #999;
        background: transparent;
        border: 0 none;
        outline: 0 none !important;
        cursor: pointer;
        padding: 0;
    }

    #app .chrome .title-button:hover,
    #app .chrome .title-action:hover {
        color: #fff;
    }

    #app .chrome .seperator {
        display: inline;
        margin: 0 7px 0 10px;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #app .notifications {
        width: 350px;
        position: absolute;
        bottom: 20px;
        right: 20px;
        z-index: 200;
    }

    #app .content {
        flex: 1;
        padding: 48px 0 0 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-size: 12pt;
    }
</style>
