<template>
    <div v-on:click.stop id="notifications">
        <div class="title">
            {{ $t("notifications") }}
            <icon v-on:click="$menu.close()" class="icon" name="close" />
        </div>
        <div v-if="notifications.length === 0" class="empty">{{ $t("notifications_empty") }}</div>
        <div v-else class="list">
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
