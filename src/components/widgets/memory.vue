<template>
    <div id="widget">
        <div class="title">{{ $t("memory") }}</div>
        <div class="value">{{ (((memory || {}).used || {}).value || 0).toFixed(1) }} {{ ((memory || {}).used || {}).units || "MB" }}</div>
    </div>
</template>

<script>
    export default {
        name: "memory-widget",

        computed: {
            memory() {
                return this.$store.state.memory;
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
        color: var(--widget-text);
        background: var(--widget-background);
        backdrop-filter: var(--transparency);
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
