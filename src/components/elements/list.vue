<template>
    <draggable v-if="sort" id="list" :class="selected && selected !== '' ? 'list open' : 'list'" handle=".drag" ghost-class="ghost" v-model="working" v-on:end="save">
        <div
            v-for="(item, index) in working"
            :key="`entry:${index}`"
            :class="`${item[value]}` === (selected || initial) ? 'item open' : 'item'"
        >
            <icon name="drag-horizontal" class="icon drag" />
            {{ item[display] }}
        </div>
    </draggable>
    <div v-else id="list" :class="selected && selected !== '' ? 'list open' : 'list'">
        <router-link
            v-for="(item, index) in values"
            :key="`entry:${index}`"
            :class="`${item[value]}` === (selected || initial) ? 'item open' : 'item'"
            :to="navigate(controller, item[value], query)"
        >{{ item[display] }}</router-link>
    </div>
</template>

<script>
    import DraggableComponent from "vuedraggable";

    export default {
        name: "list",

        components: {
            "draggable": DraggableComponent,
        },

        props: {
            values: Array,
            value: String,
            display: String,
            selected: String,
            controller: String,
            sort: Boolean,
            initial: String,
            query: String,
        },

        data() {
            return {
                working: [],
            };
        },

        watch: {
            values() {
                this.working = this.values;
            },
        },

        mounted() {
            this.working = this.values;
        },

        methods: {
            navigate(controller, action, query) {
                let path = `/${controller}`;

                if (action && action !== "") path = `${path}/${action}`;
                if (query && query !== "") path = `${path}?${query}`;

                return path;
            },

            save() {
                this.$emit("update", this.working);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #list {
        min-width: 200px;
        margin: 0 10px 20px 10px;
        padding: 10px 20px;
        color: var(--widget-text);
        background: var(--widget-background);
        backdrop-filter: var(--transparency);
        user-select: none;
        overflow: auto;

        .item {
            color: var(--application-text) !important;
            border-top: 1px var(--application-border) solid;
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 14px 0;
            width: 100%;

            &:first-child {
                border-top: 0 none;
            }

            &.open {
                color: var(--application-highlight) !important;

                &:hover {
                    color: var(--application-highlight) !important;
                }
            }

            &:hover {
                color: var(--application-highlight-text) !important;
                text-decoration: none !important;
            }

            .drag {
                margin: -2px 7px 0 0;
            }
        }

        .ghost {
            background: var(--application-border);
        }
    }
</style>
