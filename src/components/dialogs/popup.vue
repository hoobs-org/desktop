<template>
    <iframe id="frame" ref="frame" :src="source" frameborder="0"></iframe>
</template>

<script>
    export default {
        name: "popup",

        props: {
            options: Object,
        },

        data() {
            return {
                source: "about:blank",
            };
        },

        mounted() {
            const fetch = () => this.options.value;
            const update = (response) => this.options.update(response);

            setTimeout(() => {
                this.$refs.frame.addEventListener("load", () => {
                    this.$refs.frame.contentWindow.$hoobs = this.$hoobs;
                    this.$refs.frame.contentWindow.$bridge = this.bridge;
                    this.$refs.frame.contentWindow.$close = () => { this.$dialog.close("plugin"); };

                    Object.defineProperty(this.$refs.frame.contentWindow, "$config", {
                        get: () => this.options.items,
                    });

                    Object.defineProperty(this.$refs.frame.contentWindow, "$value", {
                        get: () => fetch(),
                        set: (response) => update(response),
                    });
                }, true);

                this.source = this.options.url;
            }, 100);
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
