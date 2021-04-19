<template>
    <div v-if="!loading" id="widget" :class="locked ? 'locked' : 'unlocked'">
        <div ref="device" class="device">
            <camera-accessory v-if="available" :accessory="accessory" :disabled="!locked" :dashboard="true" />
            <unavailable-accessory v-else :item="item" :disabled="!locked" />
            <div v-if="!locked" class="device-cover"></div>
        </div>
    </div>
</template>

<script>
    const LOAD_RETRY_DELAY = 5 * 1000;

    export default {
        name: "camera-widget",

        components: {
            "camera-accessory": () => import(/* webpackChunkName: "accessory-thermostat" */ "@/components/accessories/camera.vue"),
        },

        props: {
            item: {
                type: Object,
                required: true,
            },
            locked: Boolean,
        },

        data() {
            return {
                retries: 10,
                loading: true,
                accessory: null,
                available: false,
            };
        },

        async mounted() {
            await this.load();
        },

        methods: {
            async load() {
                this.accessory = await this.$hoobs.accessory(this.item.bridge, this.item.id);

                if (this.accessory.accessory_identifier && this.accessory.type === "camera") {
                    this.available = true;
                    this.loading = false;
                } else if (this.retries > 0) {
                    this.retries -= 1;

                    setTimeout(async () => {
                        await this.load();
                    }, LOAD_RETRY_DELAY);
                } else {
                    this.loading = false;
                }
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
