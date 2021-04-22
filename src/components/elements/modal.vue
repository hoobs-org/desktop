<template>
    <div v-on:click.stop id="dialog">
        <div v-if="draggable" v-drag="{ handle: '.handle' }" class="window modal" :style="`width: ${width}; height: ${height};`">
            <welcome v-if="welcome" :message="welcome" />
            <div v-else class="subject handle">{{ title || "" }}</div>
            <slot />
        </div>
        <div v-else class="window modal" :style="`width: ${width}; height: ${height};`">
            <welcome v-if="welcome" :message="welcome" />
            <div v-else-if="title" class="subject handle">{{ title || "" }}</div>
            <slot />
        </div>
    </div>
</template>

<script>
    import WelcomeComponent from "@/components/elements/welcome.vue";

    export default {
        name: "modal",

        components: {
            "welcome": WelcomeComponent,
        },

        props: {
            title: String,
            welcome: String,
            width: {
                type: String,
                default: "auto",
            },
            height: {
                type: String,
                default: "auto",
            },
            draggable: {
                type: Boolean,
                default: false,
            },
        },
    };
</script>

<style lang="scss">
    #dialog {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background: var(--modal-mask);
        justify-content: space-around;
        overflow: hidden;
        z-index: 2000;

        .subject {
            color: var(--modal-highlight);
            font-weight: bold;
            font-size: 17px;
            padding: 10px 10px 0 10px;
            user-select: none;
        }

        .window {
            max-height: 100%;
            display: flex;
            flex-direction: column;
            padding: 10px;
            color: var(--modal-text);
            background: var(--modal-background);
            backdrop-filter: var(--transparency);
            border-top: 7px var(--modal-highlight) solid;
            box-sizing: border-box;
            box-shadow: var(--elevation);
            overflow: auto;
        }

        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            font-size: 14px;
            margin: 0 10px 0 0;

            &.message {
                display: flex;
                justify-content: space-around;
                align-items: center;
                text-align: center;
                padding: 27px 10px 0 10px;
                user-select: none;
            }

            .form {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: var(--modal-form);
                padding: 20px;
                margin: 10px 0 0 0;

                .spacer {
                    margin: 7px 0 14px 0;
                }

                .row {
                    display: flex;
                    flex-direction: row;

                    &.section {
                        padding: 20px 0 10px 0;
                        border-bottom: var(--modal-border) 1px solid;
                        margin: 0 0 20px 0;
                        user-select: none;

                        &:first-child {
                            padding: 0 0 10px 0;
                        }
                    }

                    &.title {
                        padding: 0 0 7px 0;
                        user-select: none;
                    }
                }
            }
        }

        .actions {
            margin: 10px 0 10px 10px;
            display: flex;
            justify-content: flex-end;

            .copyright {
                flex: 1;
                font-size: 9px;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                user-select: none;
                opacity: 0.4;
            }
        }

        .loading {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 0;
        }
    }
</style>
