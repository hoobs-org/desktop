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
    <div v-if="!hidden" id="control">
        <div class="item">
            <div class="background">
                <div class="sill">
                    <div class="window">
                        <div class="cover" :style="`height: ${position}%;`"></div>
                        <div class="container">
                            <div class="slider">
                                <input id="field" type="range" min="0" max="100" step="1" v-model="position" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!disabled" v-on:click="settings" class="settings">
                <icon name="cog" class="icon" :title="$t('accessory_settings')" />
            </div>
            <div v-if="!disabled && features.battery" class="battery" :title="`${battery}%`">
                <div class="charge">
                    <icon :name="charge" class="icon" />
                </div>
                <div class="frame">
                    <icon name="battery-outline" class="icon" />
                </div>
            </div>
        </div>
        <div class="name">{{ display }}</div>
    </div>
</template>

<script>
    import Debounce from "lodash.debounce";

    const UPDATE_DELAY = 150;
    const LOCAL_DELAY = 1000;

    export default {
        name: "blind-accessory",
        props: { disabled: Boolean, accessory: Object },

        computed: {
            charge() {
                if (!this.battery) return "battery-outline";
                if (this.battery > 0 && this.battery < 10) return "battery-10";
                if (this.battery > 10 && this.battery < 20) return "battery-20";
                if (this.battery > 20 && this.battery < 30) return "battery-30";
                if (this.battery > 30 && this.battery < 40) return "battery-40";
                if (this.battery > 40 && this.battery < 50) return "battery-50";
                if (this.battery > 50 && this.battery < 60) return "battery-60";
                if (this.battery > 60 && this.battery < 70) return "battery-70";
                if (this.battery > 70 && this.battery < 80) return "battery-80";
                if (this.battery > 80 && this.battery < 90) return "battery-90";

                return "battery";
            },
        },

        data() {
            return {
                position: 100,
                battery: 0,
                features: { battery: false },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                updater: Debounce(() => {
                    if (!this.local) {
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.position = (this.subject.characteristics.find((item) => item.type === "target_position") || {}).value || 0;
                        this.battery = (battery || {}).value || 0;

                        if (battery) this.features.battery = true;
                    }
                }, UPDATE_DELAY),
                commit: Debounce(async () => {
                    this.local = true;

                    const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);
                    await accessory.set("target_position", this.position);

                    setTimeout(() => { this.local = false; }, LOCAL_DELAY);
                }, UPDATE_DELAY),
            };
        },

        watch: {
            position() {
                this.commit();
            },
        },

        created() {
            this.$action.on("io", "accessory_change", (payload) => {
                if (payload.data.accessory.accessory_identifier === this.subject.accessory_identifier) {
                    this.subject = payload.data.accessory;
                    this.updater();
                }
            });
        },

        mounted() {
            this.subject = this.accessory;
            this.updater();
        },

        methods: {
            settings() {
                this.$dialog.open("accessory", { bridge: this.subject.bridge, id: this.subject.accessory_identifier });
            },
        },
    };
</script>

<style lang="scss" scoped>
    @keyframes dash-frame {
        100% {
            stroke-dashoffset: 0;
        }
    }

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

        .battery {
            width: 27px;
            height: 27px;
            box-sizing: border-box;
            position: absolute;
            border-radius: 50%;
            background: var(--widget-background);
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: -8px;
            left: -6px;
            cursor: default;

            .icon {
                height: 20px;
                transform-origin: center;
                transform: rotate(90deg);
            }

            .charge {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: absolute;
                color: var(--accessory-text);
                top: 0;
                left: 0;
            }

            .frame {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: absolute;
                color: var(--accessory-border);
                top: 0;
                left: 0;
            }
        }

        .settings {
            display: none;
            position: absolute;
            border-radius: 50%;
            background: var(--widget-background);
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: -6px;
            right: -6px;
            cursor: pointer;

            .icon {
                height: 22px;
                opacity: 0.3;
            }

            &:hover {
                .icon {
                    opacity: 1;
                }
            }
        }

        .background {
            width: 100%;
            height: 100%;
            position: absolute;
            box-sizing: border-box;
            top: 0;
            left: 0;
        }

        .sill {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border-radius: 7px;
            border: 2px var(--accessory-border) solid;
            padding: 20px;
        }

        .window {
            width: 100%;
            height: 100%;
            position: relative;
            background: var(--application-highlight);
            border: 1px var(--accessory-border) solid;
        }

        .cover {
            background: var(--accessory-input);
            border-bottom: 1px var(--accessory-border) solid;
            width: 100%;
            position: absolute;
            top: -1px;
            left: 0;
        }

        .container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            position: absolute;
            top: 0;
            left: 0;

            .slider {
                width: 100%;
                height: 100%;
                transform-origin: center;
                transform: rotate(90deg);

                input[type=range] {
                    -webkit-appearance: none;
                    background: transparent;
                    width: 100%;
                    height: 100%;
                    border: 0 none;
                    margin: 0;
                    padding: 0;

                    &:focus {
                        outline: none;
                    }

                    &::-webkit-slider-runnable-track {
                        width: 100%;
                        height: 0;
                    }

                    &::-webkit-slider-thumb {
                        border: 1px var(--accessory-border) solid;
                        border-radius: 50%;
                        height: 22px;
                        width: 22px;
                        background: var(--accessory-highlight);
                        cursor: pointer;
                        -webkit-appearance: none;
                        margin-top: -14px;
                    }

                    &::-moz-range-track {
                        width: 100%;
                        height: 0;
                    }

                    &::-moz-range-thumb {
                        border: 1px var(--accessory-border) solid;
                        border-radius: 50%;
                        height: 22px;
                        width: 22px;
                        background: var(--accessory-highlight);
                        cursor: pointer;
                    }

                    &::-ms-track {
                        width: 100%;
                        height: 0;
                        border-width: 0;
                    }

                    &::-ms-thumb {
                        border: 1px var(--accessory-border) solid;
                        border-radius: 50%;
                        height: 22px;
                        width: 22px;
                        background: var(--accessory-highlight);
                        cursor: pointer;
                    }
                }
            }
        }

        &:hover {
            .settings {
                display: flex;
            }
        }
    }
</style>
