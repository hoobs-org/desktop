<template>
    <div v-if="!hidden" id="control">
        <div class="item">
            <div class="background">
                <div class="panel" :style="style">
                    <spinner v-if="!snapshot" />
                    <div v-if="snapshot && !live" class="timelapse">{{ span }}</div>
                    <div v-if="snapshot && live" class="timelapse">{{ $t("live") }}</div>
                    <icon v-if="!live" v-on:click="stream" name="toggle-switch-off" class="icon" />
                    <icon v-if="live" v-on:click="stop" name="toggle-switch" class="icon" />
                </div>
            </div>
            <div v-if="!disabled" v-on:click.stop="settings" class="settings">
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
        <div v-if="!dashboard" class="name">{{ display }}</div>
    </div>
</template>

<script>
    import Debounce from "lodash.debounce";

    const UPDATE_DELAY = 150;
    const CYCLE_TIMER = 3 * 60 * 1000;

    export default {
        name: "camera-accessory",

        props: {
            disabled: Boolean,
            accessory: Object,
            dashboard: Boolean,
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
                if (this.snapshot) return `background-image: url(data:image/png;base64,${this.snapshot})`;

                return "background-image: none";
            },

            span() {
                if (!this.timelapse) return this.$t("now");

                if (this.timelapse >= 604800) {
                    const weeks = Math.round(this.timelapse / 604800);

                    if (weeks <= 1) return `1 ${this.$t("week")}`;

                    return `${weeks} ${this.$t("weeks")}`;
                }

                if (this.timelapse >= 86400) {
                    const days = Math.round(this.timelapse / 86400);

                    if (days <= 1) return `1 ${this.$t("day")}`;

                    return `${days} ${this.$t("days")}`;
                }

                if (this.timelapse >= 3600) {
                    const hours = Math.round(this.timelapse / 3600);

                    if (hours <= 1) return `1 ${this.$t("hours")}`;

                    return `${hours} ${this.$t("hour")}`;
                }

                if (this.timelapse >= 60) {
                    const minutes = Math.round(this.timelapse / 3600);

                    if (minutes <= 1) return `1 ${this.$t("minute")}`;

                    return `${minutes} ${this.$t("minutes")}`;
                }

                if (this.timelapse < 10) return this.$t("now");

                return `${this.timelapse} ${this.$t("seconds")}`;
            },
        },

        data() {
            return {
                battery: 0,
                features: {
                    battery: false,
                    stream: false,
                },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                snapshot: null,
                timelapse: 0,
                live: false,
                source: null,
                timers: {
                    snapshot: null,
                    timelapse: null,
                },
                updater: Debounce(async () => {
                    if (!this.local) {
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.battery = (battery || {}).value || 0;

                        if (battery) this.features.battery = true;
                        if (this.subject.supports_streaming) this.features.stream = true;

                        this.cycle(true, true);
                    }
                }, UPDATE_DELAY),
            };
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "IO:ACCESSORY:CHANGE" && mutation.payload.data.accessory.accessory_identifier === this.subject.accessory_identifier) {
                    this.updater();
                }

                if (mutation.type === "IO:SNAPSHOT:UPDATE" && mutation.payload.id === this.accessory.accessory_identifier) {
                    this.snapshot = mutation.payload.data;
                    this.timelapse = 0;
                }
            });
        },

        async mounted() {
            this.subject = await this.$hoobs.accessory(this.accessory.bridge, this.accessory.accessory_identifier);
            this.snapshot = this.$store.state.snapshots[this.accessory.accessory_identifier];

            if (this.subject) await this.subject.stream.stop();

            this.lapse();
            this.updater();
        },

        beforeDestroy() {
            this.lapse(true);
            this.cycle(false, true);
        },

        methods: {
            settings() {
                this.$dialog.open("accessory", {
                    bridge: this.subject.bridge,
                    id: this.subject.accessory_identifier,
                    camera: true,
                });
            },

            lapse(clear) {
                if (clear) {
                    clearTimeout(this.timers.snapshot);
                } else {
                    this.timelapse += 1;
                    this.timers.timelapse = setTimeout(() => this.lapse(), 500);
                }
            },

            async cycle(repeat, clear) {
                if (clear) clearTimeout(this.timers.snapshot);

                if (repeat) {
                    const snapshot = await this.subject.snapshot();

                    if (snapshot) {
                        this.$store.commit("IO:SNAPSHOT:UPDATE", {
                            id: this.subject.accessory_identifier,
                            data: snapshot,
                        });
                    }

                    this.timers.snapshot = setTimeout(() => this.cycle(true, false), this.live ? 1000 : CYCLE_TIMER);
                }
            },

            async stream() {
                this.live = true;
                this.cycle(true, true);
            },

            async stop() {
                this.live = false;
                this.cycle(true, true);
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
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: 0;
            left: 0;
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
            color: #fff;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: 2px;
            right: 2px;
            cursor: pointer;

            .icon {
                height: 22px;
                opacity: 0.4;
            }

            &:hover {
                .icon {
                    opacity: 1;
                }
            }
        }

        .background {
            width: 100%;
            aspect-ratio: 16/9;
            display: flex;
            align-items: center;
            top: 0;
            left: 0;
        }

        .panel {
            width: 100%;
            height: 100%;
            position: relative;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-around;
            border-radius: 7px;
            border: 1px var(--accessory-border) solid;
            background-color: var(--accessory-background);
            background-repeat: no-repeat;
            background-size: cover;

            .timelapse {
                position: absolute;
                bottom: 7px;
                right: 10px;
                color: #ffffff8a;
                font-weight: bold;
                font-size: 14px;
            }

            .icon {
                position: absolute;
                bottom: 7px;
                left: 10px;
                color: #ffffff8a;
                cursor: pointer;
            }

            .stream {
                width: 100%;
                height: 100%;
                border-radius: 7px;
            }
        }

        &:hover {
            .settings {
                display: flex;
            }
        }
    }
</style>
