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
    <div id="widget" :class="locked ? 'locked' : 'unlocked'">
        <div ref="device" class="device">
            <camera-accessory v-if="available" :accessory="accessory" :disabled="!locked" :dashboard="true" />
            <unavailable-accessory v-else :item="item" :disabled="!locked" />
            <div v-if="!locked" class="device-cover"></div>
        </div>
    </div>
</template>

<script>
    import CameraAccessory from "@/components/accessories/camera.vue";
    import UnavailableAccessory from "@/components/accessories/unavailable.vue";

    const LOAD_RETRY_DELAY = 5 * 1000;

    export default {
        name: "camera-widget",
        components: { "camera-accessory": CameraAccessory, "unavailable-accessory": UnavailableAccessory },
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
            async load() {
                this.$hoobs.accessory(this.item.bridge, this.item.id).then((accessory) => {
                    this.accessory = accessory;

                    if (this.accessory.accessory_identifier && this.accessory.type === "camera") {
                        this.available = true;
                    } else if (this.retries > 0) {
                        this.retries -= 1;
                        this.available = false;

                        setTimeout(() => this.load(), LOAD_RETRY_DELAY);
                    }
                });
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        cursor: default;
        user-select: none;

        .device {
            width: 100%;
            height: 100%;
            position: relative;

            .device-cover {
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 200;
            }
        }

        &.unlocked {
            .device {
                pointer-events: none;
            }
        }
    }
</style>
