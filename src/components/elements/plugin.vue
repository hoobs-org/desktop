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
    <router-link id="plugin" :to="`/plugin/${subject.identifier || subject.name}`" :title="$hoobs.repository.title(subject.name)">
        <div class="identity">
            <img :src="icon()" />
        </div>
        <div class="details">
            <span class="title">{{ $hoobs.repository.title(subject.name) }}</span>
            <span class="description" v-html="$markdown(subject.description)"></span>
            <rating :value="subject.rating" :size="15" />
        </div>
        <div v-if="subject.certified" class="certified">
            <span>{{ $t("certified") }}</span>
        </div>
    </router-link>
</template>

<script>
    import crypto from "crypto";
    import identicon from "identicon.js";

    import RatingComponent from "@/components/elements/rating.vue";

    export default {
        name: "plugin",
        props: { subject: Object },
        components: { "rating": RatingComponent },

        methods: {
            icon() {
                if (this.subject.icon) return this.subject.icon;

                const hash = crypto.createHash("md5").update(this.subject.name).digest("hex");

                return `data:image/png;base64,${new identicon(hash, { background: [0, 0, 0, 0], size: 128 }).toString()}`; // eslint-disable-line new-cap
            },
        },
    };
</script>

<style lang="scss" scoped>
    #plugin {
        width: 160px;
        height: 245px;
        position: relative;
        margin: 0 0 10px 10px;
        display: flex;
        flex-direction: column;
        color: var(--widget-text) !important;
        text-decoration: none !important;
        background: var(--widget-background);

        &:hover {
            text-decoration: none !important;
        }

        .certified {
            top: 10px;
            left: 0;
            max-width: 100px;
            position: absolute;
            font-size: 14px;
            padding: 3px 7px;
            color: var(--application-highlight-text);
            background: var(--application-highlight);
            border-radius: 0 3px 3px 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .identity {
            width: 160px;
            height: 160px;
            display: flex;
            align-items: center;
            justify-content: space-around;

            img {
                width: 128px;
                height: 128px;
                border-radius: 3px;
            }
        }

        .details {
            flex: 1;
            padding: 0 17px 17px 17px;
            display: flex;
            flex-direction: column;
            color: var(--widget-text);
            text-decoration: none;
            overflow: hidden;

            .title {
                font-size: 16px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .description {
                flex: 1;
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        &:hover {
            box-shadow: var(--elevation-button);
        }
    }
</style>
