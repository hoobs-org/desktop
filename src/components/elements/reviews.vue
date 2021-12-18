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
    <div v-if="!loading" id="reviews">
        <div class="list">
            <div class="write">
                <a :href="`https://plugins.hoobs.org/plugin/${identifier}`" target="_blank">
                    <icon name="message-draw" class="icon" />
                    {{ $t("write_review") }}
                </a>
            </div>
            <review v-for="(item, index) in reviews" :key="`review:${index}`" :value="item" />
            <div v-if="total > 1 && pages.length > 1" class="pagination">
                <div v-if="pages[0] > 0" v-on:click="paginate(0, 20)" class="page">1</div>
                <div v-if="pages[0] > 0" class="more">...</div>
                <div v-for="(page, index) in pages" :key="`page:${index}`" v-on:click="paginate(page * 20, 20)" :class="`${page === current ? 'page off' : 'page'}`">{{ page + 1 }}</div>
                <div v-if="pages[pages.length - 1] < total - 1" class="more">...</div>
                <div v-if="pages[pages.length - 1] < total - 1" v-on:click="paginate((total - 1) * 20, 20)" class="page">{{ total }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import ReviewComponent from "@/components/elements/review.vue";

    export default {
        name: "reviews",
        components: { "review": ReviewComponent },

        props: {
            id: String,
            identifier: String,
            plugin: Object,
        },

        data() {
            return {
                loading: true,
                reviews: [],
                count: 0,
                total: 0,
                current: 0,
                pages: [],
                skip: 0,
                limit: 20,
            };
        },

        watch: {
            skip() {
                this.load();
            },

            limit() {
                this.load();
            },
        },

        mounted() {
            this.skip = parseInt(this.$route.query.skip, 10) || 0;
            this.limit = parseInt(this.$route.query.limit, 10) || 20;

            this.load();
        },

        methods: {
            async load() {
                this.loading = true;

                const response = await this.$hoobs.repository.reviews(this.identifier, this.skip, this.limit);

                this.reviews = response.results || [];
                this.count = response.count;
                this.pages = [];

                this.current = parseInt(this.limit, 10) > 0 ? parseInt(this.skip, 10) / parseInt(this.limit, 10) : 0;
                this.total = Math.min(Math.ceil(parseInt(this.limit, 10) > 0 ? this.count / parseInt(this.limit, 10) : 0), 20);

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

                if (start < 0) {
                    start = 0;
                }

                for (let i = start; i < end; i += 1) {
                    this.pages.push(i);
                }

                this.loading = false;
                this.$emit("top");
            },

            paginate(skip, limit) {
                this.skip = parseInt(skip, 10) || 0;
                this.limit = parseInt(limit, 10) || 20;
            },
        },
    };
</script>

<style scoped lang="scss">
    #reviews {
        display: flex;
        flex-direction: column;

        .list {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin: -20px 0 0 0;

            .write {
                padding: 20px;
                border-bottom: 1px var(--application-border) solid;

                a {
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    &:hover {
                        text-decoration: none !important;
                    }

                    .icon {
                        margin: 0 7px 0 0;
                    }
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
    }
</style>
