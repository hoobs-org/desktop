<template>
    <div v-if="!loading" id="widget">
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

        components: {
            ...accessories(),
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

                if (this.accessory.accessory_identifier) {
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
        color: var(--widget-text);
        background: var(--widget-background);
        backdrop-filter: var(--transparency);
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
