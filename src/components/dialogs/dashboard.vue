<template>
    <modal :title="$t('settings')" :draggable="true" width="760px" height="620px">
        <div id="settings">
            <div v-if="!loading" class="content">
                <div class="form">
                    <div class="row section">{{ $t("background") }}</div>
                    <div class="row">
                        <checkbox id="backdrop" :title="$t('dashboard_background')" v-model="backdrop" />
                    </div>
                    <div class="row section">{{ $t("dashboard_items") }}</div>
                    <div class="grid">
                        <div v-for="(item, index) in available" :key="`item:${index}`">
                            <checkbox :id="`item_${index}`" :title="$t(item.label)" v-model="item.selected" />
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
            <div class="actions modal">
                <div v-on:click="$dialog.close('dashboard')" class="button">{{ $t("cancel") }}</div>
                <div v-on:click="save()" class="button primary">{{ $t("apply") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    import { initial, available, layout } from "../../services/widgets";

    export default {
        name: "dashboard",

        data() {
            return {
                loading: true,
                items: [],
                backdrop: "",
                available: [...available],
            };
        },

        async mounted() {
            const config = await this.$hoobs.config.get();

            config.dashboard = config.dashboard || {
                items: [...initial],
            };

            this.items = config.dashboard.items;
            this.backdrop = config.dashboard.backdrop || false;

            for (let i = 0; i < this.items.length; i += 1) {
                const index = this.available.findIndex((item) => item.name === this.items[i].component);

                if (index >= 0) {
                    this.available[index].selected = true;
                }
            }

            this.loading = false;
        },

        methods: {
            async save() {
                const config = await this.$hoobs.config.get();
                const items = JSON.parse(JSON.stringify(this.items));

                for (let i = 0; i < this.available.length; i += 1) {
                    const index = items.findIndex((item) => item.component === this.available[i].name);

                    if (this.available[i].selected && index === -1) {
                        const widget = layout(this.available[i].name);

                        if (widget) items.unshift(widget);
                    } else if (!this.available[i].selected && index >= 0) {
                        items.splice(index, 1);
                    }
                }

                config.dashboard = {
                    items,
                    backdrop: this.backdrop,
                };

                await this.$hoobs.config.update(config);

                this.$action.emit("dashboard", "update");
                this.$dialog.close("dashboard");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #settings {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;

        .grid {
            display: grid;
            grid-template-columns: auto auto;
        }
    }
</style>
