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
        <div ref="device" class="device">
            <component v-if="available" :is="control(accessory)" :accessory="accessory" :disabled="!locked" />
            <unavailable-accessory v-else :item="item" :disabled="!locked" />
            <div v-if="control(accessory) && !locked" class="device-cover"></div>
        </div>
    </div>
</template>

<script>
    import { accessories, types } from "../../services/accessories";

    const LOAD_RETRY_DELAY = 5 * 1000;

    export default {
        name: "accessory-widget",
        components: { ...accessories() },
        props: { item: { type: Object, required: true }, locked: Boolean },

        data() {
            return {
                retries: 10,
                accessory: null,
                available: false,
            };
        },

        mounted() {
            this.load();
        },

        methods: {
            load() {
                this.$hoobs.accessory(this.item.bridge, this.item.id).then((accessory) => {
                    this.accessory = accessory;

                    if (this.accessory.accessory_identifier) {
                        this.available = true;
                    } else if (this.retries > 0) {
                        this.retries -= 1;
                        this.available = false;

                        setTimeout(() => this.load(), LOAD_RETRY_DELAY);
                    }
                });
            },

            control(accessory) {
                return types(accessory);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        padding: 20px 30px;
        box-sizing: border-box;
        cursor: default;
        user-select: none;

        .device {
            max-width: 100%;
            max-height: 100%;
            margin: auto;
            aspect-ratio: 155/214;
            object-fit: contain;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            position: relative;
            align-items: center;

            .device-cover {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 200;
            }
        }
    }
</style>
