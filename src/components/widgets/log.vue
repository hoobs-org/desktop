<template>
    <div id="widget">
        <div ref="messages" class="messages">
            <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" />
        </div>
    </div>
</template>

<script>
    import MessageComponent from "@/components/elements/message.vue";

    const SCROLL_DELAY = 10;

    export default {
        name: "log-widget",

        components: {
            "message": MessageComponent,
        },

        computed: {
            messages() {
                return this.$store.state.log.filter((item) => item.level !== "debug");
            },
        },

        mounted() {
            setTimeout(() => {
                if (this.$refs.messages) this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
            }, SCROLL_DELAY);
        },

        updated() {
            if (this.$refs.messages) this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        padding: 20px;
        color: var(--widget-text);
        background: var(--widget-background);
        backdrop-filter: var(--transparency);
        cursor: default;

        .dim {
            opacity: 0.3;
        }

        .messages {
            flex: 1;
            font-size: 10px;
            -ms-overflow-style: none;
            scrollbar-width: none;
            overflow: auto;

            &::-webkit-scrollbar {
                display: none;
            }
        }
    }
</style>
