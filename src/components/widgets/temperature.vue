<template>
    <div id="widget">
        <div class="title">{{ $t("cpu") }}</div>
        <div class="value">{{ temp ? `${temp}&#8451;` : "N/A" }}</div>
    </div>
</template>

<script>
    export default {
        name: "temperature-widget",

        computed: {
            temp() {
                return this.$store.state.temp !== null && this.$store.state.temp !== undefined ? Math.round(this.$store.state.temp) : null;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #widget {
        flex: 1;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
        align-content: center;
        padding: 14px;
        position: relative;
        cursor: default;
        user-select: none;

        .title {
            font-size: 15px;
        }

        .value {
            flex: 1;
            display: flex;
            align-items: center;
            align-content: center;
            color: var(--widget-highlight);
            text-align: center;
            font-size: 22px;
        }
    }
</style>
