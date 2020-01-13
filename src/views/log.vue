<template>
    <div v-if="connected > 0" id="log">
        <span class="message" v-for="(message, midx) in messages" :key="midx">{{ message }}</span>
    </div>
    <loader v-else id="loader" value="Connecting..." />
</template>

<script>
    import Loader from "@/components/loader.vue";

    export default {
        name: "log",

        components: {
            "loader": Loader
        },

        computed: {
            connected() {
                return this.$store.state.connected;
            },

            messages() {
                return this.$store.state.messages;
            }
        },

        mounted() {
            if (this.connected > 0) {
                this.$el.scrollTo(0, this.$el.scrollHeight);
            }
        },

        updated() {
            if (this.connected > 0) {
                this.$el.scrollTo(0, this.$el.scrollHeight);
            }
        }
    }
</script>

<style scoped>
    #log {
        flex: 1;
        margin: 0 20px 20px 0;
        padding: 0 20px 0 7px;
        background: #262626;
        text-align: left;
        font-size: 12px;
        overflow: auto;
    }

    #log .message {
        display: block;
        unicode-bidi: embed;
        font-family: monospace;
        white-space: pre-wrap;
        color: #d1d1d1;
    }

    #loader {
        margin: 7em auto;
        width: 350px;
    }
</style>
