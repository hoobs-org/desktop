<template>
    <div id="widget">
        <div class="title">{{ $t("memory") }}</div>
        <div class="value">{{ memory }}</div>
    </div>
</template>

<script>
    export default {
        name: "memory-widget",

        computed: {
            memory() {
                let bytes = this.$store.state.heap || 0;
                const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

                if (this.$store.state.bridges && this.$store.state.bridges.length > 0) bytes += this.$store.state.bridges.map((item) => item.heap || 0).reduce((accumulator, item) => accumulator + item);
                if (bytes === 0) return "0 Bytes";

                const power = Math.floor(Math.log(bytes) / Math.log(1024));

                return `${parseFloat((bytes / (1024 ** power)).toFixed(1))} ${sizes[power]}`;
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
