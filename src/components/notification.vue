<template>
    <div id="notification">
        <div v-if="value.type === 'error'" class="error">
            <span class="icon">error</span>
        </div>
        <div v-else-if="value.type === 'warning'" class="warning">
            <span class="icon">warning</span>
        </div>
        <div v-else class="info">
            <span class="icon">notifications</span>
        </div>
        <div class="body">
            <span class="hostname">{{ value.hostname }}</span>
            <span class="title">{{ value.title }}</span>
            <p class="message">
                {{ value.message }}
            </p>
        </div>
        <div class="icon close" v-on:click="close(value.id)">close</div>
    </div>
</template>

<script>
    export default {
        name: "notification",

        props: {
            value: Object
        },

        computed: {
            notifications() {
                return this.$store.state.notifications;
            }
        },

        mounted() {
            setTimeout(() => {
                this.close();
            }, 1000 * 7);
        },

        methods: {
            close() {
                const index = this.notifications.findIndex(n => n.id === this.value.id);

                if (index > -1) {
                    this.$store.commit("dismissNotification", index);
                } else {
                    this.$store.commit("clearNotifications", []);
                }
            }
        }
    };
</script>

<style scoped>
    #notification {
        width: 100%;
        position: relative;
        margin: 7px 0 0 0;
        color: #515151;
        text-align: left;
        display: flex;
        flex-direction: row;
        border-radius: 3px;
        box-sizing: border-box;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12);
    }

    #notification .body {
        padding: 14px 32px 14px 20px;
        border-radius: 0 3px 3px 0;
        display: flex;
        flex-direction: column;
        background: #fff;
        font-size: 14px;
        opacity: 0.9;
        flex: 1
    }

    #notification .error,
    #notification .warning,
    #notification .info {
        display: flex;
        align-content: center;
        align-items: center;
        padding: 0 20px;
        border-radius: 3px 0 0 3px;
        opacity: 0.9;
    }

    #notification .error .icon,
    #notification .warning .icon,
    #notification .info .icon {
        font-size: 32px;
        opacity: 0.5;
    }

    #notification .error {
        color: #fff;
        background: #e30505;
    }

    #notification .warning {
        color: #fff;
        background: #feb400;
    }

    #notification .info {
        color: #fff;
        background: #949494
    }

    #notification .hostname {
        color: #949494;
        font-size: 9px;
    }

    #notification .title {
        font-weight: bold;
        font-size: 12px;
    }

    #notification .message {
        margin: 0;
        font-size: 12px;
    }

    #notification .close {
        position: absolute;
        top: 7px;
        right: 7px;
        font-size: 14px;
        cursor: pointer;
    }
</style>
