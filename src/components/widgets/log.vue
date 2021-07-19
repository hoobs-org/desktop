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
        <div ref="messages" class="messages">
            <message v-for="(message, index) in messages" :key="`message:${index}`" :value="message" :compact="true" />
        </div>
    </div>
</template>

<script>
    import MessageComponent from "@/components/elements/message.vue";

    const SCROLL_DELAY = 10;

    export default {
        name: "log-widget",

        components: {
            "message": MessageComponent,
        },

        computed: {
            messages() {
                return this.$store.state.log.filter((item) => item.level !== "debug");
            },
        },

        mounted() {
            setTimeout(() => {
                if (this.$refs.messages) this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
            }, SCROLL_DELAY);
        },

        updated() {
            if (this.$refs.messages) this.$refs.messages.scrollTo(0, this.$refs.messages.scrollHeight);
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
        padding: 20px;
        cursor: default;

        .dim {
            opacity: 0.3;
        }

        .messages {
            flex: 1;
            font-size: 10px;
            overflow: auto;
        }
    }
</style>
