<template>
    <fieldset id="field">
        <div class="position">
            <legend v-if="expandable || (label && label !== '')" :class="expanded ? 'legend' : 'legend colapsed'" v-on:click="toggle">
                <span v-html="label"></span>
                <icon v-if="expandable && !expanded" name="chevron-down" class="icon" />
                <icon v-if="expandable && expanded" name="chevron-up" class="icon" />
            </legend>
        </div>
        <div v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></div>
        <div v-if="!expandable || expanded" class="panel">
            <schema
                v-for="(child, key) in schema.properties"
                :bridge="bridge"
                :identifier="identifier"
                :schema="child"
                :value="items[key]"
                :items="items"
                :key="key"
                v-on:input="updateValue($event, key)"
                v-on:save="$emit('save', $event)"
            />
        </div>
    </fieldset>
</template>

<script>
    import SchemaComponent from "@/components/elements/schema.vue";

    import { decamel } from "../../services/schema";

    export default {
        name: "form-field",

        components: {
            "schema": SchemaComponent,
        },

        props: {
            field: [String, Number],
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            title: String,
            bridge: String,
            identifier: String,
        },

        data() {
            return {
                label: "",
                expandable: false,
                expanded: true,
                items: (this.value !== undefined) ? this.value : {},
            };
        },

        watch: {
            value(value) {
                this.items = value;
            },
        },

        mounted() {
            this.label = this.title || decamel(this.field);
            this.expandable = this.schema.expandable;
            this.expanded = this.schema.expanded;
        },

        methods: {
            updateValue(value, child) {
                this.items[child] = value;
                this.$emit("input", this.items);
            },

            toggle() {
                if (this.expandable) {
                    this.expanded = !this.expanded;
                } else {
                    this.expanded = true;
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #field {
        flex: 1;
        padding: 0;
        border: none;

        .position {
            margin: 0 8px 7px 0;
            user-select: none;
            cursor: default;
        }

        .legend {
            width: 100%;
            padding: 0 0 7px 0;
            color: var(--application-highlight);
            font-size: 14px;
            border-bottom: 1px var(--application-border) solid;
            overflow: hidden;
            display: flex;
            flex-direction: row;
            align-items: center;
            white-space: nowrap;
            text-overflow: ellipsis;

            &.colapsed {
                margin: 0 0 10px 0;
            }

            span {
                flex: 1;
            }

            .icon {
                color: var(--application-text);
                opacity: 0.7;
                cursor: pointer;
            }

            &:hover {
                .icon {
                    opacity: 1;
                }
            }
        }

        .description {
            font-size: 12px;
            margin: 0 0 10px 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        .panel {
            padding: 14px 0 0 0;
        }
    }
</style>
