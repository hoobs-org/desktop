<template>
    <div id="field">
        <span class="title" v-if="title && title !== ''" v-html="title"></span>
        <span v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></span>
        <div v-for="(item, index) in schema.oneOf" class="item" :key="index">
            <radio id="light" :name="uuid" :title="item.title" v-model="working" :value="item.enum[0]" v-on:input="$emit('input', $event)" />
        </div>
    </div>
</template>

<script>
    export default {
        name: "oneof-field",

        props: {
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            title: String,
        },

        data() {
            return {
                uuid: "",
                working: null,
            };
        },

        mounted() {
            this.working = this.value;
            this.uuid = `oneof_${Math.random().toString(36).substring(2, 10)}`;
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
