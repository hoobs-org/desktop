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
    <div id="control">
        <div class="item">
            <div class="picker">
                <div class="wheel" ref="wheel"></div>
            </div>
        </div>
        <div class="name">{{ $t("room_color") }}</div>
    </div>
</template>

<script>
    import Iro from "@jaames/iro";

    const LOCAL_DELAY = 1000;

    export default {
        name: "hue-accessory",

        props: {
            id: String,
            disabled: Boolean,
            room: Object,
        },

        data() {
            return {
                hue: 0,
                wheel: null,
                saturation: 0,
                local: false,
                subject: null,
            };
        },

        async mounted() {
            setTimeout(() => {
                this.wheel = new Iro.ColorPicker(this.$refs.wheel, {
                    width: this.$refs.wheel.clientWidth,
                    color: {
                        h: 136,
                        s: 0,
                        l: 50,
                    },
                    wheelLightness: false,
                });

                this.wheel.on("input:end", this.pick);
            }, 10);
        },

        methods: {
            async pick(color) {
                this.local = true;
                this.hue = color.hsl.h;
                this.saturation = color.hsl.s;

                if (this.room) {
                    await this.room.set("hue", this.hue);
                    await this.room.set("saturation", this.saturation);
                }

                setTimeout(() => { this.local = false; }, LOCAL_DELAY);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #control {
        width: 100%;
        display: flex;
        flex-direction: column;

        .item {
            width: 100%;
            height: 0;
            padding-bottom: 100%;
            position: relative;
        }

        .name {
            text-align: center;
            padding: 14px 7px 7px 7px;
        }

        .picker {
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 4%;
            box-sizing: border-box;
            border: 2px var(--accessory-border) solid;
            border-radius: 50%;
            top: 0;
            left: 0;

            .wheel {
                width: 100%;
                height: 100%;
                position: relative;
                box-sizing: border-box;
                border-radius: 50%;
                overflow: hidden;
            }
        }
    }
</style>
