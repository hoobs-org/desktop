<template>
    <div id="field">
        <span v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></span>
        <div v-if="schema.title && schema.populated_title" class="action">
            <div v-if="value" class="button" v-on:click="clear">{{ schema.populated_title }}</div>
            <div v-else class="button primary" v-on:click="open">{{ schema.title }}</div>
        </div>
        <div v-else class="action">
            <div class="button primary" v-on:click="open">{{ schema.title || "Undefined" }}</div>
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

        methods: {
            update(value) {
                this.$emit("input", value);
                this.$emit("change", value);
            },

            clear() {
                this.$emit("input", undefined);
                this.$emit("change", undefined);
            },

            open() {
                let dialog = "dialog";

                switch (this.schema.action) {
                    case "popup":
                        dialog = "popup";
                        break;

                    default:
                        dialog = "dialog";
                        break;
                }

                this.$dialog.open(dialog, {
                    url: `${this.$hoobs.config.host.get("ui")}/plugin/${encodeURIComponent(this.identifier)}/`,
                    value: this.value,
                    update: this.update,
                    bridge: this.bridge,
                });
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
