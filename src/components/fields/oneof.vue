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
