<template>
    <div id="notification" :class="snack ? 'snack' : ''">
        <div :class="`type ${message.type}`"></div>
        <icon v-if="message.type === 'error'" name="alert-octagon" class="icon display" />
        <icon v-else-if="message.icon" :name="message.icon" class="icon display" />
        <div v-else class="text-only"></div>
        <div class="details">
            <div class="title">{{ message.title }}</div>
            <div class="description">{{ message.description }}</div>
            <router-link v-if="message.type === 'error'" to="/log" class="logs">{{ $t("open_log") }}</router-link>
        </div>
        <icon v-on:click="dismiss(message.id)" name="close" class="icon close" />
    </div>
</template>

<script>
    export default {
        name: "notification",

        props: {
            message: Object,
            snack: Boolean,
        },

        methods: {
            dismiss(id) {
                if (this.snack) {
                    this.$store.commit("NOTIFICATION:DISMISS:LATEST");
                } else {
                    this.$store.commit("NOTIFICATION:DISMISS", id);
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #notification {
        height: 70px;
        margin: 0 20px 14px 20px;
        display: flex;
        background: var(--application-dark);
        user-select: none;

        &.snack {
            margin: 0;
        }

        .type {
            width: 7px;
            height: 100%;
            background: var(--application-text);

            &.success {
                background: #019420;
            }

            &.warn {
                background: #feb400;
            }

            &.error {
                background: #e30505;
            }
        }

        .display {
            width: 60px;
            height: 40px;
            padding: 15px 0;
            display: flex;
            justify-content: space-around;
            align-items: center;
            opacity: 0.7;
        }

        .text-only {
            width: 20px;
        }

        .close {
            width: 14px;
            height: 14px;
            font-size: 14px;
            opacity: 0.7;
            margin: 7px;
            cursor: pointer;

            &:hover {
                opacity: 1;
            }
        }

        .details {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 14px 0;

            .title {
                font-weight: bold;
                font-size: 14px;
            }

            .description {
                font-size: 12px;
            }

            .logs {
                font-size: 14px;
                margin: 4px 0 0 0;
            }
        }
    }
</style>
