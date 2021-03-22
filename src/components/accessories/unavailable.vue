<template>
    <div id="control">
        <div class="item">
            <div class="background"></div>
            <div v-if="!disabled" v-on:click="remove" class="remove">
                <icon name="delete" class="icon" :title="$t('remove_from_dashboard')" />
            </div>
        </div>
        <div class="name">{{ $t("unavailable") }}</div>
    </div>
</template>

<script>
    import { Wait } from "@hoobs/sdk/lib/wait";

    export default {
        name: "unavailable-accessory",

        props: {
            disabled: Boolean,
            item: Object,
        },

        methods: {
            async remove() {
                const config = await this.$hoobs.config.get();

                config.dashboard = config.dashboard || {};
                config.dashboard.items = config.dashboard.items || [];

                const index = config.dashboard.items.findIndex((item) => item.component === "accessory-widget" && item.i === this.item.id);

                if (index >= 0) config.dashboard.items.splice(index, 1);

                await this.$hoobs.config.update(config);
                await Wait();

                this.$action.emit("dashboard", "update");
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
            padding: 7px;
            opacity: 0.40;
        }

        .remove {
            display: none;
            position: absolute;
            justify-content: space-around;
            align-items: center;
            padding: 3px;
            top: 2px;
            right: 2px;
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

        &:hover {
            .remove {
                display: flex;
            }
        }

        .background {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        }
    }
</style>
