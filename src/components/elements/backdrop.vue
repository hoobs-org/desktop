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
    <div id="backdrop" v-on:click="select()" :class="value === `url('/defaults/backdrops/${image}')` ? 'active' : ''" :style="`background-image: url('/defaults/backdrops/${image}');`"></div>
</template>

<script>
    export default {
        name: "backdrop",
        props: { image: String, value: String },

        methods: {
            select() {
                this.$emit("input", `url('/defaults/backdrops/${this.image}')`);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #backdrop {
        width: 104px;
        height: 59px;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
        box-sizing: border-box;
        user-select: none;
        opacity: 0.6;
        cursor: pointer;

        &:first-child {
            margin: 0 10px 0 0;
        }

        &:last-child {
            margin: 0;
        }

        &:hover {
            opacity: 0.8;
        }

        &.active {
            border: var(--modal-highlight) 2px solid;
            opacity: 1;
        }

        &.add {
            display: flex;
            align-items: center;
            justify-content: space-around;
            border: var(--modal-border) 1px solid;
            opacity: 1;

            &:hover {
                border: var(--modal-highlight) 1px solid;
            }

            .icon {
                color: var(--modal-border);
            }
        }
    }
</style>
