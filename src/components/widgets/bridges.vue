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
    <div v-if="bridges.filter((item) => !item.running).length === 0" id="widget">
        <div class="title">{{ $t("bridges") }}</div>
        <div class="value">{{ bridges.filter((item) => item.running).length }} {{ $t("running") }}</div>
    </div>
    <div v-else-if="bridges.filter((item) => item.running).length === 0" id="widget" class="down">
        <div class="title">{{ $t("bridges") }}</div>
        <div class="value">{{ bridges.filter((item) => !item.running).length }} {{ $t("down") }}</div>
    </div>
    <div v-else id="widget" class="partial">
        <div class="title">{{ $t("bridges") }}</div>
        <div class="value">
            {{ bridges.filter((item) => item.running).length }} {{ $t("running") }}
            <br />
            {{ bridges.filter((item) => !item.running).length }} {{ $t("down") }}
        </div>
    </div>
</template>

<script>
    export default {
        name: "bridges-widget",

        computed: {
            bridges() {
                return this.$store.state.bridges;
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
        padding: 14px;
        position: relative;
        cursor: default;
        user-select: none;

        &.partial {
            border: 2px #feb600 solid;
        }

        &.down {
            border: 2px #e30505 solid;
        }

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
            font-size: 18px;
        }
    }
</style>
