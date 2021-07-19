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
    <div id="icon" class="form">
        <div class="row section">{{ $t("icon") }}</div>
        <form class="row icons" autocomplete="false" method="post" action="/login" v-on:submit.prevent="search()">
            <input type="submit" class="hidden-submit" value="submit" />
            <div class="search">
                <search-field id="query" ref="query" :title="$t('icon_search')" style="padding-right: 0;" v-model="query" v-on:search="search" :autofocus="true" />
                <div v-if="searching" class="loading">
                    <spinner />
                </div>
                <div v-else class="results">
                    <div v-for="(icon, index) in results" :key="`icon:${index}`" class="icon" v-on:click="select(icon)">
                        <icon :name="icon" class="current" />
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import { icons } from "../../services/icons";

    export default {
        name: "icons",

        data() {
            return {
                query: "",
                results: [],
                searching: false,
            };
        },

        mounted() {
            this.search();
        },

        methods: {
            select(icon) {
                this.$emit("update", icon);
            },

            search() {
                if (!this.query || this.query === "") {
                    this.results = icons();

                    return;
                }

                this.searching = true;
                this.results = icons().filter((item) => item.indexOf(this.query.toLowerCase()) >= 0);
                this.searching = false;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #icon {
        overflow: hidden !important;

        .icons {
            margin: 0;
            flex: 1;
            overflow: hidden;

            .search {
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .results {
                flex: 1;
                overflow: auto;

                &.loading {
                    padding: 20px;
                    flex-direction: row;
                    justify-content: flex-start;
                }

                .icon {
                    display: inline-flex;
                    box-sizing: border-box;
                    flex-direction: row;
                    padding: 0;
                    color: var(--modal-text);
                    user-select: none;
                    cursor: pointer;

                    .current {
                        height: 35px;
                        margin: 0 7px 7px 0;
                        padding: 12px;
                        opacity: 0.7;
                        border: 1px var(--application-border) solid;
                    }

                    &:hover {
                        .current {
                            opacity: 1;
                            border: 1px var(--application-highlight) solid;
                        }
                    }
                }
            }
        }
    }
</style>
