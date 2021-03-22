<template>
    <div id="color" v-on:click="select()" :class="value.toLowerCase() === color.toLowerCase() ? 'active' : ''" :style="`background-color: ${color};`">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
    </div>
</template>

<script>
    export default {
        name: "color",

        props: {
            value: String,
            color: String,
        },

        methods: {
            select() {
                this.$emit("input", this.color.toLowerCase());
            },
        },
    };
</script>

<style lang="scss" scoped>
    #color {
        width: 34px;
        height: 33px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        margin: 0 7px 7px 0;
        box-sizing: border-box;
        cursor: pointer;

        &:last-child {
            margin: 0;
        }

        svg {
            width: 24px;
            height: 24px;
            display: none;
        }

        &:hover {
            border: var(--modal-highlight) 2px solid;
        }

        &.active {
            &:hover {
                border: 0 none;
            }

            svg {
                display: block;
            }
        }
    }
</style>
