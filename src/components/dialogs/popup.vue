<template>
    <iframe id="frame" ref="frame" :src="options.url" frameborder="0"></iframe>
</template>

<script>
    export default {
        name: "popup",

        props: {
            options: Object,
        },

        mounted() {
            const fetch = () => this.options.value;
            const update = (response) => this.options.update(response);

            setTimeout(() => {
                this.$refs.frame.addEventListener("load", () => {
                    this.$refs.frame.contentWindow.$hoobs = this.$hoobs;
                    this.$refs.frame.contentWindow.$bridge = this.bridge;
                    this.$refs.frame.contentWindow.$config = this.options.items;
                    this.$refs.frame.contentWindow.$close = () => { this.$dialog.close("plugin"); };

                    Object.defineProperty(this.$refs.frame.contentWindow, "$value", {
                        get: () => fetch(),
                        set: (response) => update(response),
                    });
                }, true);
            }, 10);
        },
    };
</script>

<style lang="scss" scoped>
    #frame {
        width: 1px;
        height: 1px;
        visibility: hidden;
    }
</style>
