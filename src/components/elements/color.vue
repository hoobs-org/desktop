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
    <div id="color" v-on:click="select()" :class="value.toLowerCase() === color.toLowerCase() ? 'active' : ''" :style="`background-color: ${color};`">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    </div>
</template>

<script>
    export default {
        name: "color",
        props: { value: String, color: String },

        methods: {
            select() {
                this.$emit("input", this.color.toLowerCase());
            },
        },
    };
</script>

<style lang="scss" scoped>
    #color {
        width: 34px;
        height: 33px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin: 0 7px 7px 0;
        box-sizing: border-box;
        cursor: pointer;

        &:last-child {
            margin: 0;
        }

        svg {
            width: 24px;
            height: 24px;
            display: none;
        }

        &:hover {
            border: var(--modal-highlight) 2px solid;
        }

        &.active {
            &:hover {
                border: 0 none;
            }

            svg {
                display: block;
            }
        }
    }
</style>
