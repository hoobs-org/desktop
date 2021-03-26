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
            items: [Object, Array],
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
                const url = `${this.$hoobs.config.host.get("ui")}/plugin/${encodeURIComponent(this.identifier)}/`;
                const domain = (this.$hoobs.config.host.get().split("/")[2]).split(":");

                const token = encodeURIComponent(btoa(JSON.stringify({
                    host: domain[0],
                    port: domain.length > 1 ? parseInt(domain[1], 10) : 80,
                    bridge: this.bridge,
                    plugin: this.identifier,
                    token: this.$hoobs.config.token.get(),
                })));

                switch (this.schema.action) {
                    case "oauth":
                        this.$action.emit("window", "open", `${url}?token=${token}`);
                        break;

                    case "window":
                        this.$action.emit("window", "open", `${url}?token=${token}`);
                        break;

                    default:
                        this.$dialog.open("plugin", {
                            url: `${url}?token=${token}`,
                            value: this.value,
                            items: this.items,
                            update: this.update,
                            bridge: this.bridge,
                        });

                        break;
                }
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
