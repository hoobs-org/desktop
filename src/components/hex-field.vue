<template>
    <div id="hex-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <div class="field-container">
            <input type="text" ref="field" autocomplete="false" :value="value" @input="update()" @change="change" v-bind:required="required" />
        </div>
    </div>
</template>

<script>
    export default {
        name: "hex-field",

        props: {
            name: String,
            description: String,
            value: String,
            required: {
                type: Boolean,
                default: false
            },
            theme: {
                type: String,
                default: "dark"
            }
        },

        methods: {
            update() {
                this.$emit("input", this.$refs.field.value);
            },

            change() {
                this.$emit("change", this.$refs.field.value);
            }
        }
    };
</script>

<style scoped>
    #hex-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #hex-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #hex-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #hex-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #hex-field.dark input {
        flex: 1;
        padding: 7px 1px;
        margin: 4px 0 0 0;
        font-size: 14px;
        background: transparent;
        color: #fff;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: #424242;
    }

    #hex-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #hex-field.light input {
        flex: 1;
        padding: 7px 1px;
        margin: 4px 0 0 0;
        font-size: 14px;
        background: transparent;
        color: #000;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: #e5e5e5;
    }

    #hex-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #hex-field .field-container {
        display: flex;
        position: relative;
    }
</style>
