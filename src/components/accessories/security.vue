<template>
    <div v-if="!hidden" id="control">
        <div class="item">
            <div class="background">
                <div class="panel">
                    <div class="actions">
                        <div class="row">
                            <div class="cell on" v-if="state === 0">{{ $t("home") }}</div>
                            <div class="cell" v-else v-on:click="mode(0)">{{ $t("home") }}</div>
                            <div class="cell on" v-if="state === 1">{{ $t("away") }}</div>
                            <div class="cell" v-else v-on:click="mode(1)">{{ $t("away") }}</div>
                        </div>
                        <div class="row">
                            <div class="cell on" v-if="state === 2">{{ $t("night") }}</div>
                            <div class="cell" v-else v-on:click="mode(2)">{{ $t("night") }}</div>
                            <div class="cell on" v-if="state === 3">{{ $t("off") }}</div>
                            <div class="cell" v-else v-on:click="mode(3)">{{ $t("off") }}</div>
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
        name: "security-accessory",

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
        },

        data() {
            return {
                state: 0,
                battery: 0,
                features: {
                    battery: false,
                },
                local: false,
                subject: null,
                display: "",
                hidden: false,
                updater: Debounce(() => {
                    if (!this.local) {
                        const battery = this.subject.characteristics.find((item) => item.type === "battery_level");

                        this.display = this.subject.name;
                        this.hidden = this.subject.hidden;
                        this.state = (this.subject.characteristics.find((item) => item.type === "security_system_target_state") || {}).value || 0;
                        this.battery = (battery || {}).value || 0;

                        if (battery) this.features.battery = true;
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

            async mode(value) {
                this.local = true;

                const accessory = await this.$hoobs.accessory(this.subject.bridge, this.subject.accessory_identifier);

                this.state = value;

                await accessory.set("security_system_target_state", value);

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
            display: flex;
            align-items: center;
            top: 0;
            left: 0;
        }

        .panel {
            width: 100%;
            height: 70%;
            margin: 3% 0 0 0;
            box-sizing: border-box;
            padding: 11px 11px 10px 10px;
            display: flex;
            flex-direction: column;
            border-radius: 7px;
            border: 2px var(--accessory-border) solid;

            .actions {
                flex: 1;
                display: flex;
                flex-direction: column;

                .row {
                    flex: 1;
                    display: flex;
                    flex-direction: row;

                    .cell {
                        flex: 1;
                        background: var(--accessory-background);
                        border: 1px var(--accessory-border) solid;
                        border-radius: 0 0 3px 0;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-around;
                        color: var(--accessory-text);
                        font-size: 80%;
                        overflow: hidden;
                        cursor: pointer;

                        margin-right: -1px;
                        margin-bottom: -1px;
                        z-index: 1;

                        &:first-child {
                            margin-left: -1px;
                            border-radius: 0 0 0 3px;
                        }

                        &.on {
                            border: 1px var(--application-highlight) solid;
                            background: var(--application-highlight);
                            color: var(--accessory-highlight);
                            z-index: 10;
                        }
                    }

                    &:first-child {
                        .cell {
                            margin-top: -1px;
                            margin-right: -1px;
                            margin-bottom: -1px;
                            border-radius: 0 3px 0 0;

                            &:first-child {
                                margin-left: -1px;
                                border-radius: 3px 0 0 0;
                            }
                        }
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
