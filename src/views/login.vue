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
    <div :key="version" id="login">
        <modal :welcome="current ? $t('login') : null" :title="title" width="420px">
            <div v-if="errors.length > 0 && !manual" class="errors">
                <span v-for="(error, index) in errors" :key="`error:${index}`">{{ error }}</span>
            </div>
            <form v-if="!loading && current" class="modal" autocomplete="false" method="post" action="/login" v-on:submit.prevent="login()">
                <input type="submit" class="hidden-submit" value="submit" />
                <div class="group">
                    <div class="upper">
                        <label for="username" class="label">{{ $t("username") }}</label>
                        <input type="text" id="username" ref="username" autocomplete="false" data-lpignore="true" v-model="username" v-on:keyup.enter="login" :required="true" />
                    </div>
                    <div class="lower">
                        <label for="password" class="label">{{ $t("password") }}</label>
                        <input type="password" id="password" ref="password" autocomplete="false" data-lpignore="true" v-model="password" v-on:keyup.enter="login" :required="true" />
                    </div>
                </div>
                <div class="remember">
                    <checkbox id="remember" :title="$t('remember_me')" v-model="remember" />
                </div>
            </form>
            <div v-else-if="!loading && !manual" class="devices">
                <div v-for="(device) in devices" :key="device.mac" v-on:click="select(device)" class="device">
                    <div class="title">{{ device.ip }}</div>
                    <div class="sub">{{ device.mac }}</div>
                </div>
                <div v-if="!scanning && devices.length === 0" class="no-device">
                    <span>
                        {{ $t("no_devices") }}
                        <br>
                        <br>
                        {{ $t("no_devices_message") }}
                    </span>
                </div>
                <div v-if="scanning" class="scanning">
                    <div class="progress">
                        <div class="marque" :style="`width: ${skip}%`"></div>
                        <div class="marker" :style="`width: ${progress}%`"></div>
                    </div>
                    <div class="scanner-message">{{ !marque ? `${progress}% ` : "" }}{{ message }}</div>
                </div>
            </div>
            <div v-else-if="!loading && manual" class="devices">
                <p v-if="errors.length > 0" class="directions error">
                    <span v-for="(error, index) in errors" :key="`error:${index}`">{{ error }}</span>
                </p>
                <p v-else class="directions">
                    <span>{{ $t("device_add_message") }}</span>
                </p>
                <div class="row">
                    <text-field :title="$t('device_ip')" style="flex: 1;" v-model="ip" :required="true" :autofocus="true" />
                    <port-field :title="$t('device_port')" style="width: 20%; padding-right: 5px" v-model="port" />
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
            <div class="actions modal">
                <div class="copyright">
                    Copyright &copy; {{ (new Date()).getFullYear() }} HOOBS, Inc.<br>All rights reserved.
                </div>
                <div v-if="!loading && !current && !manual" class="button" v-on:click="advanced(true)">{{ $t("advanced") }}</div>
                <div v-if="!loading && !current && !scanning && !manual" class="button" v-on:click="rescan()">{{ $t("rescan") }}</div>
                <div v-if="!loading && current && !manual" class="button" v-on:click="select(null)">{{ $t("devices") }}</div>
                <div v-if="!loading && current && !manual" class="button primary" v-on:click="login()">{{ $t("login") }}</div>

                <div v-if="!loading && manual" class="button" v-on:click="advanced(false)">{{ $t("cancel") }}</div>
                <div v-if="!loading && manual" class="button primary" v-on:click="connect()">{{ $t("connect") }}</div>
            </div>
        </modal>
    </div>
</template>

