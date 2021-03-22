<template>
    <div id="context">
        <div v-if="!login" :class="override ? `page ${override}` : 'page'">
            <slot />
        </div>
        <div class="header"></div>
        <div :class="override ? `system ${override}` : 'system'">
            <icon v-if="!login" v-on:click.stop="$menu.open('notifications')" name="bell-outline" class="icon">
                <div v-if="notifications.length > 0" class="active">&bull;</div>
            </icon>
            <icon v-if="!login" v-on:click.stop="$menu.open('application')" class="icon" name="dots-vertical" />
            <div v-if="!login" class="seperator"></div>
            <icon class="icon window-control spaced" v-on:click="minimize" name="minimize" />
            <icon v-if="$electron.maximized" v-on:click="restore" class="icon window-control spaced" name="restore" />
            <icon v-else class="icon window-control spaced" v-on:click="maximize" name="maximize" />
            <icon class="icon window-control" v-on:click="close" name="close" />
        </div>
    </div>
</template>

<script>
    export default {
        name: "context",

        props: {
            override: String,
            login: Boolean,
        },

        computed: {
            notifications() {
                return this.$store.state.notifications;
            },
        },

        methods: {
            minimize() {
                this.$electron.minimize();
            },

            maximize() {
                this.$electron.maximize();
            },

            restore() {
                this.$electron.restore();
            },

            close() {
                this.$electron.close();
            },
        },
    };
</script>

<style lang="scss" scoped>
    #context {
        height: 38px;
        display: flex;
        flex-direction: row;
        align-content: center;
        background: var(--application-background);
        z-index: 3000;

        .page {
            display: flex;
            flex-direction: row;
            align-content: center;
            padding: 2px 0 0 7px;

            .icon {
                height: 18px;
            }
        }

        .header {
            flex: 1;
            -webkit-app-region: drag;
        }

        .system {
            display: flex;
            flex-direction: row;
            align-content: center;
            background: var(--application-background);
            padding: 2px 7px 0 0;

            .icon {
                height: 20px;
            }
        }

        .seperator {
            width: 1px;
            height: 18px;
            background: var(--navigation-border);
            margin: 10px 7px;
        }

        .icon {
            padding: 5px;
            height: 18px;
            display: flex;
            justify-content: space-around;
            align-items: center;
            position: relative;
            border-radius: 100%;
            margin: 5px 0;
            cursor: pointer;

            &.window-control {
                height: 15px;
                padding: 7px;
            }

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

        .button {
            height: auto;
            display: flex;
            flex-direction: row;
            align-content: center;
            background: var(--application-background);
            color: var(--application-text) !important;
            border: 0 none;
            font-size: 13px;
            padding: 0;
            margin: 5px 5px 5px 0;

            .icon {
                margin: 0 -3px 0 0;
                height: 18px;
            }

            &:hover {
                color: var(--application-highlight-text) !important;
                box-shadow: none !important;
            }
        }

        .navigation {
            background: var(--navigation-background);
            color: var(--navigation-text);

            .icon {
                &:hover {
                    color: var(--navigation-highlight-text);
                }
            }

            .button {
                color: var(--navigation-text) !important;

                &:hover {
                    color: var(--navigation-highlight-text) !important;
                }
            }
        }
    }
</style>
