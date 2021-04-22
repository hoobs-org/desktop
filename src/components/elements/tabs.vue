<template>
    <div id="tabs">
        <div v-for="(item, index) in values" :key="`tab:${index}`" v-on:click="change(item[field])" :class="item[field] === value ? 'tab open' : 'tab'">
            <div class="title">{{ item[display] }}</div>
        </div>
        <div class="fill"></div>
    </div>
</template>

<script>
    export default {
        name: "spinner",

        props: {
            value: String,
            values: Array,
            field: {
                type: String,
                default: "value",
            },
            display: {
                type: String,
                default: "display",
            },
        },

        methods: {
            change(value) {
                this.$emit("update", value);
                this.$emit("change", value);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #tabs {
        margin: 20px 0 0 0;
        height: 44px;
        display: flex;
        flex-direction: row;
        overflow-x: auto;

        .tab {
            padding: 0 20px;
            display: flex;
            flex-direction: row;
            align-content: center;
            align-items: center;
            border-bottom: 1px var(--application-border) solid;
            font-size: 14px;
            cursor: pointer;
            user-select: none;
            opacity: 0.7;

            &.open {
                opacity: 1;
                border-top: 2px var(--application-highlight) solid;
                border-right: 1px var(--application-border) solid;
                border-bottom: 0 none;
                border-left: 1px var(--application-border) solid;
            }

            &:hover {
                opacity: 1;
            }
        }

        .fill {
            flex: 1;
            border-bottom: 1px var(--application-border) solid;
        }
    }
</style>
