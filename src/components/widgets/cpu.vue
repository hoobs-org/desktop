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
    <div id="widget">
        <div class="title">{{ $t("cpu") }}</div>
        <div class="value">{{ (cpu || {}).used || 0 }}%</div>
    </div>
</template>

<script>
    export default {
        name: "cpu-widget",

        computed: {
            cpu() {
                return this.$store.state.cpu;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        flex: 1;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
        padding: 14px;
        position: relative;
        cursor: default;
        user-select: none;

        .title {
            font-size: 15px;
        }

        .value {
            flex: 1;
            display: flex;
            align-items: center;
            align-content: center;
            color: var(--widget-highlight);
            text-align: center;
            font-size: 22px;
        }
    }
</style>
