<template>
    <modal-frame :draggable="true" width="760px" height="760px">
        <div id="plugin">
            <div class="content">
                <iframe ref="frame" :src="source" class="frame" frameborder="0"></iframe>
                <icon class="icon" name="close" v-on:click="$dialog.close('plugin')" />
            </div>
        </div>
    </modal-frame>
</template>

<script>
    import FrameComponent from "@/components/elements/frame.vue";

    export default {
        name: "plugin",

        components: {
            "modal-frame": FrameComponent,
        },

        props: {
            options: Object,
        },

        data() {
            return {
                source: "about:blank",
            };
        },

        mounted() {
            setTimeout(() => {
                this.$refs.frame.removeEventListener("load", this.loader);
                this.$refs.frame.addEventListener("load", this.loader, true);

                this.source = this.options.url;
            }, 100);
        },

        methods: {
            fetch() {
                return this.options.value;
            },

            commit(value) {
                this.options.update(value);
            },

            loader() {
                this.$refs.frame.contentWindow.$bridge = this.options.bridge;

                this.$refs.frame.contentWindow.$close = (reload) => {
                    this.$dialog.close("plugin");

                    if (reload) this.$action.emit("config", "update");
                };

                Object.defineProperty(this.$refs.frame.contentWindow, "$config", {
                    get: () => this.options.items,
                });

                Object.defineProperty(this.$refs.frame.contentWindow, "$value", {
                    get: () => this.fetch(),
                    set: (value) => this.commit(value),
                });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #plugin {
        flex: 1;
        display: flex;
        position: relative;
        flex-direction: column;
        margin: 0 0 0 10px;

        .frame {
            flex: 1;
        }

        .icon {
            height: 20px;
            position: absolute;
            top: -12px;
            right: -3px;
            opacity: 0.7;
            cursor: pointer;
            user-select: none;

            &:hover {
                opacity: 1;
            }
        }

        .button {
            background: #f8f8f8 !important;
            color: #1a1a1a !important;
            border: 1px #dfdfdf solid !important;

            &:hover {
                box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12), 0 1px 3px 0 rgba(0, 0, 0, 0.2) !important;
            }
        }
    }
</style>
