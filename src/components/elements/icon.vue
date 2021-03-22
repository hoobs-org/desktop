<template>
    <div id="icon" v-on:click="$emit('click', $event)">
        <svg viewBox="0 0 24 24">
            <path fill="currentColor" :d="path" />
        </svg>
        <slot />
    </div>
</template>

<script>
    import { icon } from "../../services/icons";

    export default {
        name: "icon",

        props: {
            name: {
                type: String,
                required: true,
            },
        },

        computed: {
            path() {
                return icon(this.name);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #icon {
        height: 24px;

        svg {
            height: 100%;
        }
    }
</style>
