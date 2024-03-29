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
    <modal :title="$t('cache')" :draggable="true" width="700px" height="687px">
        <div id="cache">
            <div v-if="!loading" class="content">
                <div v-if="bridge && cache.length > 0" class="form">
                    <div v-for="(item, index) in cache" :key="`cache:${index}`" class="item">
                        <icon name="delete" v-on:click="remove(item.UUID)" class="icon" />
                        <span class="name">{{ item.displayName }}</span>
                        <span class="uuid">({{ item.UUID }})</span>
                    </div>
                </div>
                <div v-else class="form empty">
                    {{ $t("empty_cache") }}
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
            <div class="actions modal">
                <div v-if="bridge" v-on:click="clear" class="button">{{ $t("clear") }}</div>
                <div v-on:click="close" class="button">{{ $t("cancel") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "cache",

        props: {
            options: Object,
        },

        data() {
            return {
                loading: true,
                bridge: null,
                cache: [],
            };
        },

        async mounted() {
            await this.load(this.options.bridge);
        },

        methods: {
            async load(bridge) {
                this.loading = true;

                this.cache = [];
                this.bridge = await this.$hoobs.bridge(bridge);

                if (this.bridge) this.cache = (await this.bridge.cache()).accessories || [];

                this.loading = false;
            },

            async remove(uuid) {
                this.loading = true;

                await this.bridge.purge(uuid);
                await this.load(this.options.bridge);
            },

            clear() {
                this.$confirm(this.$t("purge"), this.$t("purge_bridge_warning"), async () => {
                    this.loading = true;

                    await this.bridge.purge();

                    this.close();
                });
            },

            close() {
                this.$dialog.close("cache");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #cache {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
        overflow: hidden;

        .content {
            overflow: hidden;

            .form {
                overflow: auto;

                &.empty {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    padding: 0 0 20% 0;
                    align-items: center;
                }

                .item {
                    display: flex;
                    align-items: center;
                    margin: 0 0 4px 0;
                    opacity: 0.7;

                    &:hover {
                        opacity: 1;
                    }

                    .icon {
                        margin: 0 7px 0 0;
                        opacity: 0.5;
                        cursor: pointer;

                        &:hover {
                            opacity: 1;
                        }
                    }

                    .name {
                        margin: 0 4px 0 0;
                    }

                    .uuid {
                        opacity: 0.5;
                    }
                }
            }
        }
    }
</style>
