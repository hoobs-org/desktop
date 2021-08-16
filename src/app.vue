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
    <div id="app" :theme="theme || 'dark'">
        <component :is="$route.meta.layout">
            <router-view class="view" />
        </component>
        <div v-if="$os === 'mac'" class="chrome mac">
            <div v-if="maximized" v-on:click="restore" class="window-control" name="restore">
                <icon class="overlay" name="mac-restore" />
            </div>
            <div v-else class="window-control" v-on:click="maximize" name="maximize">
                <icon class="overlay" name="mac-restore" />
            </div>
            <div class="window-control spaced" v-on:click="minimize" name="minimize">
                <icon class="overlay" v-on:click="minimize" name="minimize" />
            </div>
            <div class="window-control spaced" v-on:click="close" name="close">
                <icon class="overlay" name="close" />
            </div>
        </div>
        <div v-else class="chrome windows">
            <icon class="icon window-control spaced" v-on:click="minimize" name="minimize" />
            <icon v-if="maximized" v-on:click="restore" class="icon window-control spaced" name="restore" />
            <icon v-else class="icon window-control spaced" v-on:click="maximize" name="maximize" />
            <icon class="icon window-control" v-on:click="close" name="close" />
        </div>
    </div>
</template>

<script>
    import PublicLayout from "@/layouts/public.vue";
    import AuthenticatedLayout from "@/layouts/authenticated.vue";

    export default {
        name: "app",

        components: {
            "public": PublicLayout,
            "authenticated": AuthenticatedLayout,
        },

        computed: {
            theme() {
                return this.$store.state.theme;
            },
        },

        data() {
            return {
                maximized: false,
            };
        },

        async created() {
            this.$theme.load();
            this.maximized = this.$electron.maximized;

            window.addEventListener("resize", () => {
                this.$action.emit("window", "resize");
            }, true);
        },

        methods: {
            minimize() {
                if (this.$route.path !== "/") this.$router.push({ path: "/" });

                this.$electron.minimize();
                setTimeout(() => { this.maximized = this.$electron.maximized; }, 250);
            },

            maximize() {
                this.$electron.maximize();
                setTimeout(() => { this.maximized = this.$electron.maximized; }, 250);
            },

            restore() {
                this.$electron.restore();
                setTimeout(() => { this.maximized = this.$electron.maximized; }, 250);
            },

            close() {
                if (this.$route.path !== "/") this.$router.push({ path: "/" });

                this.$electron.close();
            },
        },
    };
</script>

