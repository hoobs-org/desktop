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
    <div :key="version" v-if="user.permissions.plugins" id="plugins">
        <context />
        <div class="content">
            <list value="id" display="display" :values="bridges" :selected="id" initial="library" controller="plugins" />
            <div v-if="id && id !== 'library'" class="screen">
                <div class="section first">{{ $t("installed_plugins") }}</div>
                <div class="wrapper">
                    <div v-if="installed.length > 0" class="cards">
                        <plugin v-for="(plugin, index) in installed" :key="`installed:${index}`" :subject="plugin" />
                    </div>
                    <div v-else-if="!loading" class="empty">
                        <div class="message">
                            {{ $t("no_plugins_installed") }}
                            <router-link to="/plugins">{{ $t("plugin_search") }}</router-link>
                        </div>
                    </div>
                    <div v-else class="loading">
                        <spinner />
                    </div>
                </div>
            </div>
            <div v-else class="screen">
                <form class="input" autocomplete="false" method="post" action="/login" v-on:submit.prevent="search()">
                    <input type="submit" class="hidden-submit" value="submit" />
                    <div class="search">
                        <search-field id="query" ref="query" style="padding-right: 0;" :placeholder="$t('search')" v-model="query" v-on:search="search" />
                    </div>
                </form>
                <div class="wrapper">
                    <div v-if="featured.length > 0" class="section">{{ $t("featured_plugins") }}</div>
                    <div v-if="featured.length > 0" class="cards">
                        <plugin v-for="(plugin, index) in featured" :key="`featured:${index}`" :subject="plugin" />
                    </div>
                    <div v-if="popular.length > 0" class="section">{{ $t("popular_plugins") }}</div>
                    <div v-if="popular.length > 0" class="cards">
                        <plugin v-for="(plugin, index) in popular" :key="`popular:${index}`" :subject="plugin" />
                    </div>
                    <div v-if="results.length > 0" class="section">{{ $t("search_results") }}</div>
                    <div v-if="results.length > 0" class="cards">
                        <plugin v-for="(plugin, index) in results" :key="`search:${index}`" :subject="plugin" />
                    </div>
                    <div v-if="total > 1 && pagination.length > 1" class="pagination">
                        <div v-if="pagination[0] > 0" v-on:click="paginate(0, 27)" class="page">1</div>
                        <div v-if="pagination[0] > 0" class="more">...</div>
                        <div v-for="(page, index) in pagination" :key="`page:${index}`" v-on:click="paginate(page * 27, 27)" :class="`${page === current ? 'page off' : 'page'}`">{{ page + 1 }}</div>
                        <div v-if="pagination[pagination.length - 1] < total - 1" class="more">...</div>
                        <div v-if="pagination[pagination.length - 1] < total - 1" v-on:click="paginate((total - 1) * 27, 27)" class="page">{{ total }}</div>
                    </div>
                    <div v-if="!loading && featured.length === 0 && popular.length === 0 && results.length === 0" class="empty">
                        <div class="message">
                            {{ $t("no_results") }}
                        </div>
                    </div>
                    <div v-if="loading" class="loading">
                        <spinner />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import ListComponent from "@/components/elements/list.vue";
    import PluginComponent from "@/components/elements/plugin.vue";

    export default {
        name: "plugins",

        props: {
            id: String,
        },

        components: {
            "list": ListComponent,
            "plugin": PluginComponent,
        },

        computed: {
            user() {
                return this.$store.state.user;
            },
        },

        data() {
            return {
                version: 0,
                loading: true,
                query: "",
                pagination: [],
                installed: [],
                bridges: [],
                featured: [],
                popular: [],
                results: [],
                current: 0,
                total: 0,
                count: 0,
            };
        },

        watch: {
            id(value) {
                this.load(value);
            },

            "$route": function route() {
                this.load(this.id);
            },
        },

        async mounted() {
            this.bridges = (await this.$hoobs.bridges.list()).filter((item) => item.type === "bridge");

            this.bridges.sort((a, b) => {
                if (a.display < b.display) return -1;
                if (a.display > b.display) return 1;

                return 0;
            });

            this.bridges.unshift({
                id: "library",
                display: this.$t("library"),
            });

            this.load(this.id);
        },

        methods: {
            async load(id) {
                this.loading = true;

                this.pagination = [];
                this.installed = [];
                this.featured = [];
                this.popular = [];
                this.results = [];

                this.current = 0;
                this.total = 0;

                if (this.$route.path === "/plugins/library") {
                    const query = Object.keys(this.$route.query).map((item) => `${item}=${this.$route.query[item]}`).join("&");

                    if (query && query !== "") {
                        window.history.pushState({}, null, `/plugins?${query}`);
                    } else {
                        window.history.pushState({}, null, "/plugins");
                    }
                }

                if (id && id !== "library") {
                    const bridge = await this.$hoobs.bridge(id);

                    if (bridge) this.installed = await bridge.plugins.list();
                } else if (!this.$route.query.search || this.$route.query.search === "") {
                    this.query = "";
                    this.featured = await this.$hoobs.repository.featured();
                    this.popular = await this.$hoobs.repository.popular();
                } else {
                    const skip = parseInt(this.$route.query.skip, 10) || 0;
                    const limit = parseInt(this.$route.query.limit, 10) || 27;

                    this.query = decodeURIComponent(this.$route.query.search);

                    const response = await this.$hoobs.repository.search(this.query, skip, limit);

                    this.results = response.results;
                    this.count = response.count;

                    this.current = limit > 0 ? skip / limit : 0;
                    this.total = Math.min(Math.ceil(limit > 0 ? this.count / limit : 0), 27);
                    this.pagination = [];

                    let start = this.current - 2;
                    let end = start + 4;

                    if (start < 0) {
                        start = 0;
                        end = start + 4;
                    }

                    if (end > this.total) {
                        end = this.total;
                        start = end - 4;
                    }

                    if (start < 0) start = 0;

                    for (let i = start; i < end; i += 1) {
                        this.pagination.push(i);
                    }
                }

                this.loading = false;
            },

            async search() {
                if (!this.query || this.query === "") {
                    this.$router.push({ path: "/plugins/library" });
                } else {
                    this.$router.push({
                        path: "/plugins/library",
                        query: {
                            search: encodeURIComponent(this.query),
                            skip: 0,
                            limit: 27,
                        },
                    });
                }
            },

            paginate(skip, limit) {
                this.$router.push({
                    path: "/plugins/library",
                    query: {
                        search: encodeURIComponent(this.query),
                        skip,
                        limit,
                    },
                });
            },
        },
    };
