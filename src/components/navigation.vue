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
    <div id="navigation">
        <div class="links">
            <div class="logo">
                <svg viewBox="0 0 80 80.92" xmlns="http://www.w3.org/2000/svg">
                    <rect class="background" x="1.25" y="1.25" width="77" height="78" rx="16.3" />
                    <path
                        class="foreground"
                        d="M17,44.62a3.78,3.78,0,0,0,5.56-.13q4.63-4.53,9.24-9.08c2.33-2.3,4.68-4.59,7-6.91.85-.84,1.52-.78,
                        2.37.08,5,5,10,10,15.07,15.05,1.44,1.43,1.42,1.65,0,3.13-1.71,1.75-1.88,1.77-3.32.36q-5.1-5-10.21-10c-2.16-2.11-4.18-2.1-6.32,
                        0q-5,5.07-10.06,10.17c-2.28,2.32-2.27,4.37,0,6.72.45.46.89.94,1.38,1.35a3.87,3.87,0,0,0,5.68-.25C35.16,53.42,37,51.71,38.73,
                        50c.67-.66,1.33-.85,2.05-.13,1.79,1.79,3.57,3.59,5.36,5.39a1,1,0,0,1,0,1.69c-2.24,2-3.86,4.68-6.68,6a2,2,0,0,0-1,2.41,1.89,
                        1.89,0,0,0,1.76,1.56,1.78,1.78,0,0,0,2-1.17,8,8,0,0,1,2.13-2.82c1.36-1.38,2.76-2.72,4.08-4.14a3.85,3.85,0,0,0,
                        0-5.52c-1.92-2-3.86-3.86-5.85-5.74a3.8,3.8,0,0,0-5.67.13c-1.78,1.73-3.59,3.43-5.34,5.18-.86.86-1.59.87-2.39,
                        0-.29-.33-.61-.65-.93-1-.87-.81-.87-1.53,0-2.39q5-5,10-10.07c.91-.93,1.64-1,2.61-.06,3.08,3.09,6.25,6.1,9.34,9.19,3.55,3.54,
                        4.92,3.55,8.44,0,2.26-2.3,2.29-4.31,0-6.58-3.44-3.44-6.92-6.84-10.36-10.27-1.87-1.86-3.68-3.78-5.56-5.61a3.66,3.66,0,0,0-5.53,
                        0c-.93.89-1.91,1.74-2.82,2.64-4.38,4.33-8.62,8.8-13.12,13-1.45,1.34-1.66,1.38-3,0-.21-.21-.4-.44-.63-.63-1-.83-.88-1.56,0-2.47Q28,
                        28.25,38.26,17.78a1.55,1.55,0,0,1,2.61,0c3.12,3,6.29,6,9.46,9.06.33.31.6,1,1.13.75s.22-.91.23-1.39c0-1.45,0-2.9.05-4.35.08-1.79,
                        1.43-1.56,2.62-1.59s2.07.24,2.07,1.69c0,1.6,0,3.2,0,4.8h0c0,1.2.08,2.4,0,3.6A5.48,5.48,0,0,0,58.3,35c1.51,1.46,3.25,2.75,4.05,
                        4.89a1.69,1.69,0,0,0,2,.91,2,2,0,0,0,1.72-1.65,1.81,1.81,0,0,0-.92-2.18c-2.07-.86-3.23-2.73-4.82-4.11a3,3,0,0,1-1-2.52c0-2.5,0-5,
                        0-7.5,0-4.17-1.45-5.59-5.56-5.48a13,13,0,0,0-1.76.21A3.29,3.29,0,0,0,49.14,20c-.35,
                        1.32-.8.93-1.45.3-1.6-1.56-3.23-3.08-4.82-4.64-2.33-2.28-4.34-2.28-6.66.06C29.71,22.3,23.31,29,16.69,35.39,12.44,39.52,13.34,41.28,
                        17,44.62Z"
                    />
                </svg>
            </div>
            <div v-on:click="toggle()" class="route">
                <icon v-if="expanded" name="chevron-left" class="icon" />
                <icon v-else name="chevron-right" class="icon" />
            </div>
            <div class="spacer"></div>
            <router-link :class="$route.name === 'dashboard' ? 'route active' : 'route'" to="/">
                <icon name="view-dashboard" class="icon" />
                <span v-if="expanded" class="title">{{ $t("dashboard") }}</span>
            </router-link>
            <router-link v-if="user.permissions.accessories" :class="$route.name === 'accessories' ? 'route active' : 'route'" to="/accessories">
                <icon name="lightbulb-on" class="icon" />
                <span v-if="expanded" class="title">{{ $t("accessories") }}</span>
            </router-link>
            <router-link :class="$route.name === 'log' ? 'route active' : 'route'" to="/log">
                <icon name="text-box" class="icon" />
                <span v-if="expanded" class="title">{{ $t("log") }}</span>
            </router-link>
            <router-link v-if="auth && user.permissions.users" :class="$route.name === 'users' ? 'route active' : 'route'" to="/users">
                <icon name="account-multiple" class="icon" />
                <span v-if="expanded" class="title">{{ $t("users") }}</span>
            </router-link>
            <router-link v-if="user.permissions.bridges" :class="$route.name === 'bridges' ? 'route active' : 'route'" to="/bridges">
                <icon name="qrcode" class="icon" />
                <span v-if="expanded" class="title">{{ $t("bridges") }}</span>
            </router-link>
            <router-link v-if="user.permissions.plugins" :class="$route.name === 'plugins' || $route.name === 'plugin' ? 'route active' : 'route'" to="/plugins">
                <icon name="puzzle" class="icon" />
                <span v-if="expanded" class="title">{{ $t("plugins") }}</span>
            </router-link>
            <div class="fill"></div>
            <router-link v-if="user.permissions.config" :class="$route.name === 'config' ? 'route active' : 'route'" to="/config">
                <icon name="cog" class="icon" />
            </router-link>
        </div>
    </div>
</template>

<script>
    export default {
        name: "navigation",

        computed: {
            auth() {
                return this.$store.state.auth;
            },

            user() {
                return this.$store.state.user;
            },

            expanded() {
                return this.$store.state.navigation;
            },
        },

        methods: {
            toggle() {
                this.$store.commit("NAVIGATION:STATE", !this.$store.state.navigation);

                const event = document.createEvent("HTMLEvents");

                event.initEvent("resize", true, true);

                window.dispatchEvent(event);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #navigation {
        display: flex;
        justify-content: space-around;
        background: var(--navigation-background);
        color: var(--navigation-text);
        padding: 10px 10px 0 10px;

        .logo {
            margin: 0 0 14px 0;

            svg {
                width: 24px;
                height: 24px;

                .background {
                    fill: var(--navigation-highlight);
                }

                .foreground {
                    fill: var(--navigation-background);
                }
            }
        }

        .spacer {
            width: 100%;
            height: 1px;
            background: var(--navigation-border);
            margin: 0 0 14px 0;
        }

        .links {
            display: flex;
            flex-direction: column;

            .route {
                display: flex;
                align-items: center;
                color: var(--navigation-text) !important;
                text-decoration: none !important;
                margin: 0 0 14px 0;
                cursor: pointer;

                .title {
                    padding: 3px 0 0 7px;
                }

                &:hover {
                    color: var(--navigation-highlight-text) !important;
                }

                &.active {
                    color: var(--navigation-active-text) !important;

                    &:hover {
                        color: var(--navigation-active-text) !important;
                    }
                }

                .icon {
                    height: 24px;
                }
            }

            .fill {
                flex: 1;
            }
        }
    }
</style>
