<template>
    <div id="app" :theme="theme || 'dark'">
        <component :is="$route.meta.layout">
            <router-view class="view" />
        </component>
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

        async created() {
            this.$theme.load();

            window.addEventListener("resize", () => {
                this.$action.emit("window", "resize");
            }, true);
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
