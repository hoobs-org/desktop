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
    <div id="icon" v-on:click="$emit('click', $event)">
        <svg viewBox="0 0 24 24">
            <path fill="currentColor" :d="path" />
        </svg>
        <slot />
    </div>
</template>

<script>
    import { icon } from "../../services/icons";

    export default {
        name: "icon",

        props: {
            name: {
                type: String,
                required: true,
            },
        },

        computed: {
            path() {
                return icon(this.name);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #icon {
        height: 24px;

        svg {
            height: 100%;
        }
    }
</style>
