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
    <div id="location" class="form">
        <div class="row section">{{ $t("location") }}</div>
        <form class="row locations" autocomplete="false" method="post" action="/login" v-on:submit.prevent="search()">
            <input type="submit" class="hidden-submit" value="submit" />
            <div class="search">
                <search-field id="query" ref="query" :title="$t('location_search')" :description="$t('location_description')" style="padding-right: 0;" v-model="query" v-on:search="search" :autofocus="true" />
                <div v-if="searching" class="loading">
                    <spinner />
                </div>
                <div v-else class="results">
                    <div v-for="(location, index) in locations" :key="`location:${index}`" class="item" v-on:click="select(locations[index])">
                        <icon name="crosshairs-gps" class="icon" />
                        <span class="title">{{ location.name }}, {{ (country.find((country) => country.value === location.country) || {}).text || location.country }}</span>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
    import countries from "@/lang/countries.json";

    export default {
        name: "location",

        data() {
            return {
                query: "",
                locations: [],
                searching: false,
                country: countries,
            };
        },

        methods: {
            select(location) {
                this.$emit("update", location);
            },

            async search() {
                if (!this.query || this.query === "") {
                    this.locations = [];

                    return;
                }

                this.searching = true;

                this.locations = (await this.$hoobs.location(this.query, 10)).map((item) => ({
                    id: item.id,
                    name: item.name,
                    country: item.country,
                }));

                this.searching = false;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #location {
        .locations {
            margin: 0;

            .search {
                width: 100%;
                display: flex;
                flex-direction: column;
            }

            .results {
                display: flex;
                flex-direction: column;

                &.loading {
                    padding: 20px;
                    flex-direction: row;
                    justify-content: flex-start;
                }

                .item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    padding: 7px;
                    border-bottom: var(--modal-border) 1px solid;
                    color: var(--modal-text);
                    user-select: none;
                    cursor: pointer;

                    &:last-child {
                        border-bottom: 0 none;
                    }

                    .title {
                        opacity: 0.7;
                    }

                    .icon {
                        height: 20px;
                        margin: 0 7px 0 0;
                        color: var(--modal-highlight);
                        opacity: 0.7;
                    }

                    &:hover {
                        .title {
                            opacity: 1;
                        }

                        .icon {
                            opacity: 1;
                        }
                    }
                }
            }
        }
    }
</style>
