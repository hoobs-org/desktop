<template>
    <div id="widget">
        <line-chart :key="key" id="activity" height="100%" suffix="%" :discrete="true" :data="graph" :min="0" :max="100" :colors="colors" :curve="false" legend="bottom" />
    </div>
</template>

<script>
    export default {
        name: "activity-widget",

        data() {
            return {
                key: 1,
                colors: [],
            };
        },

        created() {
            this.$store.subscribe(async (mutation) => {
                if (mutation.type === "THEME:SET") {
                    const theme = await this.$theme.get();

                    this.colors = [
                        theme.application.highlight,
                        theme.application.accent,
                    ];
                }
            });
        },

        async mounted() {
            const theme = await this.$theme.get();

            this.colors = [
                theme.application.highlight,
                theme.application.accent,
            ];
        },

        computed: {
            graph() {
                return [{
                    name: `${this.$t("cpu")} ${(this.cpu || {}).used || 0}%`,
                    data: this.cpu.history,
                }, {
                    name: `${this.$t("memory")} ${(this.memory || {}).load || 0}% (${((this.memory || {}).used || {}).value || 0} ${((this.memory || {}).used || {}).units || "MB"})`,
                    data: this.memory.history,
                }];
            },

            cpu() {
                return this.$store.state.cpu;
            },

            memory() {
                return this.$store.state.memory;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        width: 100%;
        height: 100%;
        padding: 30px 20px 15px 10px;
        box-sizing: border-box;
        cursor: default;
    }
</style>
