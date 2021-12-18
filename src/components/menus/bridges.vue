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
    <div v-on:click.stop id="menu" :style="`left: ${left}px`">
        <div v-for="(bridge, index) in selected" :key="`bridge:${index}`" class="item">
            <checkbox :id="`bridge_${index}`" :title="bridge.text" v-model="bridge.selected" />
        </div>
    </div>
</template>

<script>
    export default {
        name: "bridges",
        props: { options: Object },

        data() {
            return { left: 0, selected: [] };
        },

        mounted() {
            this.left = this.options.opener.offsetLeft;
            this.selected = this.options.values;
        },

        watch: {
            selected() {
                this.$action.emit("log", "bridges", this.selected);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #menu {
        min-width: 120px;
        position: absolute;
        top: 34px;
        left: 0;
        display: flex;
        padding: 0 0 7px 0;
        flex-direction: column;
        color: var(--menu-text);
        background: var(--menu-background);
        backdrop-filter: var(--transparency);
        box-shadow: var(--elevation);
        border-radius: 0;
        z-index: 3100;

        .close {
            position: absolute;
            top: 14px;
            right: 14px;
            font-size: 17px;
            color: var(--application-text);
            cursor: pointer;
        }

        .item {
            padding: 7px 20px 0 20px;
            display: block;
            color: var(--menu-text) !important;
            text-decoration: none !important;
            user-select: none;
            cursor: pointer;

            &.disabled {
                opacity: 0.4;
                cursor: default;

                &:hover {
                    background: unset;
                    color: var(--menu-text) !important;
                }
            }
        }
    }
</style>
