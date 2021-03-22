<template>
    <div id="field">
        <span v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></span>
        <div class="action">
            <div class="button primary" v-on:click="action">{{ schema.title || "Undefined" }}</div>
        </div>
    </div>
</template>

<script>
    const PLUGIN_URL = (process.env.API_URL || process.env.VUE_APP_API || "/api").replace("/api", "/ui/plugin");

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
                action: (typeof this[this.schema.action || "dialog"] === "function") ? this[this.schema.action || "dialog"] : () => { /* null */ },
            };
        },

        methods: {
            update(value) {
                this.$emit("input", value);
                this.$emit("change", value);
            },

            dialog() {
                this.$dialog.open("plugin", {
                    url: `${PLUGIN_URL}/${this.identifier}`,
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

                const dialog = window.open(`${PLUGIN_URL}/${this.identifier}`, "HOOBS", `toolbar=no,status=no,menubar=no,resizable=yes,width=760,height=760,top=${top},left=${left}`);

                dialog.addEventListener("load", () => {
                    dialog.window.$hoobs = this.$hoobs;
                    dialog.window.$bridge = this.bridge;

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
