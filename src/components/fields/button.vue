<template>
    <div id="field">
        <span v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></span>
        <div class="action">
            <div class="button primary" v-on:click="action">{{ schema.title || "Undefined" }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "button-field",

        props: {
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            title: String,
            bridge: String,
            identifier: String,
        },

        data() {
            return {
                action: (this.schema.action || "dialog") === "dialog" ? this.dialog : this.popup,
            };
        },

        methods: {
            update(value) {
                this.$emit("input", value);
                this.$emit("change", value);
            },

            dialog() {
                this.$dialog.open("plugin", {
                    url: `${this.$hoobs.config.host.get("ui")}/plugin/${encodeURIComponent(this.identifier)}/`,
                    value: this.value,
                    update: this.update,
                    bridge: this.bridge,
                });
            },

            popup() {
                const left = (window.screen.width / 2) - (760 / 2);
                const top = ((window.screen.height / 2) - (760 / 2)) / 2;

                const fetch = () => this.value;
                const update = (response) => this.update(response);

                const dialog = window.open(
                    `${this.$hoobs.config.host.get("ui")}/plugin/${encodeURIComponent(this.identifier)}/`,
                    "HOOBS",
                    `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${top},left=${left}`,
                );

                dialog.addEventListener("load", () => {
                    dialog.window.$hoobs = this.$hoobs;
                    dialog.window.$bridge = this.bridge;
                    dialog.window.$close = () => { dialog.close(); };

                    Object.defineProperty(dialog.window, "$value", {
                        get: () => fetch(),
                        set: (response) => update(response),
                    });
                }, true);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #field {
        display: flex;
        flex-direction: column;
        padding: 0 10px 10px 0;

        .description {
            font-size: 12px;
            margin: -7px 0 7px 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        .action {
            padding: 0;
        }
    }
</style>
