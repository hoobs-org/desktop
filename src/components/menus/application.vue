<template>
    <div v-on:click.stop id="menu">
        <div v-if="auth" class="profile">
            <icon name="account-circle" class="icon" />
            <div class="details">
                <span class="title">{{ $t("current_user") }}</span>
                <span class="identity">{{ user.name || user.username }}</span>
            </div>
        </div>
        <div v-if="auth" class="seperator"></div>
        <div v-on:click="$dialog.open('about')" class="item">{{ $t("about") }}</div>
        <div v-on:click="help()" class="item">{{ $t("help") }}</div>
        <div v-if="auth" class="seperator"></div>
        <div v-if="user.permissions.controller" v-on:click="$dialog.open('settings')" class="item">{{ $t("hub_settings") }}</div>
        <div v-on:click="$dialog.open('personalize')" class="item">{{ $t("personalize") }}</div>
        <div v-if="user.permissions.terminal" v-on:click="terminal()" class="item">{{ $t("terminal") }}</div>
        <div v-on:click="exit()" class="item">{{ $t("devices") }}</div>
        <div v-if="auth" class="seperator"></div>
        <div v-if="auth" v-on:click="logout()" class="item">{{ $t("logout") }}</div>
    </div>
</template>

<script>
    import { shell } from "electron";

    export default {
        name: "application",

        computed: {
            user() {
                return this.$store.state.user;
            },
        },

        data() {
            return {
                auth: false,
            };
        },

        async mounted() {
            this.auth = await this.$hoobs.auth.status() === "enabled";
        },

        methods: {
            help() {
                this.$menu.close();

                shell.openExternal("https://support.hoobs.org/docs");
            },

            terminal() {
                this.$menu.close();

                if (this.$route.name !== "terminal") this.$router.push({ path: "/terminal" });
            },

            async logout() {
                this.$menu.close();

                await this.$hoobs.auth.logout();

                this.$router.push({ path: "/login", query: { url: "/" } });
            },

            async exit() {
                this.$menu.close();

                await this.$hoobs.auth.logout();

                this.$store.commit("IO:DEVICE:SET", null);
                this.$router.push({ path: "/login", query: { scan: "true", url: "/" } });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #menu {
        min-width: 197px;
        position: absolute;
        top: 34px;
        right: 10px;
        display: flex;
        flex-direction: column;
        color: var(--menu-text);
        background: var(--menu-background);
        backdrop-filter: var(--transparency);
        box-shadow: var(--elevation);
        border-radius: 0;
        z-index: 3000;

        .seperator {
            height: 1px;
            margin: 0 10px;
            background: var(--menu-border);
        }

        .close {
            position: absolute;
            top: 14px;
            right: 14px;
            font-size: 17px;
            color: var(--application-text);
            cursor: pointer;
        }

        .item {
            padding: 10px 20px;
            display: block;
            color: var(--menu-text) !important;
            text-decoration: none !important;
            cursor: pointer;
            user-select: none;

            &:hover {
                background: var(--menu-highlight);
                color: var(--menu-highlight-text) !important;
            }

            &.disabled {
                opacity: 0.4;
                cursor: default;

                &:hover {
                    background: unset;
                    color: var(--menu-text) !important;
                }
            }
        }

        .profile {
            padding: 20px 20px 10px 20px;
            display: flex;
            align-items: center;
            align-content: center;
            color: var(--text);
            user-select: none;

            .icon {
                color: var(--application-highlight);
                margin: 0 14px 0 0;
                height: 47px;
            }

            .title {
                font-size: 14px;
            }

            .identity {
                color: var(--application-highlight);
                font-size: 17px;
            }

            .details {
                flex: 1;
                display: flex;
                flex-direction: column;
            }
        }
    }
</style>
