<template>
    <div id="control" :class="on ? 'on' : 'off'">
        <div :class="style">
            <div v-if="features.brightness" class="background">
                <div class="inner"></div>
            </div>
            <svg v-if="features.brightness" viewBox="0 0 100 100" v-on:click.stop="select" v-on:mousedown.prevent="start(true)" v-on:touchstart.prevent="start()">
                <path class="range" :d="range" />
                <path v-if="visable" class="marker" style="stroke: #fed800;" :d="marker" />
            </svg>
            <div class="switch">
                <div v-if="on" class="inner" v-on:click="toggle" style="background: #fed800;">
                    <icon name="lightbulb-group" class="icon" />
                </div>
                <div v-else class="inner" v-on:click="toggle">
                    <icon name="lightbulb-group" class="icon" />
                </div>
            </div>
        </div>
        <div class="name">{{ $t("all_lights") }}</div>
    </div>
</template>

<script>
    import Debounce from "lodash.debounce";

    const UPDATE_DELAY = 150;
    const LOCAL_DELAY = 1000;

    const RADIUS = 41;

    const MID_X = 50;
    const MID_Y = 50;

    const MIN_RADIANS = (4 * Math.PI) / 3;
    const MAX_RADIANS = -Math.PI / 3;

    export default {
        name: "brightness-accessory",

        props: {
            id: String,
            disabled: Boolean,
            features: Object,
        },

        computed: {
            style() {
                let result = "item";

                if (this.features.brightness) result = `${result} brightness`;

                return result;
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
                brightness: 0,
                local: false,
                room: null,
                subject: null,
                updater: Debounce(() => {
                    if (this.room && !this.local) {
                        if (this.subject && this.subject.type === "light") {
                            const { ...subject } = this.subject;
                            const index = this.room.accessories.findIndex((item) => item.accessory_identifier === subject.accessory_identifier);

                            if (index >= 0) this.room.accessories[index] = subject;
                        }

                        this.subject = null;
                        this.brightness = 0;
                        this.on = false;
                        this.room.accessories = this.room.accessories || [];

                        for (let i = 0; i < this.room.accessories.length; i += 1) {
                            if (this.room.accessories[i].type === "light") {
                                const on = this.room.accessories[i].characteristics.find((item) => item.type === "on");
                                const brightness = this.room.accessories[i].characteristics.find((item) => item.type === "brightness");

                                this.on = this.on || (on || {}).value || false;

                                if ((on || {}).value) this.brightness = Math.max(this.brightness, (brightness || {}).value || 0);
                            }
                        }
                    }
                }, UPDATE_DELAY),
                commit: Debounce(async () => {
                    if (!this.disabled) {
                        this.local = true;

                        if (this.room) await this.room.set("brightness", Math.round(this.brightness));

                        setTimeout(() => { this.local = false; }, LOCAL_DELAY * (this.room.devices || 5));
                    }
                }, UPDATE_DELAY),
            };
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "IO:ACCESSORY:CHANGE" && mutation.payload.data.accessory.room === this.id) {
                    this.subject = mutation.payload.data.accessory;
                    this.updater();
                }

                if (mutation.type === "IO:ROOM:CHANGE" && mutation.payload.data.action === "control" && mutation.payload.data.service === "off") {
                    setTimeout(async () => {
                        this.on = false;
                        this.room = await this.$hoobs.room(this.id);
                        this.updater();
                    }, LOCAL_DELAY * (this.room.devices || 5));
                }
            });
        },

        async mounted() {
            this.room = await this.$hoobs.room(this.id);
            this.room.accessories = this.room.accessories || [];
            this.room.accessories = this.room.accessories.filter((item) => item.type === "light");

            this.updater();
        },

        methods: {
            map(x, inMin, inMax, outMin, outMax) {
                return (((x - inMin) * (outMax - outMin)) / (inMax - inMin)) + outMin;
            },

            async toggle() {
                this.local = true;
                this.on = !this.on;

                await this.room.set("on", this.on);

                setTimeout(() => { this.local = false; }, LOCAL_DELAY * (this.room.devices || 5));
            },

            update(offsetX, offsetY) {
                if (!this.disabled) {
                    const angle = Math.atan2(this.$el.clientWidth / 2 - offsetY, offsetX - this.$el.clientWidth / 2);
                    const start = -Math.PI / 2 - Math.PI / 6;

                    if (angle > MAX_RADIANS) {
                        this.brightness = this.map(angle, MIN_RADIANS, MAX_RADIANS, 0, 100);
                    } else if (angle < start) {
                        this.brightness = this.map(angle + 2 * Math.PI, MIN_RADIANS, MAX_RADIANS, 0, 100);
                    } else {
                        return;
                    }

                    this.$emit("input", Math.round(this.brightness));
                }
            },

            select(event) {
                if (!this.disabled) this.update(event.offsetX, event.offsetY);
            },

            start(mouse) {
                if (!this.disabled) {
                    window.addEventListener(mouse ? "mousemove" : "touchmove", mouse ? this.pointer : this.touch);
                    window.addEventListener(mouse ? "mouseup" : "touchend", mouse ? this.leave : this.stop);
                }
            },

            leave() {
                if (!this.disabled) {
                    window.removeEventListener("mousemove", this.pointer);
                    window.removeEventListener("mouseup", this.leave);

                    this.on = true;
                    this.commit();
                }
            },

            stop() {
                if (!this.disabled) {
                    window.removeEventListener("touchmove", this.touch);
                    window.removeEventListener("touchend", this.stop);

                    this.on = true;
                    this.commit();
                }
            },

            pointer(event) {
                if (!this.disabled) this.update(event.offsetX, event.offsetY);
            },

            touch(event) {
                if (!this.disabled && event.touches.length === 1) {
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

        .brightness {
            .switch {
                padding: 15%;
                border: 0 none;
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

            svg {
                .marker {
                    stroke: #fed800;
                    opacity: 1;
                }
            }
        }
    }
</style>
