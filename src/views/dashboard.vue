<template>
    <div :key="version" id="dashboard" :class="backdrop ? 'backdrop' : ''">
        <context>
            <div v-on:click.stop="$dialog.open('dashboard')" class="button">
                <icon name="widgets" class="icon" />
                {{ $t("widgets") }}
            </div>
            <div class="seperator"></div>
            <icon v-if="locked" v-on:click.stop="toggle()" :title="$t('sort_dashboard')" name="lock" class="icon" />
            <icon v-else v-on:click.stop="toggle()" :title="$t('sort_dashboard')" name="lock-open-variant" class="icon" />
        </context>
        <div class="content">
            <grid-layout
                :layout="items"
                :col-num="80"
                :row-height="5"
                :is-draggable="!locked"
                :is-resizable="!locked"
                :is-mirrored="false"
                :vertical-compact="true"
                :margin="[10, 10]"
                :use-css-transforms="true"
            >
                <grid-item class="widget" v-for="(item, index) in items" :key="`widget:${index}`" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i">
                    <component :is="item.component" :item="item" :index="index" :locked="locked" />
                </grid-item>
            </grid-layout>
        </div>
    </div>
</template>

<script>
    import GridLayout from "vue-grid-layout";
    import { initial, widgets } from "../services/widgets";

    export default {
        name: "dashboard",

        components: {
            "grid-layout": GridLayout.GridLayout,
            "grid-item": GridLayout.GridItem,

            ...widgets(),
        },

        data() {
            return {
                version: 0,
                locked: true,
                loading: true,
                backdrop: false,
                items: [],
            };
        },

        created() {
            this.$action.on("settings", "update", () => {
                this.load();
                this.render();
            });

            this.$action.on("dashboard", "update", () => {
                this.load();
                this.render();
            });
        },

        async mounted() {
            await this.load();
        },

        async beforeRouteLeave(_to, _from, next) {
            if (!this.locked) await this.save();

            next();
        },

        methods: {
            async load() {
                this.loading = true;

                const config = await this.$hoobs.config.get();

                config.dashboard = config.dashboard || {
                    items: [...initial],
                };

                this.items = config.dashboard.items || [];
                this.backdrop = config.dashboard.backdrop || false;
                this.loading = false;
            },

            render() {
                this.version += 1;
            },

            async toggle() {
                if (!this.locked) await this.save();

                this.locked = !this.locked;
            },

            async save() {
                if (!this.loading) {
                    const config = await this.$hoobs.config.get();
                    const items = JSON.parse(JSON.stringify(this.items));

                    config.dashboard = config.dashboard || {};

                    for (let i = 0; i < items.length; i += 1) {
                        delete items[i].moved;
                    }

                    config.dashboard.items = items;

                    await this.$hoobs.config.update(config);
                }
            },
        },
    };
</script>

<style lang="scss" scoped>
    #dashboard {
        flex: 1;
        display: flex;
        overflow: hidden;
        flex-direction: column;

        &.backdrop {
            background-image: var(--backdrop);
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
        }

        .content {
            flex: 1;
            overflow: auto;
            -ms-overflow-style: none;
            scrollbar-width: none;
            background: linear-gradient(
                to bottom,
                var(--application-background) 0%,
                #00000000 30%
            );

            &::-webkit-scrollbar {
                display: none;
            }

            .widget {
                border-radius: 0;
                box-sizing: border-box;
                color: var(--widget-text);
                background: var(--widget-background);
                backdrop-filter: var(--transparency);
                transition: none !important;
                touch-action: none;
                overflow: hidden;
            }
        }
    }
</style>
