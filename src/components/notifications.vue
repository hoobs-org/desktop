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
    <div v-on:click.stop id="notifications">
        <div class="title">
            {{ $t("notifications") }}
            <icon v-on:click="$menu.close()" class="icon" name="close" />
        </div>
        <div v-if="notifications.length === 0" class="empty">{{ $t("notifications_empty") }}</div>
        <div v-else class="list">
            <div v-if="notifications.length > 1" class="clear-all">
                <div v-on:click="clear" class="clear-all-button">{{ $t("clear") }}</div>
            </div>
            <notification v-for="(notification, index) in notifications" :key="`notification:${index}`" :message="notification" />
        </div>
    </div>
</template>

<script>
    import NotificationComponent from "@/components/elements/notification.vue";

    export default {
        name: "notifications",

        components: {
            "notification": NotificationComponent,
        },

        computed: {
            notifications() {
                return this.$store.state.notifications;
            },
        },

        data() {
            return {
                active: true,
                timeout: undefined,
            };
        },

        methods: {
            clear() {
                this.$store.commit("NOTIFICATION:DISMISS:ALL");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #notifications {
        width: 370px;
        height: 100%;
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        flex-direction: column;
        background: var(--application-drawer);
        backdrop-filter: var(--transparency);
        z-index: 3200;

        .title {
            display: flex;
            justify-content: space-between;
            color: var(--application-highlight);
            border-bottom: var(--application-border) 1px solid;
            user-select: none;
            margin: 14px;
            padding: 0 0 7px 0;

            .icon {
                height: 17px;
                color: var(--application-text);
                user-select: none;
                cursor: pointer;
            }
        }

        .list {
            flex: 1;
            overflow: auto;

            .clear-all {
                margin: 0 20px;
                display: flex;
                justify-content: flex-end;
                user-select: none;

                .clear-all-button {
                    font-size: 14px;
                    padding: 4px;
                    cursor: pointer;
                    opacity: 0.5;

                    &:hover {
                        opacity: 1;
                    }
                }
            }
        }

        .empty {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            padding: 0 0 20% 0;
            user-select: none;
            font-size: 14px;
        }
    }
</style>
