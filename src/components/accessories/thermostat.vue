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
        <div :class="style">
            <div class="background">
                <div class="inner"></div>
            </div>
            <svg viewBox="0 0 100 100" v-on:click.stop="select" v-on:mousedown.prevent="start(true)" v-on:touchstart.prevent="start()">
                <path class="range" :d="range" />
                <path class="marker" :d="marker" />
            </svg>
            <div class="switch">
                <div v-if="features.humidity" class="inner">
                    <div class="humidity">
                        <span :class="text">{{ readout }}&deg;</span>
                        <span class="sub">{{ humidity }}%</span>
                    </div>
                </div>
                <div v-else class="inner">
                    <span :class="text">{{ readout }}&deg;</span>
                </div>
            </div>
            <div class="context">
                <div class="inner" v-on:click="mode">
                    <icon v-if="state === 1" name="fire" class="icon heat" />
                    <icon v-else-if="state === 2" name="snowflake" class="icon cool" />
                    <div v-else-if="state === 3" class="cliped">
                        <icon class="snowflake" name="icon top cool" />
                        <icon class="fire" name="icon bottom heat" />
                    </div>
                    <span v-else class="off">{{ $t("off") }}</span>
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
    const ADJUST_DELAY = 4000;

    const RADIUS = 41;

    const MID_X = 50;
    const MID_Y = 50;

    const MIN_RADIANS = (4 * Math.PI) / 3;
    const MAX_RADIANS = -Math.PI / 3;

    export default {
        name: "thermostat-accessory",

        props: {
            disabled: Boolean,
            accessory: Object,
        },

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

            style() {
                switch (this.state) {
                    case 1:
                        return "item heating";

                    case 2:
                        return "item cooling";

                    case 3:
                        return "item auto";

                    default:
                        return "item";
                }
            },

            text() {
                switch (this.state) {
                    case 1:
                        if (this.target > this.current) return "temp heat";

                        return "temp";

                    case 2:
                        if (this.target < this.current) return "temp cool";

                        return "temp";

                    case 3:
                        if (this.target > this.current) return "temp heat";
                        if (this.target < this.current) return "temp cool";

                        return "temp";

                    default:
                        return "temp";
                }
            },

            range() {
                return `M ${this.position.x.start} ${this.position.y.start} A ${RADIUS} ${RADIUS} 0 1 1 ${this.position.x.end} ${this.position.y.end}`;
            },

            marker() {
                return `M ${this.position.x.zero} ${this.position.y.zero} A ${RADIUS} ${RADIUS} 0 ${this.arc} ${this.sweep} ${this.active.x} ${this.active.y}`;
            },

            readout() {
                const results = this.adjusting ? this.target : this.current;

                if (this.output === "fahrenheit" && this.unit === "celsius") return Math.round((results * 1.8) + 32);
                if (this.output === "celsius" && this.unit === "fahrenheit") return Math.round((results - 32) / 1.8);

                return Math.round(results);
            },

            position() {
                return {
                    x: {
                        start: MID_X + Math.cos(MIN_RADIANS) * RADIUS,
                        end: MID_X + Math.cos(MAX_RADIANS) * RADIUS,
                        zero: MID_X + Math.cos(this.map(this.min.temp, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                    },
                    y: {
                        start: MID_Y - Math.sin(MIN_RADIANS) * RADIUS,
                        end: MID_Y - Math.sin(MAX_RADIANS) * RADIUS,
                        zero: MID_Y - Math.sin(this.map(this.min.temp, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                    },
                };
            },

            active() {
                return {
                    x: MID_X + Math.cos(this.map(this.target, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                    y: MID_Y - Math.sin(this.map(this.target, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                };
            },

            arc() {
                return Math.abs(this.map(this.min.temp, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS) - this.map(this.target, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS)) < Math.PI ? 0 : 1;
            },

            sweep() {
                return this.map(this.target, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS) > this.map(this.min.temp, this.min.temp, this.max.temp, MIN_RADIANS, MAX_RADIANS) ? 0 : 1;
            },
        },

        data() {
            return {
                min: {
                    temp: 10,
                    state: 0,
                },
                max: {
                    temp: 38,
                    state: 1,
                },
                unit: "celsius",
                state: 0,
                target: 10,
                current: 10,
                humidity: 0,
                output: "celsius",
                adjusting: false,
                timeout: null,
                battery: 0,
                features: {
                    humidity: false,
                    battery: false,
                },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                updater: Debounce(() => {
                    if (!this.local) {
                        const current = this.subject.characteristics.find((item) => item.type === "current_temperature") || {};
                        const target = this.subject.characteristics.find((item) => item.type === "target_temperature") || {};
                        const state = this.subject.characteristics.find((item) => item.type === "target_heating_cooling_state") || {};
                        const humidity = this.subject.characteristics.find((item) => item.type === "current_relative_humidity") || {};
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.output = (this.subject.characteristics.find((item) => item.type === "temperature_display_units") || {}).value || false ? "fahrenheit" : "celsius";
                        this.current = Math.round((current.unit || "celsius") !== "celsius" ? ((current.value || 50) - 32) / 1.8 : current.value || 0);
                        this.humidity = Math.round(humidity.value || 0);
                        this.target = Math.round((target.unit || "celsius") !== "celsius" ? ((target.value || 50) - 32) / 1.8 : target.value || 10);
                        this.battery = (battery || {}).value || 0;

                        this.state = state.value || 0;
                        this.unit = target.unit || "celsius";

                        this.min.temp = target.min_value || 10;
                        this.max.temp = target.max_value || 38;
                        this.min.state = state.min_value || 0;
                        this.max.state = state.max_value || 1;

                        if (humidity) this.features.humidity = true;
                        if (battery) this.features.battery = true;
                    }
                }, UPDATE_DELAY),
                commit: Debounce(async () => {
                    if (!this.disabled && this.state) {
                        this.local = true;

                        const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);
                        await accessory.set("target_temperature", Math.round(this.target));

                        setTimeout(() => { this.local = false; }, LOCAL_DELAY);
                    }
                }, UPDATE_DELAY),
            };
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "IO:ACCESSORY:CHANGE" && mutation.payload.data.accessory.accessory_identifier === this.subject.accessory_identifier) {
                    this.subject = mutation.payload.data.accessory;
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
                this.$dialog.open("accessory", {
                    bridge: this.subject.bridge,
                    id: this.subject.accessory_identifier,
                });
            },

            map(x, inMin, inMax, outMin, outMax) {
                return (((x - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin;
            },

            async mode() {
                this.local = true;

                let state = this.state + 1;
                const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);

                if (state > this.max.state) state = this.min.state;
                await accessory.set("target_heating_cooling_state", state);

                this.state = state;

                setTimeout(() => { this.local = false; }, LOCAL_DELAY);
            },

            update(offsetX, offsetY) {
                if (!this.disabled && this.state) {
                    if (this.timeout) clearTimeout(this.timeout);

                    this.adjusting = true;

                    const angle = Math.atan2(this.$el.clientWidth / 2 - offsetY, offsetX - this.$el.clientWidth / 2);
                    const start = -Math.PI / 2 - Math.PI / 6;

                    if (angle > MAX_RADIANS) {
                        this.target = this.map(angle, MIN_RADIANS, MAX_RADIANS, this.min.temp, this.max.temp);
                    } else if (angle < start) {
                        this.target = this.map(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, this.min.temp, this.max.temp);
                    }

                    this.target = Math.round(this.target);
                    this.$emit("input", this.target);
                    this.timeout = setTimeout(() => { this.adjusting = false; }, ADJUST_DELAY);
                }
            },

            select(event) {
                if (!this.disabled && this.state) this.update(event.offsetX, event.offsetY);
            },

            start(mouse) {
                if (!this.disabled && this.state) {
                    window.addEventListener(mouse ? "mousemove" : "touchmove", mouse ? this.pointer : this.touch);
                    window.addEventListener(mouse ? "mouseup" : "touchend", mouse ? this.leave : this.stop);
                }
            },

            leave() {
                if (!this.disabled && this.state) {
                    window.removeEventListener("mousemove", this.pointer);
                    window.removeEventListener("mouseup", this.leave);

                    this.commit();
                }
            },

            stop() {
                if (!this.disabled && this.state) {
                    window.removeEventListener("touchmove", this.touch);
                    window.removeEventListener("touchend", this.stop);

                    this.commit();
                }
            },

            pointer(event) {
                if (!this.disabled && this.state) this.update(event.offsetX, event.offsetY);
            },

            touch(event) {
                if (!this.disabled && this.state && event.touches.length === 1) {
                    const rectangle = this.$el.getBoundingClientRect();
                    const touch = event.targetTouches.item(0);

                    this.update(touch.clientX - rectangle.left, touch.clientY - rectangle.top);
                }
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

        .heat {
            color: #f27c05 !important;
            opacity: 1 !important;
        }

        .cool {
            color: #00b9f1 !important;
            opacity: 1 !important;
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
            padding: 3%;
            box-sizing: border-box;
            border: 2px var(--accessory-border) solid;
            border-radius: 50%;
            top: 0;
            left: 0;

            .inner {
                width: 100%;
                height: 100%;
                position: relative;
                box-sizing: border-box;
                background: var(--accessory-background);
                border-radius: 50%;
            }
        }

        .switch {
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 15%;
            box-sizing: border-box;
            pointer-events: none;
            border: 0 none;
            border-radius: 50%;
            top: 0;
            left: 0;

            .inner {
                width: 100%;
                height: 100%;
                display: flex;
                padding: 0 0 20% 7%;
                justify-content: space-around;
                clip-path: inset(0 0 32% 0);
                align-items: center;
                position: relative;
                background: var(--accessory-input);
                box-sizing: border-box;
                pointer-events: all;
                border-radius: 50%;
                cursor: pointer;

                .temp {
                    color: var(--accessory-text);
                    font-size: 150%;
                }
            }

            .humidity {
                display: flex;
                align-items: center;
                flex-direction: column;

                .temp {
                    line-height: 100%;
                }

                .sub {
                    display: flex;
                    align-items: center;
                    align-content: center;
                    color: var(--accessory-text);
                    font-size: 70%;

                    svg {
                        margin: -10px 0 0 0;
                    }
                }
            }
        }

        .context {
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 15%;
            box-sizing: border-box;
            pointer-events: none;
            border-radius: 50%;
            top: 0;
            left: 0;

            .inner {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding: 70% 0 0 0;
                position: relative;
                background: var(--accessory-input);
                box-sizing: border-box;
                pointer-events: all;
                clip-path: inset(71% 0 0 0);
                border-radius: 50%;
                cursor: pointer;

                .icon {
                    height: 70%;
                    color: var(--accessory-text);
                }

                .cliped {
                    position: relative;
                    width: 22px;
                    height: 23px;

                    .top {
                        left: -1px;
                        position: absolute;
                        clip-path: polygon(0 0, 100% 0, 100% 0, 0 100%);
                    }

                    .bottom {
                        left: 1px;
                        position: absolute;
                        clip-path: polygon(100% 100%, 0 100%, 0 100%, 100% 0);
                    }
                }

                .off {
                    font-size: 120%;
                }
            }
        }

        svg {
            width: 100%;
            height: 100%;
            position: absolute;
            box-sizing: border-box;
            top: 0;
            left: 0;

            .range {
                fill: none;
                stroke: var(--accessory-input);
                stroke-width: 6%;
                transition: stroke 0.1s ease-in;
                cursor: pointer;
            }

            .marker {
                fill: none;
                stroke: var(--accessory-input);
                opacity: 0;
                stroke-width: 6%;
                stroke-dasharray: 0;
                stroke-dashoffset: 0;
                animation-name: dash-frame;
                animation-fill-mode: forwards;
                cursor: pointer;
            }
        }

        .heating {
            svg {
                .marker {
                    stroke: #f27c05;
                    opacity: 1;
                }
            }
        }

        .cooling {
            svg {
                .marker {
                    stroke: #00b9f1;
                    opacity: 1;
                }
            }
        }

        .auto {
            svg {
                .range {
                    stroke: #00b9f1;
                    opacity: 1;
                }

                .marker {
                    stroke: #f27c05;
                    opacity: 1;
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
