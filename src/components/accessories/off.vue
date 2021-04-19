<template>
    <div id="control">
        <div class="item">
            <div class="switch">
                <div class="inner" v-on:click="off">
                    <icon name="power" class="icon" />
                </div>
            </div>
        </div>
        <div class="name">{{ $t("all_off") }}</div>
    </div>
</template>

<script>
    export default {
        name: "off-accessory",

        props: {
            id: String,
            room: Object,
        },

        methods: {
            async off() {
                if (this.room) await this.room.set("off", true);
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

            &:hover {
                .inner {
                    background: var(--application-highlight);

                    .icon {
                        color: var(--accessory-highlight);
                        opacity: 1;
                    }
                }
            }
        }
    }
</style>