<style lang="scss">
    @font-face {
        font-family: "Montserrat";
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local("Montserrat Regular"), local("Montserrat-Regular"), url(./assets/montserrat.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }

    @font-face {
        font-family: "Montserrat Black";
        font-style: normal;
        font-weight: 900;
        font-display: swap;
        src: local("Montserrat Black"), local("Montserrat-Black"), url(./assets/montserrat-black.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
</style>

<style lang="scss">
    html,
    body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    #app {
        width: 100%;
        height: 100%;
        display: flex;
        font-family: "Montserrat", sans-serif;
        color: var(--application-text);
        background: var(--application-background);
        overflow: hidden;

        ::placeholder {
            color: var(--application-text);
        }

        ::-webkit-scrollbar {
            background-color: transparent;
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background-color: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background-color: var(--application-border);
            border-radius: 0;
        }

        ::-webkit-scrollbar-button {
            display:none;
        }

        .chrome {
            display: flex;
            position: absolute;
            top: 0;
            right: 0;
            flex-direction: row;
            align-content: center;
            z-index: 3100;
            padding: 2px 7px 0 0;

            &.mac {
                top: 12px;
                width: 75px;

                .window-control {
                    position: relative;
                    width: 15px;
                    height: 15px;
                    border-radius: 100%;
                    margin: 0 10px 0 0;

                    &[name='close'] {
                        background: #ff5f56;
                    }

                    &[name='minimize'] {
                        background: #fdbc2e;
                    }

                    &[name='restore'] {
                        background: #26c940;
                    }

                    &[name='maximize'] {
                        background: #26c940;
                    }

                    .overlay {
                        position: absolute;
                        top: -1.2px;
                        left: 2.4px;
                        color: #000;
                        height: 10px;
                        user-select: none;
                        pointer-events: none;
                        opacity: 0;
                    }

                    &:hover {
                        .overlay {
                            opacity: 0.8;
                        }
                    }
                }
            }

            .icon {
                height: 15px;
                padding: 7px;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: relative;
                border-radius: 100%;
                margin: 5px 0;
                cursor: pointer;

                &.spaced {
                    margin: 5px 7px 5px 0;
                }

                .active {
                    font-size: 32px;
                    position: absolute;
                    right: 4px;
                    top: 2px;
                    color: var(--application-error-text);
                }

                &:hover {
                    color: var(--application-highlight-text);
                }
            }
        }

        a {
            color: var(--application-highlight) !important;
            text-decoration: none !important;
            cursor: pointer;

            &:hover {
                text-decoration: underline !important;
            }
        }

        .button {
            height: 40px;
            box-sizing: border-box;
            background: var(--button);
            color: var(--button-text) !important;
            text-decoration: none !important;
            display: inline-flex;
            align-items: center;
            border: 1px var(--button-border) solid;
            padding: 10.5px 10px 9.5px 10px;
            user-select: none;
            margin: 0 10px 0 0;
            white-space: pre;
            cursor: pointer;

            &.primary {
                background: var(--button-primary);
                color: var(--button-primary-text) !important;
                border: 1px var(--button-primary-border) solid;
            }

            &.light {
                background: var(--button-light);
                color: var(--button-light-text) !important;
                border: 1px var(--button-light-border) solid;
            }

            &:hover {
                box-shadow: var(--elevation-button);
                text-decoration: none !important;
            }
        }

        .back {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 10px 0;
            color: var(--application-text) !important;
        }

        .icon {
            font-weight: normal;
            font-style: normal;
            font-size: 22px;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            user-select: none;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            font-feature-settings: "liga";
            -webkit-font-smoothing: antialiased;
        }

        .loading {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 0 0 20% 0;
        }

        .view {
            flex: 1;
            overflow: hidden;
        }

        .vue-grid-placeholder {
            background: transparent !important;
            border: var(--application-highlight) 2px dashed;
        }

        input {
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            background: var(--application-input);
            color: var(--application-input-text);
            border: 1px var(--application-border) solid;
            border-radius: 0;
            outline: 0 none !important;

            &:focus {
                border-color: var(--application-highlight);
                border-radius: 0;
            }
        }

        select {
            background: var(--application-input);
            color: var(--application-input-text);
            border: 1px var(--application-border) solid;
            border-radius: 0;
            outline: 0 none !important;

            &:focus {
                border-color: var(--application-highlight);
                border-radius: 0;
            }

            option {
                border: 1px var(--application-input) solid;
                background: var(--application-input);
                outline: 0 none;
            }
        }

        textarea {
            background: var(--application-input);
            color: var(--application-input-text);
            border: 1px var(--application-border) solid;
            border-radius: 0;
            outline: 0 none !important;

            &:focus {
                border-color: var(--application-highlight);
                border-radius: 0;
            }
        }

        .modal {
            input {
                background: var(--modal-input);
                color: var(--modal-input-text);
                border: 1px var(--modal-border) solid;
                outline: 0 none !important;

                &:focus {
                    border-color: var(--modal-highlight);
                }
            }

            select {
                background: var(--modal-input);
                color: var(--modal-input-text);
                border: 1px var(--modal-border) solid;
                outline: 0 none !important;

                &:focus {
                    border-color: var(--modal-highlight);
                }

                option {
                    border: 1px var(--application-input) solid;
                    background: var(--application-input);
                    outline: 0 none;
                }
            }

            textarea {
                background: var(--modal-input);
                color: var(--modal-input-text);
                border: 1px var(--modal-border) solid;
                outline: 0 none !important;

                &:focus {
                    border-color: var(--modal-highlight);
                }
            }
        }

        .checkbox {
            .group {
                background-color: var(--application-input);
                border: 1px var(--application-border) solid;
            }

            &.active {
                .group {
                    background-color: var(--application-highlight);
                    border: 1px var(--application-highlight) solid;
                }
            }
        }

        .modal {
            .checkbox {
                .group {
                    background-color: var(--modal-input);
                    border: 1px var(--modal-border) solid;
                }

                &.active {
                    .group {
                        background-color: var(--modal-highlight);
                        border: 1px var(--modal-highlight) solid;
                    }
                }
            }
        }

        .radio {
            .group {
                background-color: var(--application-input);
                border: 1px var(--application-border) solid;
            }

            &.active {
                .group {
                    border: 2px var(--application-highlight) solid;
                }

                .marker {
                    background-color: var(--application-highlight);
                }
            }
        }

        .modal {
            .radio {
                .group {
                    background-color: var(--modal-input);
                    border: 1px var(--modal-border) solid;
                }

                &.active {
                    .group {
                        border: 2px var(--modal-highlight) solid;
                    }

                    .marker {
                        background-color: var(--modal-highlight);
                    }
                }
            }
        }

        .hidden-submit {
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
            position: absolute;
        }
    }
</style>

<style lang="scss">
    .markdown {
        font-size: 14px;

        table {
            width: 100%;
            overflow: auto;

            th {
                font-weight: 600;
                padding: 6px 13px;
                padding: 10px;
                text-align: left;
                border-bottom: 1px var(--application-border) solid;
            }

            td {
                padding: 6px 13px;
                border-bottom: 1px var(--application-border) solid;
            }

            tr {
                background-color: var(--modal-background);

                &:nth-child(2n) {
                    background-color: var(--modal-background);
                }
            }
        }

        img {
            max-width: 100%;
            box-sizing: content-box;

            &[align="right"] {
                padding-left: 20px;
            }

            &[align="left"] {
                padding-right: 20px;
            }
        }

        code {
            padding: 0.2em 0.4em;
            margin: 0;
            font-size: 85%;
            background-color: var(--modal-background);
            border-radius: 3px;
        }

        pre {
            word-wrap: normal;
        }

        pre > code {
            padding: 0;
            margin: 0;
            font-size: 100%;
            word-break: normal;
            white-space: pre;
            background: transparent;
            border: 0;
        }

        pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: var(--modal-background);
            border-radius: 3px;

            code {
                display: inline;
                max-width: auto;
                padding: 0;
                margin: 0;
                overflow: visible;
                line-height: inherit;
                white-space: pre-wrap;
                word-wrap: break-word;
                background-color: transparent;
                border: 0;
            }
        }

        .highlight {
            margin-bottom: 16px;

            pre {
                margin-bottom: 0;
                word-break: normal;
            }
        }
    }
</style>