<script>
    export default {
        name: "login",

        computed: {
            current() {
                return this.$store.state.current;
            },

            title() {
                if (this.$store.state.current && !this.manual) return null;
                if (this.manual) return this.$t("advanced");

                return this.$t("devices");
            },

            devices() {
                return this.$store.state.devices;
            },
        },

        data() {
            return {
                url: "/",
                ip: "",
                active: "",
                port: 80,
                scan: false,
                manual: false,
                message: "",
                marque: null,
                progress: 0,
                skip: 0,
                scanning: false,
                status: null,
                loading: false,
                version: 0,
                username: "",
                password: "",
                remember: true,
                errors: [],
            };
        },

        created() {
            this.$scanner.on("device", (data) => this.$store.commit("IO:DEVICE", data));
            this.$scanner.on("clear", () => this.$store.commit("IO:DEVICE:CLEAR"));

            this.$scanner.on("start", () => {
                this.scanning = true;
            });

            this.$scanner.on("clear", () => {
                this.progress = 0;
                this.skip = 0;

                this.updateProgress(0);
            });

            this.$scanner.on("stop", () => {
                this.scanning = false;
            });

            this.$scanner.on("progress", (value) => {
                this.updateProgress(value);
            });

            this.$scanner.on("ip", (value) => {
                this.active = value;
            });

            this.$scanner.on("message", (value) => {
                this.message = value;
            });
        },

        async mounted() {
            this.url = this.$route.query.url || "/";
            this.scan = this.$route.query.scan === "true";

            if (!this.current) this.$scanner.start(this.$store.state.devices, 80);
            if (this.url.startsWith("/login")) this.url = "/";
            if (!this.scan && this.devices.length === 1) this.select(this.devices[0]);
        },

        methods: {
            updateProgress(value) {
                if (this.marque) clearInterval(this.marque);

                if (value === 0) {
                    this.marque = setInterval(() => {
                        if (this.progress < 25 && this.skip < 75) this.progress += 1;
                        if (this.progress > 0 && this.skip >= 75) this.progress -= 1;
                        if (this.progress === 25 && this.skip < 75) this.skip += 1;
                        if (this.skip >= 75) this.skip += 1;

                        if (this.skip === 100) {
                            this.progress = 0;
                            this.skip = 0;
                        }
                    }, 30);
                } else {
                    this.marque = null;
                    this.skip = 0;
                    this.progress = value;
                }
            },

            advanced(state) {
                this.ip = "";
                this.port = 80;
                this.errors = [];
                this.manual = state;

                if (state) {
                    this.$scanner.stop();
                } else {
                    this.$scanner.start(this.$store.state.devices, 80);
                }
            },

            rescan() {
                this.$scanner.start(this.$store.state.devices, 80);
            },

            async connect() {
                this.loading = true;

                if (this.validate()) {
                    const device = await this.$scanner.detect(this.ip, this.port, 2 * 60 * 1000);

                    if (device) {
                        this.select(device);
                    } else {
                        this.loading = false;
                        this.errors.push(this.$t("invalid_ip"));
                    }
                } else {
                    this.loading = false;
                }
            },

            validate() {
                this.errors = [];

                if (!this.ip || this.ip === "") {
                    this.errors.push(this.$t("invalid_ip"));

                    return false;
                }

                const blocks = this.ip.split(".").map((item) => parseInt(item, 10));

                if (blocks.length !== 4) {
                    this.errors.push(this.$t("invalid_ip"));

                    return false;
                }

                for (let i = 0; i < blocks.length; i += 1) {
                    if (Number.isNaN(blocks[i])) {
                        this.errors.push(this.$t("invalid_ip"));

                        return false;
                    }

                    if (blocks[i] < 0 || blocks[i] > 255) {
                        this.errors.push(this.$t("invalid_ip"));

                        return false;
                    }
                }

                if (Number.isNaN(parseInt(this.port, 10))) {
                    this.errors.push(this.$t("invalid_port"));

                    return false;
                }

                if (this.port < 1 || this.port > 65535) {
                    this.errors.push(this.$t("invalid_port"));

                    return false;
                }

                return true;
            },

            async select(device) {
                this.loading = true;

                if (device) {
                    this.$hoobs.config.host.set(device.ip, device.port);
                    this.$scanner.stop();
                } else {
                    this.$scanner.start(this.$store.state.devices, 80);
                }

                this.status = await this.$hoobs.auth.status();
                this.$store.commit("IO:DEVICE:SET", device);
                this.$theme.load();

                if (this.status === "disabled") this.$store.commit("SESSION:DISABLE");
                if (this.status === "uninitialized") this.$router.push({ path: "/setup" });
                if (this.status === "disabled") this.$router.push({ path: "/" });

                this.manual = false;
                this.loading = false;

                setTimeout(() => {
                    if (this.$refs.username) this.$refs.username.focus();
                }, 500);
            },

            login() {
                this.errors = [];

                if (this.username === "" || this.username.length < 3) this.errors.push(this.$t("invalid_username_password"));

                if (this.errors.length === 0) {
                    this.loading = true;

                    this.$hoobs.auth.login(this.username.toLowerCase(), this.password, this.remember).then((response) => {
                        if (response) {
                            this.$router.push({ path: this.url });
                        } else {
                            this.errors.push(this.$t("invalid_username_password"));

                            this.username = "";
                            this.password = "";

                            this.loading = false;
                        }
                    }).catch((error) => {
                        this.errors.push(error.message);

                        this.username = "";
                        this.password = "";

                        this.loading = false;
                    });
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #login {
        flex: 1;
        background: linear-gradient(
            to bottom,
            var(--application-background) 0%,
            #00000000 30%
        );

        .errors {
            margin: 0 10px 10px 10px;
            display: flex;
            flex-direction: column;
            font-size: 14px;
            color: var(--modal-error-text);
            border-bottom: var(--modal-border) 1px solid;
        }

        form {
            flex: 1;
            margin: 0 10px;
            min-height: 153px;
        }

        .loading {
            flex: 1;
            margin: 0 10px;
            min-height: 153px;
        }

        .devices {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            margin: 0 10px;
            min-height: 153px;

            .scanning {
                display: flex;
                flex-direction: column;
                padding: 10px 0;

                .progress {
                    height: 4px;
                    flex: 1;
                    display: flex;
                    background: var(--modal-border);

                    .marker {
                        height: 4px;
                        background: var(--modal-highlight);
                    }

                    .marque {
                        height: 4px;
                        background: transparent;
                    }
                }

                .scanner-message {
                    font-size: 12px;
                    margin: 7px 0 0 0;
                    opacity: 0.8;
                }
            }

            .no-device {
                flex: 1;
                display: flex;
                justify-content: space-around;
                text-align: center;
                padding: 0 0 10% 0;
                align-items: center;
            }

            .row {
                display: flex;
                flex-direction: row;
            }

            .directions {
                display: flex;
                flex-direction: column;
                font-size: 14px;
                padding: 0 20% 0 0;
                opacity: 0.7;

                &.error {
                    color: var(--modal-error-text);
                    opacity: 1;
                }
            }

            .device {
                padding: 14px;
                margin: 10px 0 0 0;
                border: var(--modal-border) 1px solid;
                user-select: none;
                cursor: pointer;

                &:hover {
                    border: var(--modal-highlight) 1px solid;
                }

                .title {
                    font-size: 20px;
                    color: var(--modal-highlight);
                }

                &.manual {
                    width: 25px;
                    padding: 0 7px;
                    border: 0 none;

                    .title {
                        color: var(--modal-text);
                    }

                    &:hover {
                        .title {
                            color: var(--modal-highlight);
                        }
                    }
                }

                .sub {
                    font-size: 14px;
                }
            }
        }

        .actions {
            min-height: 40px;

            .copyright {
                padding: 0 14px 0 0;
            }
        }

        .group {
            .upper {
                display: flex;
                flex-direction: column;
                border-top: 1px var(--modal-border) solid;
                border-right: 1px var(--modal-border) solid;
                border-bottom: 1px var(--modal-border) solid;
                border-left: 1px var(--modal-border) solid;

                &:focus-within {
                    .label {
                        background: var(--modal-input-accent);
                    }

                    input {
                        background: var(--modal-input-accent);
                    }
                }

                .label {
                    padding: 10px 10px 0 10px;
                    background: var(--modal-input);
                    font-size: 12px;
                    user-select: none;
                }
            }

            &:focus-within {
                .upper {
                    border-top: 1px var(--modal-highlight) solid;
                    border-right: 1px var(--modal-highlight) solid;
                    border-left: 1px var(--modal-highlight) solid;
                }

                .lower {
                    border-right: 1px var(--modal-highlight) solid;
                    border-bottom: 1px var(--modal-highlight) solid;
                    border-left: 1px var(--modal-highlight) solid;
                }
            }

            .lower {
                display: flex;
                flex-direction: column;
                margin: -1px 0 0 0;
                border-right: 1px var(--modal-border) solid;
                border-bottom: 1px var(--modal-border) solid;
                border-left: 1px var(--modal-border) solid;

                &:focus-within {
                    .label {
                        background: var(--modal-input-accent);
                    }

                    input {
                        background: var(--modal-input-accent);
                    }
                }

                .label {
                    padding: 10px 10px 0 10px;
                    border-top: 1px var(--modal-background) solid;
                    background: var(--modal-input);
                    font-size: 12px;
                    user-select: none;
                }
            }

            input {
                border: 0 none;
                outline: 0 none;
                padding: 5px 10px 10px 10px;
                background: var(--modal-input);
                color: var(--modal-input-text);
                font-size: 15px;

                &:focus {
                    border: 0 none;
                    outline: 0 none;
                }
            }
        }

        .remember {
            display: flex;
            align-content: center;
            align-items: center;
            padding: 7px 0 0 2px;
        }
    }
</style>
