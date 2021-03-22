<template>
    <div v-if="!hidden" id="control" :class="on ? 'on' : 'off'">
        <div :class="style">
            <div v-if="features.brightness && on" class="background">
                <div class="inner"></div>
            </div>
            <svg v-if="features.brightness && on" viewBox="0 0 100 100" v-on:click.stop="select" v-on:mousedown.prevent="start(true)" v-on:touchstart.prevent="start()">
                <path class="range" :d="range" />
                <path v-if="visable" class="marker" :style="`stroke: ${color};`" :d="marker" />
            </svg>
            <div v-if="!features.picker" class="switch">
                <div v-if="on" class="inner" v-on:click="toggle" :style="`background: ${color};`">
                    <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'lightbulb-on'" class="icon" />
                </div>
                <div v-else class="inner" v-on:click="toggle">
                    <icon v-if="subject" :name="subject.icon && subject.icon !== '' ? subject.icon : 'lightbulb-outline'" class="icon" />
                </div>
            </div>
            <div v-if="features.hue && !features.picker && on" class="context">
                <div class="inner" v-on:click="picker" :style="`background: ${color};`">
                    <icon name="palette" class="icon" />
                </div>
            </div>
            <div v-if="features.picker" class="picker">
                <div class="wheel" ref="wheel"></div>
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
    import Iro from "@jaames/iro";
    import Debounce from "lodash.debounce";

    const UPDATE_DELAY = 150;
    const LOCAL_DELAY = 1000;

    const RADIUS = 41;

    const MID_X = 50;
    const MID_Y = 50;

    const MIN_RADIANS = (4 * Math.PI) / 3;
    const MAX_RADIANS = -Math.PI / 3;

    export default {
        name: "light-accessory",

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
                let result = "item";

                if (this.on) {
                    if (this.features.brightness) result = `${result} brightness`;
                    if (this.features.hue) result = `${result} hue`;
                }

                return result;
            },

            color() {
                if (this.features.hue) {
                    return new Iro.Color({
                        h: this.hue,
                        s: this.saturation,
                        l: 50,
                    }).hexString;
                }

                return "#fed800";
            },

            range() {
                return `M ${this.position.x.start} ${this.position.y.start} A ${RADIUS} ${RADIUS} 0 1 1 ${this.position.x.end} ${this.position.y.end}`;
            },

            marker() {
                return `M ${this.position.x.zero} ${this.position.y.zero} A ${RADIUS} ${RADIUS} 0 ${this.arc} ${this.sweep} ${this.active.x} ${this.active.y}`;
            },

            visable() {
                return (this.brightness >= 0 && this.brightness <= 100);
            },

            position() {
                return {
                    x: {
                        start: MID_X + Math.cos(MIN_RADIANS) * RADIUS,
                        end: MID_X + Math.cos(MAX_RADIANS) * RADIUS,
                        zero: MID_X + Math.cos(this.map(0, 0, 100, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                    },
                    y: {
                        start: MID_Y - Math.sin(MIN_RADIANS) * RADIUS,
                        end: MID_Y - Math.sin(MAX_RADIANS) * RADIUS,
                        zero: MID_Y - Math.sin(this.map(0, 0, 100, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                    },
                };
            },

            active() {
                return {
                    x: MID_X + Math.cos(this.map(this.brightness, 0, 100, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                    y: MID_Y - Math.sin(this.map(this.brightness, 0, 100, MIN_RADIANS, MAX_RADIANS)) * RADIUS,
                };
            },

            arc() {
                return Math.abs(this.map(0, 0, 100, MIN_RADIANS, MAX_RADIANS) - this.map(this.brightness, 0, 100, MIN_RADIANS, MAX_RADIANS)) < Math.PI ? 0 : 1;
            },

            sweep() {
                return this.map(this.brightness, 0, 100, MIN_RADIANS, MAX_RADIANS) > this.map(0, 0, 100, MIN_RADIANS, MAX_RADIANS) ? 0 : 1;
            },
        },

        data() {
            return {
                on: false,
                hue: 0,
                wheel: null,
                saturation: 0,
                brightness: 0,
                battery: 0,
                features: {
                    picker: false,
                    brightness: false,
                    hue: false,
                    battery: false,
                },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                updater: Debounce(() => {
                    if (!this.local) {
                        const brightness = this.subject.characteristics.find((item) => item.type === "brightness");
                        const saturation = this.subject.characteristics.find((item) => item.type === "saturation");
                        const hue = this.subject.characteristics.find((item) => item.type === "hue");
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.on = (this.subject.characteristics.find((item) => item.type === "on") || {}).value || false;
                        this.hue = (hue || {}).value || 0;
                        this.saturation = (saturation || {}).value || 0;
                        this.brightness = (brightness || {}).value || 100;
                        this.battery = (battery || {}).value || 0;

                        if (brightness || hue) this.features.brightness = true;
                        if (hue) this.features.hue = true;
                        if (battery) this.features.battery = true;
                    }
                }, UPDATE_DELAY),
                commit: Debounce(async () => {
                    if (!this.disabled && this.on) {
                        this.local = true;

                        const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);

                        await accessory.set("brightness", Math.round(this.brightness));

                        if (this.features.picker) {
                            this.$refs.wheel.innerHTML = "";
                            this.features.picker = false;
                            this.wheel = null;
                        }

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

            picker() {
                this.features.picker = true;

                setTimeout(() => {
                    this.wheel = new Iro.ColorPicker(this.$refs.wheel, {
                        width: this.$refs.wheel.clientWidth,
                        color: {
                            h: this.hue,
                            s: this.saturation,
                            l: 50,
                        },
                        wheelLightness: false,
                    });

                    this.wheel.on("input:end", this.pick);
                }, 10);
            },

            async pick(color) {
                this.local = true;

                const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);

                this.hue = color.hsl.h;
                this.saturation = color.hsl.s;

                if (this.features.picker) {
                    this.$refs.wheel.innerHTML = "";
                    this.features.picker = false;
                    this.wheel = null;
                }

                await accessory.set("hue", this.hue);
                await accessory.set("saturation", this.saturation);

                setTimeout(() => { this.local = false; }, LOCAL_DELAY);
            },

            async toggle() {
                this.local = true;

                const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);
                const on = !this.on;

                if (this.features.picker) {
                    this.$refs.wheel.innerHTML = "";
                    this.features.picker = false;
                    this.wheel = null;
                }

                this.on = on;

                await accessory.set("on", on);

                setTimeout(() => { this.local = false; }, LOCAL_DELAY);
            },

            update(offsetX, offsetY) {
                if (!this.disabled && this.on) {
                    const angle = Math.atan2(this.$el.clientWidth / 2 - offsetY, offsetX - this.$el.clientWidth / 2);
                    const start = -Math.PI / 2 - Math.PI / 6;

                    if (angle > MAX_RADIANS) {
                        this.brightness = this.map(angle, MIN_RADIANS, MAX_RADIANS, 0, 100);
                    } else if (angle < start) {
                        this.brightness = this.map(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, 0, 100);
                    } else {
                        return;
                    }

                    this.on = this.brightness > 0;
                    this.$emit("input", Math.round(this.brightness));
                }
            },

            select(event) {
                if (!this.disabled && this.on) this.update(event.offsetX, event.offsetY);
            },

            start(mouse) {
                if (!this.disabled && this.on) {
                    window.addEventListener(mouse ? "mousemove" : "touchmove", mouse ? this.pointer : this.touch);
                    window.addEventListener(mouse ? "mouseup" : "touchend", mouse ? this.leave : this.stop);
                }
            },

            leave() {
                if (!this.disabled && this.on) {
                    window.removeEventListener("mousemove", this.pointer);
                    window.removeEventListener("mouseup", this.leave);

                    this.commit();
                }
            },

            stop() {
                if (!this.disabled && this.on) {
                    window.removeEventListener("touchmove", this.touch);
                    window.removeEventListener("touchend", this.stop);

                    this.commit();
                }
            },

            pointer(event) {
                if (!this.disabled && this.on) this.update(event.offsetX, event.offsetY);
            },

            touch(event) {
                if (!this.disabled && this.on && event.touches.length === 1) {
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

        .picker {
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 4%;
            box-sizing: border-box;
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

        .switch {
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 3%;
            box-sizing: border-box;
            pointer-events: none;
            border: 2px var(--accessory-border) solid;
            border-radius: 50%;
            top: 0;
            left: 0;

            .inner {
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: space-around;
                align-items: center;
                position: relative;
                box-sizing: border-box;
                background: var(--accessory-background);
                pointer-events: all;
                border-radius: 50%;
                cursor: pointer;

                .icon {
                    height: 50%;
                    color: var(--accessory-text);
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
                box-sizing: border-box;
                background: var(--accessory-background);
                pointer-events: all;
                clip-path: inset(71% 0 0 0);
                border-radius: 50%;
                cursor: pointer;

                .icon {
                    height: 60%;
                    color: var(--accessory-text);
                }
            }
        }

        .brightness {
            .switch {
                padding: 15%;
                border: 0 none;
            }
        }

        .hue {
            .switch {
                .inner {
                    padding: 0 0 32% 0;
                    clip-path: inset(0 0 32% 0);

                    .icon {
                        height: 50%;
                    }
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
                stroke-width: 7%;
                stroke-dasharray: 0;
                stroke-dashoffset: 0;
                animation-name: dash-frame;
                animation-fill-mode: forwards;
                cursor: pointer;
            }
        }

        &.on {
            .switch {
                .inner {
                    background: #fed800;

                    .icon {
                        color: var(--accessory-highlight);
                    }
                }
            }

            .context {
                .inner {
                    background: #fed800;

                    .icon {
                        color: var(--accessory-highlight);
                    }
                }
            }

            svg {
                .marker {
                    stroke: #fed800;
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
