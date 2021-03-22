<template>
    <div id="ring">
        <div class="action">
            <div v-if="token && token !== ''" class="button" v-on:click="unlink">{{ $t("unlink_account") }}</div>
            <div v-else class="button primary" v-on:click="link">{{ $t("link_account") }}</div>
        </div>
        <modal-frame v-if="dialog" :draggable="true" width="520px" height="520px">
            <div class="ring-dialog">
                <div class="content">
                    <div class="form">
                        <div class="row">
                            <svg class="logo" clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.41421" viewBox="0 0 560 400" xmlns="http://www.w3.org/2000/svg">
                                <g transform="matrix(.921234 0 0 .921234 95.7634 61.7688)">
                                    <circle cx="126.5" cy="53.4" fill="#1c9ad6" r="11.9" />
                                    <path d="m98.6 98.6c0 1.9-.8 3.6-2.1 4.9-1.4 1.4-3.2 2.1-5.1 2-1.8-.1-3.6-.8-4.9-2.1l-.2-.2c-.1-.1-.3-.3-.5-.4s-.3-.2-.5-.4c-5-4.1-11.4-6.3-17.9-6.2-8.4 0-15 2.9-19.7
                                             8.6s-7.1 13.9-7.1 24.5v75.8c.1 2-.7 4-2.2 5.3-1.3 1.1-3 1.8-4.8 1.8-1.7 0-3.4-.7-4.8-1.8-1.5-1.3-2.4-3.2-2.2-5.3v-75.8c0-6.2.8-12.3 2.6-18.3 1.6-5.4 4.2-10.5
                                             7.7-14.9 3.4-4.3 7.8-7.8 12.7-10.2 5.6-2.6 11.7-3.9 17.8-3.7 5.3.1 10.5 1.1 15.4 3 5.1 1.8 9.7 4.6 13.5 8.4 1.4 1.3 2.2 3.1 2.3 5zm34.9 106.5c.1 2-.7 4-2.2
                                             5.3-2.8 2.3-6.8 2.3-9.6 0-1.5-1.3-2.4-3.2-2.2-5.3v-113.5c-.1-2 .7-4 2.2-5.3 2.8-2.3 6.8-2.3 9.6 0 1.5 1.3 2.3 3.2 2.2 5.3zm121.1 0c.1 2-.7 4-2.2 5.3-2.8 2.3-6.8
                                             2.3-9.5 0-1.5-1.3-2.4-3.2-2.2-5.3v-77.4c0-4.2-.8-8.4-2.5-12.2-3.2-7.6-9.2-13.6-16.8-16.8-7.8-3.3-16.6-3.3-24.5 0-7.6 3.2-13.6 9.2-16.8 16.8-1.6 3.9-2.5 8-2.4
                                             12.2v77.4c.1 2-.7 4-2.2 5.3-2.8 2.3-6.8 2.3-9.6 0-1.5-1.3-2.4-3.2-2.2-5.3v-77.4c0-6.1 1.2-12.1 3.6-17.7 2.3-5.4 5.5-10.3 9.7-14.5 4.1-4.1 8.9-7.4 14.2-9.7
                                             11.4-4.8 24.2-4.8 35.6 0 10.9 4.5 19.6 13.2 24.1 24.1 2.4 5.6 3.6 11.6 3.6 17.7zm118.8 8.1c.1 6.1-1.2 12.2-3.6 17.8-4.6 10.9-13.3 19.5-24.2 24-5.6 2.4-11.6
                                             3.6-17.7 3.6-3.4 0-6.9-.4-10.3-1.1-3.7-.7-7.2-1.8-10.7-3.2s-6.7-3.2-9.8-5.3c-2.9-2-5.4-4.6-7.3-7.5-.8-1.2-1.2-2.6-1.2-4-.1-1.9.8-3.7 2.2-5s3.1-2 5-2c1 0 2
                                             .2 2.9.6 1.1.5 2.1 1.4 2.7 2.4 0 .2.1.3.2.5l.9.9c3.1 3.4 7.1 6 11.5 7.3 4.4 1.5 9 2.2 13.6 2.2 4.2 0 8.4-.8 12.2-2.5 7.6-3.2 13.6-9.2 16.8-16.8 1.7-3.8 2.5-8
                                             2.5-12.2v-16c-4.1 3.9-9 7.1-14.2 9.2-5.5 2.3-11.3 3.4-17.2 3.4-6.1.1-12.2-1.1-17.8-3.6-10.8-4.6-19.4-13.2-24-24-2.4-5.6-3.6-11.7-3.6-17.8v-36.8c0-6.1 1.2-12.1
                                             3.6-17.7 2.3-5.4 5.5-10.3 9.7-14.5 4.1-4.1 8.9-7.4 14.2-9.7 11.4-4.8 24.2-4.8 35.6 0 10.9 4.5 19.6 13.2 24.1 24.1 2.4 5.6 3.6 11.6 3.6
                                             17.7zm-13.9-85.5c0-4.2-.8-8.4-2.5-12.2-3.2-7.6-9.2-13.6-16.8-16.8-7.8-3.3-16.6-3.3-24.5 0-7.6 3.2-13.6 9.2-16.8 16.8-1.6 3.9-2.5 8-2.4 12.2v36.6c0 4.2.8 8.4
                                             2.4 12.3 1.6 3.7 3.9 7.1 6.8 10s6.3 5.2 10 6.7c7.8 3.3 16.6 3.3 24.5 0 7.6-3.2 13.6-9.2 16.8-16.8 1.7-3.9 2.5-8.1 2.5-12.3z" fill="#535556" fill-rule="nonzero" />
                                </g>
                            </svg>
                        </div>
                        <div v-if="!validate" class="row">
                            <span class="label">{{ $t("email") }}</span>
                        </div>
                        <div v-if="!validate" class="row">
                            <input class="field" type="email" v-model="username" />
                        </div>
                        <div v-if="!validate" class="row">
                            <span class="label">{{ $t("password") }}</span>
                        </div>
                        <div v-if="!validate" class="row">
                            <input class="field" type="password" v-model="password" />
                        </div>
                        <div v-if="validate" class="row">
                            <span class="label">{{ $t("verification_code") }}</span>
                        </div>
                        <div v-if="validate" class="row">
                            <input class="field" type="text" v-model="code" />
                        </div>
                        <div class="row actions">
                            <div class="button" v-if="!validate" v-on:click="login">{{ $t("login") }}</div>
                            <div class="button" v-if="validate" v-on:click="login">{{ $t("verify_code") }}</div>
                            <div class="button cancel" v-on:click="close">{{ $t("cancel") }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </modal-frame>
    </div>
</template>

<script>
    import FrameComponent from "@/components/elements/frame.vue";

    export default {
        name: "ring",

        components: {
            "modal-frame": FrameComponent,
        },

        props: {
            value: [Object, String, Number, Boolean, Array],
        },

        data() {
            return {
                token: "",
                dialog: false,
                validate: false,
                username: "",
                password: "",
                code: "",
            };
        },

        mounted() {
            this.token = this.value;
        },

        methods: {
            unlink() {
                this.token = "";

                this.$emit("input", null);
                this.$emit("change", null);
                this.$emit("save");
            },

            async link() {
                this.dialog = true;
                this.validate = false;
                this.username = "";
                this.password = "";
                this.code = "";
            },

            close() {
                this.dialog = false;
                this.validate = false;
                this.username = "";
                this.password = "";
                this.code = "";
            },

            async login() {
                const response = await this.$hoobs.auth.link("ring", this.username, this.password, this.code);

                if (response.error) this.$alert(this.$t("invalid_username_password"));

                if (response.status === 412) {
                    this.validate = true;
                }

                if (response.refresh_token) {
                    this.token = response.refresh_token;

                    this.$emit("input", this.token);
                    this.$emit("change", this.token);
                    this.$emit("save");

                    this.close();
                }
            },
        },
    };
</script>

<style lang="scss">
    #ring {
        display: flex;
        flex-direction: column;
        padding: 0 10px 10px 0;

        .action {
            padding: 0;
        }

        .ring-dialog {
            flex: 1;
            display: flex;
            flex-direction: column;

            .content {
                align-items: center;
                justify-content: space-around;
                padding: 0 0 10% 0;
            }

            .logo {
                width: 120px;
                height: 86px;
                clip-path: inset(20px 25px 20px 25px);
                margin: -20px -25px -20px -25px;
            }

            .form {
                flex: unset;
                width: 318px;

                .label {
                    font-size: 14px;
                    color: #4c4c4c;
                    margin: 14px 0 8px 0;
                }

                .row {
                    &.actions {
                        flex-direction: column;
                        padding: 7px 0 0 0;
                    }
                }

                .button {
                    width: 100%;
                    justify-content: space-around;
                    margin: 7px 0 0 0;
                    color: #fff;
                    border: 1px #1998d5 solid;
                    border-radius: 4px;
                    background: #1998d5;

                    &.cancel {
                        color: #4c4c4c !important;
                        border: 1px #dee5ec solid;
                        background: #fff;
                    }

                    &:hover {
                        box-shadow: unset;
                    }
                }

                .field {
                    width: 100%;
                    padding: 16px;
                    color: #4c4c4c;
                    background: #fafbfc;
                    border: 1px #dee5ec solid;
                    border-radius: 4px;

                    &:focus {
                        background: #fff;
                        border: 1px #1998d5 solid;
                        box-shadow: 0 2px 4px rgb(0 0 0 / 20%);
                        outline: 0;
                    }
                }
            }
        }
    }
</style>
