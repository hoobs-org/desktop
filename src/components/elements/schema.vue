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
    <div id="directive" :class="type === 'checkbox' || type === 'radio' ? 'collapsed' : 'normal'">
        <component
            :is="type"
            :title="schema.title"
            :description="schema.description"
            :placeholder="schema.placeholder || schema.example"
            :min="schema.minimum"
            :max="schema.maximum"
            :bridge="bridge"
            :identifier="identifier"
            :field="field"
            :schema="schema"
            :value="value"
            :default="schema.default"
            :checked="value"
            :options="options"
            :items="items"
            v-on:input="$emit('input', $event)"
            v-on:save="$emit('save', $event)"
        />
    </div>
</template>

<script>
    import { field } from "../../services/schema";

    export default {
        name: "schema",

        props: {
            field: [String, Number],
            schema: Object,
            value: [Object, String, Number, Boolean, Array],
            bridge: String,
            identifier: String,
            items: [Object, Array],
        },

        computed: {
            type() {
                return field(this.schema);
            },

            options() {
                if (this.schema.enum !== undefined && Array.isArray(this.schema.enum)) return this.schema.enum.map((item) => ({ value: item, text: item }));
                if (this.schema.oneOf !== undefined && Array.isArray(this.schema.oneOf)) return this.schema.oneOf.map((item) => ({ value: item.enum[0], text: item.title }));

                return [];
            },
        },
    };
</script>

<style lang="scss" scoped>
    #directive {
        margin: 20px 0 0 0;

        &:first-child {
            margin: 0;
        }

        &.collapsed {
            margin: 0;
        }
    }
</style>
