<template>
    <div v-if="connected > 0" class="accessories"></div>
    <loader v-else id="loader" value="Connecting..." />
</template>

<script>
    import Loader from "@/components/loader.vue";

    export default {
        name: "accessories",

        components: {
            "loader": Loader
        },

        computed: {
            connected() {
                return this.$store.state.connected;
            }
        }
    };
</script>

<style scoped>
    #accessories {
        flex: 1;
        background: #262626;
        text-align: left;
        overflow: auto;
    }

    #loader {
        margin: 10% auto;
        width: 350px;
    }
</style>