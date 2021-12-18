<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2020 HOOBS                                                                       |
 |                                                                                                |
 | This program is free software: you can redistribute it and/or modify                           |
 | it under the terms of the GNU General Public License as published by                           |
 | the Free Software Foundation, either version 3 of the License, or                              |
 | (at your option) any later version.                                                            |
 |                                                                                                |
 | This program is distributed in the hope that it will be useful,                                |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of                                 |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  |
 | GNU General Public License for more details.                                                   |
 |                                                                                                |
 | You should have received a copy of the GNU General Public License                              |
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.                          |
 -------------------------------------------------------------------------------------------------->

<template>
    <div id="field">
        <div class="position">
            <legend :class="schema.description && schema.description !== '' ? 'legend collapsed' : 'legend'" v-html="title || format(field)"></legend>
        </div>
        <div v-if="schema.description && schema.description !== ''" class="description" v-html="schema.description"></div>
        <div v-for="(item, index) in items" class="item" :key="index">
            <div class="field">
                <text-field :value="item.key" v-on:input="updateKey($event, index)" />
            </div>
            <div class="field">
                <component :is="type" :placeholder="schema.placeholder || schema.example" :min="schema.minimum" :max="schema.maximum" :value="item.value" v-on:input="updateValue($event, index)" />
            </div>
            <div class="action">
                <icon name="delete" v-if="items.length > 0" v-on:click="removeItem(index)" :key="`remove-${index}`" class="icon" />
            </div>
        </div>
        <icon name="plus-circle" v-if="!schema.maxItems || items.length < schema.maxItems" v-on:click="addItem()" class="icon add" />
    </div>
</template>

<script>
    import { field, decamel, prune } from "../../services/schema";

    export default {
        name: "keys-field",

        props: {
            field: [String, Number],
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            title: String,
            identifier: String,
        },

        computed: {
            type() {
                return field((Object.keys(this.schema.patternProperties)[0] !== undefined) ? this.schema.patternProperties[Object.keys(this.schema.patternProperties)[0]] : { type: "string" });
            },
        },

        data() {
            return { label: "", items: (this.value !== undefined) ? Object.keys(this.value).map((item) => ({ key: item, value: this.value[item] })) : [] };
        },

        mounted() {
            this.label = this.title || decamel(this.field);
        },

        methods: {
            format(value) {
                if (!Number.isNaN(parseInt(value, 10))) return "";
                if (!value || value === "") return value;

                return decamel(value);
            },

            addItem() {
                this.items.push({});
            },

            removeItem(index) {
                this.items.splice(index, 1);

                this.assemble();
            },

            updateKey(value, index) {
                if (!this.items.find((item) => item.key === value)) this.items[index].key = value;

                this.assemble();
            },

            updateValue(value, index) {
                this.items[index].value = value;
                this.assemble();
            },

            assemble() {
                const working = {};

                for (let i = 0; i < this.items.length; i += 1) {
                    if (this.items[i].key && this.items[i].key !== "") working[this.items[i].key] = this.items[i].value;
                }

                this.$emit("input", prune(working));
                this.$emit("change", prune(working));
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
            padding: 20px 10px 20px 20px;
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
                opacity: 1;
            }

            .action {
                height: 32px;
                display: flex;
                flex-direction: row;
                align-items: center;
                cursor: pointer;
                opacity: 0.7;

                &:hover {
                    opacity: 1;
                }
            }
        }
    }
</style>
