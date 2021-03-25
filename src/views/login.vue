<template>
    <div :key="version" id="login">
        <modal :welcome="current ? $t('login') : null" :title="current ? null : $t('devices')" width="420px">
            <div v-if="errors.length > 0" class="errors">
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
            <div v-else-if="!loading" class="devices">
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
                    <div class="scanner-message">{{ message }}</div>
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
            <div class="actions modal">
                <div class="copyright">
                    Copyright &copy; {{ (new Date()).getFullYear() }} HOOBS, Inc. All rights reserved.
                </div>
                <div v-if="!loading && !current && !scanning" class="button" v-on:click="rescan()">{{ $t("rescan") }}</div>
                <div v-if="!loading && current" class="button" v-on:click="select(null)">{{ $t("devices") }}</div>
                <div v-if="!loading && current" class="button primary" v-on:click="login()">{{ $t("login") }}</div>
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

            devices() {
                return this.$store.state.devices;
            },
        },

        data() {
            return {
                url: "/",
                scan: false,
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
            this.$scanner.on("start", () => {
                this.scanning = true;
            });

            this.$scanner.on("stop", () => {
                this.scanning = false;
            });

            this.$scanner.on("progress", (value) => {
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
                    this.skip = 0;
                    this.progress = value;
                }
            });

            this.$scanner.on("message", (value) => {
                this.message = value;
            });
        },

        async mounted() {
            this.url = this.$route.query.url || "/";
            this.scan = this.$route.query.scan === "true";

            if (!this.current) {
                this.$scanner.start(80, 50826);
            }

            if (this.url.startsWith("/login")) this.url = "/";
            if (!this.scan && this.devices.length === 1) this.select(this.devices[0]);
        },

        methods: {
            rescan() {
                this.$scanner.start(80, 50826);
            },

            async select(device) {
                this.loading = true;

                if (device) {
                    this.$hoobs.config.host.set(device.ip, device.port);
                    this.$scanner.stop();
                } else {
                    this.$scanner.start(80, 50826);
                }

                this.status = await this.$hoobs.auth.status();
                this.$store.commit("IO:DEVICE:SET", device);
                this.$theme.load();

                if (this.status === "disabled") this.$store.commit("SESSION:DISABLE");
                if (this.status === "uninitialized") this.$router.push({ path: "/setup" });
                if (this.status === "disabled") this.$router.push({ path: "/" });

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
