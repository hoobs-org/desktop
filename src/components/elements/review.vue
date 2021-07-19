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
    <div id="review">
        <div class="title">
            <div class="user">
                <img :src="value.author.picture" />
            </div>
            <div class="details">
                <rating :value="value.rating" />
                <div class="age">
                    Reviewed by
                    <span class="name">{{ value.author.name }}</span>
                    on {{ $hoobs.dates.display(value.date) }}
                </div>
            </div>
        </div>
        <div ref="content" class="content">
            <div class="markdown" v-html="$markdown(value.body)"></div>
            <div v-if="value.response" class="response">Developer Response</div>
            <div v-if="value.response" class="markdown rebuttal" v-html="$markdown(value.response)"></div>
        </div>
    </div>
</template>

<script>
    import RatingComponent from "@/components/elements/rating.vue";

    export default {
        name: "review",

        components: {
            "rating": RatingComponent,
        },

        props: {
            value: Object,
        },
    };
</script>

<style scoped lang="scss">
    #review {
        padding: 20px;
        position: relative;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        border-bottom: 1px var(--application-border) solid;

        .title {
            display: flex;
            flex-direction: row;
            align-content: flex-end;
            align-items: flex-end;

            .user {
                display: flex;
                flex-direction: row;
                align-content: center;
                align-items: center;

                img {
                    width: 32px;
                    height: 32px;
                    margin: 0 10px 0 0;
                    border-radius: 3px;
                }
            }

            .details {
                display: flex;
                flex-direction: column;

                .age {
                    font-size: 14px;
                    opacity: 0.5;
                    user-select: none;
                    cursor: default;
                }

                .name {
                    color: var(--application-highlight-text);
                }
            }
        }

        .content {
            font-size: 14px;
            margin: 10px 0 0 0;

            .markdown {
                padding: 0;

                &.rebuttal {
                    background-color: var(--modal-background);
                    border-radius: 3px;
                    padding: 14px;
                }
            }

            .response {
                font-size: 12px;
                font-weight: bold;
                margin: 20px 0 0 0;
            }
        }
    }
</style>