</script>

<style lang="scss">
    #plugins {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .content {
            flex: 1;
            display: flex;
            overflow: hidden;

            .screen {
                flex: 1;
                display: flex;
                margin: 0 20px 10px 5px;
                overflow: auto;

                .input {
                    background: var(--widget-background);
                    border: 1px var(--widget-background) solid;
                    margin: 0 0 20px 7px;
                    padding: 3px;

                    .field {
                        padding: 0;
                    }

                    input {
                        background: transparent;
                        border: 0 none;
                    }

                    .icon {
                        bottom: 5px;
                    }

                    &:focus-within {
                        border: 1px var(--widget-highlight) solid;
                    }
                }

                .wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: auto;
                }

                .section {
                    display: flex;
                    flex-direction: row;
                    padding: 20px 0 10px 0;
                    border-bottom: var(--application-border) 1px solid;
                    color: var(--application-highlight);
                    margin: 0 0 20px 10px;
                    user-select: none;

                    &:first-child {
                        padding: 0 0 10px 0;
                    }

                    &.first {
                        padding: 0 0 10px 0;
                    }
                }

                .cards {
                    display: flex;
                    flex-wrap: wrap;
                }

                .nav {
                    display: flex;
                    flex-direction: row;
                    padding: 20px 0 10px 0;
                    border-bottom: var(--application-border) 1px solid;
                    margin: 0 0 20px 7px;
                    user-select: none;

                    &:first-child {
                        padding: 0 0 10px 0;
                    }

                    &.segmented {
                        margin: 0 0 0 7px;
                        border-bottom: 0 none;
                    }
                }

                .pagination {
                    height: 50px;
                    display: flex;
                    padding: 10px 0 10px 14px;
                    flex-direction: row;
                    justify-content: flex-start;
                    box-sizing: border-box;
                    align-content: center;
                    align-items: center;
                    user-select: none;

                    .more {
                        font-size: 14px;
                        margin: 0 0 0 3px;
                        cursor: default;
                        user-select: none;
                    }

                    .page {
                        padding: 4px 10px;
                        font-size: 14px;
                        margin: 0 0 0 3px;
                        background: var(--button);
                        border: 1px var(--button-border) solid;
                        border-radius: 3px;
                        cursor: pointer;
                        user-select: none;

                        &:hover {
                            box-shadow: var(--elevation-button);
                        }

                        &.off {
                            padding: 4px 10px;
                            font-size: 14px;
                            margin: 0 0 0 3px;
                            color: var(--application-highlight-text);
                            background: var(--application-highlight);
                            border: 1px var(--application-highlight) solid;
                            border-radius: 3px;
                            cursor: default;
                            user-select: none;
                        }
                    }
                }
            }

            .empty {
                flex: 1;
                display: flex;
                flex-direction: row;
                padding: 0 20px 20% 20px;
                align-items: center;
                overflow: hidden;

                .message {
                    margin: 0 auto;
                }
            }
        }
    }
</style>
