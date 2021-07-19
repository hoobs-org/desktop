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
    <div :key="version" v-if="user.permissions.terminal" id="terminal">
        <context override="navigation">
            <icon v-on:click="refresh()" name="refresh" class="icon" />
        </context>
        <div class="terminal">
            <iframe ref="terminal" frameborder="0" />
        </div>
    </div>
</template>

<script>
    export default {
        name: "terminal",

        props: {
            route: String,
        },

        computed: {
            user() {
                return this.$store.state.user;
            },

            current() {
                return this.$store.state.current;
            },
        },

        data() {
            return {
                version: 0,
                loading: false,
                term: null,
                socket: null,
                hoobsd: null,
                screen: null,
                initilize: true,
                opening: true,
                text: {
                    width: 0,
                    height: 0,
                },
            };
        },

        async mounted() {
            this.connect();
        },

        methods: {
            connect() {
                setTimeout(() => {
                    this.$refs.terminal.src = `http://${this.current.ip}:9090`;
                }, 10);
            },

            refresh() {
                if (this.$refs.terminal) this.$refs.terminal.src = `http://${this.current.ip}:9090`;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #terminal {
        flex: 1;
        display: flex;
        background: var(--navigation-background);
        flex-direction: column;
        position: relative;

        .terminal {
            flex: 1;
            display: flex;
            flex-direction: column;

            iframe {
                width: 100%;
                height: 100%;
            }
        }
    }
</style>
