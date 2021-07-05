<template>
    <div id="field">
        <div v-for="(item, index) in items" class="item" :key="index">
            <div class="field">
                <schema
                    :bridge="bridge"
                    :identifier="identifier"
                    :title="schema.title"
                    :description="schema.description"
                    :placeholder="schema.placeholder || schema.example"
                    :field="index"
                    :schema="schema.items"
                    :value="item"
                    :items="items"
                    v-on:input="updateValue($event, index)"
                />
            </div>
            <div class="action">
                <icon name="delete" v-if="items.length > 0" v-on:click="removeItem(index)" :key="`remove-${index}`" class="icon" />
            </div>
        </div>
        <icon name="plus-circle" v-on:click="addItem()" class="icon add" />
    </div>
</template>

<script>
    import SchemaComponent from "@/components/elements/schema.vue";

    import { scaffold } from "../../services/schema";

    export default {
        name: "root-field",

        components: {
            "schema": SchemaComponent,
        },

        props: {
            field: String,
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            title: String,
            bridge: String,
            identifier: String,
        },

        data() {
            return {
                items: (this.value !== undefined) ? this.value : [],
            };
        },

        methods: {
            addItem() {
                this.items.push(scaffold(this.schema)[0]);
            },

            removeItem(index) {
                this.items.splice(index, 1);

                this.$emit("input", this.items);
                this.$emit("change", this.items);
            },

            updateValue(value, index) {
                this.items.splice(index, 1, value);

                this.$emit("input", this.items);
                this.$emit("change", this.items);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #field {
        flex: 1;
        padding: 0 10px 0 0;

        .position {
            margin: 0 0 7px 0;
            user-select: none;
            cursor: default;
        }

        .legend {
            color: var(--application-highlight);
            padding: 0 0 7px 0;
            font-size: 14px;
            border-bottom: 1px var(--application-border) solid;
            overflow: hidden;

            &.collapsed {
                margin: 0;
            }
        }

        .description {
            font-size: 12px;
            margin: 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        .add {
            cursor: pointer;
            margin: 10px 0 0 0;
            opacity: 0.7;

            &:hover {
                opacity: 1;
            }
        }

        .item {
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            position: relative;
            padding: 20px 10px 10px 30px;
            margin: 10px 0 0 0;

            &::after {
                content: '';
                width: 100%;
                height: 100%;
                background: var(--application-input-text);
                opacity: 0.017;
                position: absolute;
                top: 0;
                left: 0;
                z-index: -1;
            }

            .field {
                flex: 1;
            }

            .action {
                height: 32px;
                display: flex;
                flex-direction: row;
                align-items: center;
                margin: 0;
                cursor: pointer;
                opacity: 0.7;

                &:hover {
                    opacity: 1;
                }
            }
        }
    }
</style>
