<template>
    <modal :title="$t('hidden_accessories')" :draggable="true" width="760px" height="660px">
        <div id="hidden">
            <div v-if="!loading" class="content">
                <div class="form">
                    <div class="grid">
                        <div v-for="(accessory, index) in accessories" :key="`hidden:${index}`" v-on:click="unhide(accessory)" class="button full">{{ accessory.name }}</div>
                    </div>
                </div>
            </div>
            <div v-else class="loading">
                <spinner />
            </div>
            <div class="actions modal">
                <div v-on:click="$dialog.close('hidden')" class="button">{{ $t("cancel") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "hidden",

        data() {
            return {
                loading: true,
                accessories: [],
            };
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "IO:ACCESSORY:CHANGE") {
                    this.load();
                }
            });
        },

        async mounted() {
            await this.load();
        },

        methods: {
            async load() {
                this.loading = true;
                this.accessories = await this.$hoobs.accessories(true);
                this.loading = false;
            },

            async unhide(subject) {
                const accessory = await this.$hoobs.accessory(subject.bridge, subject.accessory_identifier);

                await accessory.set("hidden", false);

                this.$dialog.close("hidden");
            },
        },
    };
</script>

<style lang="scss" scoped>
    #hidden {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;
        overflow: hidden;

        .content {
            overflow: hidden;

            .form {
                overflow: auto;
                -ms-overflow-style: none;
                scrollbar-width: none;

                &::-webkit-scrollbar {
                    display: none;
                }
            }
        }

        .full {
            flex: 1;
            margin: 0 10px 10px 0;
            justify-content: space-around;
        }
    }
</style>
