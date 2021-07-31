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
            <div :class="$os === 'mac' ? 'placeholder mac' : 'placeholder'"></div>
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

        .placeholder {
            width: 100.94px;
            height: 38.98px;

            &.mac {
                width: 85px;
            }
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
