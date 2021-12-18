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
        <line-chart v-if="colors.length > 0" :key="key" id="activity" height="100%" suffix="%" :discrete="true" :data="graph" :min="0" :max="100" :colors="colors" :curve="false" legend="bottom" />
    </div>
</template>

<script>
    export default {
        name: "activity-widget",

        data() {
            return { key: 1, colors: [] };
        },

        created() {
            this.$store.subscribe((mutation) => {
                if (mutation.type === "THEME:SET") {
                    this.$theme.get().then((theme) => {
                        this.colors = [theme.application.highlight, theme.application.accent];
                    });
                }
            });
        },

        mounted() {
            this.$theme.get().then((theme) => {
                this.colors = [theme.application.highlight, theme.application.accent];
            });
        },

        computed: {
            graph() {
                return [{
                    name: `${this.$t("cpu")} ${(this.cpu || {}).used || 0}%`,
                    data: this.cpu.history,
                }, {
                    name: `${this.$t("memory")} ${(this.memory || {}).load || 0}%`,
                    data: this.memory.history,
                }];
            },

            cpu() {
                return this.$store.state.cpu;
            },

            memory() {
                return this.$store.state.memory;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        padding: 30px 20px 15px 10px;
        box-sizing: border-box;
        cursor: default;
    }
</style>
