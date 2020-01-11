<template>
    <div id="log">
        <span class="message" v-for="(message, midx) in messages" :key="midx">{{ message }}</span>
    </div>
</template>

<script>
    export default {
        name: "log",

        computed: {
            messages() {
                return this.$store.state.messages;
            }
        },

        mounted() {
            this.$el.scrollTo(0, this.$el.scrollHeight);
        },

        updated() {
            this.$el.scrollTo(0, this.$el.scrollHeight);
        }
    }
</script>

<style scoped>
    #log {
        flex: 1;
        margin: 0 0 20px 0;
        padding: 0 20px 0 7px;
        background: #262626;
        overflow: auto;
        text-align: left;
        font-size: 12px;
    }

    #log .message {
        display: block;
        unicode-bidi: embed;
        font-family: monospace;
        white-space: pre-wrap;
        color: #d1d1d1;
    }
</style>
