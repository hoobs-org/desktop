<template>
    <div id="field">
        <label class="title" v-if="title && title !== ''" v-html="title"></label>
        <span v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></span>
        <div v-for="(item, index) in schema.items.anyOf" class="item" :key="index">
            <checkbox :title="item.title" :checked="items.indexOf(item.enum[0]) !== -1" v-on:input="updateValue($event, index)" />
        </div>
    </div>
</template>

<script>
    import { scaffold } from "../../services/schema";

    export default {
        name: "anyof-field",

        props: {
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            title: String,
        },

        data() {
            return {
                items: (this.value !== undefined) ? this.value : scaffold(this.schema),
            };
        },

        methods: {
            updateValue(value, index) {
                const location = this.items.indexOf(this.schema.items.anyOf[index].enum[0]);

                if (value && location === -1) {
                    this.items.push(this.schema.items.anyOf[index].enum[0]);
                } else if (!value && location !== -1) {
                    this.items.splice(location, 1);
                }

                this.$emit("input", this.items);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;

        .title {
            font-size: 14px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin: 0 0 7px 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        .description {
            font-size: 12px;
            margin: -7px 0 7px 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        .item {
            padding: 0;
        }
    }
</style>
