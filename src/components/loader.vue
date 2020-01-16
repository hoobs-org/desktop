<template>
    <div v-if="initilized" id="loader">
        <div class="message">{{ value }}</div>
        <marquee :height="3" color="#feb400" background="#856a3b" />
    </div>
</template>

<script>
    export default {
        name: "loader",

        data() {
            return {
                timer: null
            }
        },

        props: {
            value: String,
            initilized: {
                type: Boolean,
                default: false
            }
        },

        mounted() {
            this.timer = setTimeout(() => {
                this.initilized = true;
            }, 250);
        },

        destroyed() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
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