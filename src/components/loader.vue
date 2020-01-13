<template>
    <div id="loader">
        <div class="message">{{ value }}</div>
        <marquee :height="3" color="#feb400" background="#856a3b" />
    </div>
</template>

<script>
    import Marquee from "@/components/marquee.vue";

    export default {
        name: "loader",

        components: {
            "marquee": Marquee
        },

        props: {
            value: String
        }
    }
</script>

<style scoped>
    #loader {
        flex: 1;
        display: flex;
        flex-direction: column;
        text-align: left;
    }

    #loader .message {
        font-size: 14px;
        margin: 0 0 7px 0;
    }
</style>