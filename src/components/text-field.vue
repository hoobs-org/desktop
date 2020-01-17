<template>
    <div id="text-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <input type="text" ref="field" autocomplete="false" autocorrect="off" autocapitalize="none" :value="value" @input="update()" @change="change" v-bind:required="required" />
    </div>
</template>

<script>
    export default {
        name: "text-field",

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
    #text-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #text-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #text-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #text-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #text-field.dark input {
        flex: 1;
        padding: 7px;
        margin: 4px 0 0 0;
        font-size: 14px;
        background: transparent;
        color: #fff;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: #424242;
    }

    #text-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #text-field.light input {
        flex: 1;
        padding: 7px;
        margin: 4px 0 0 0;
        font-size: 14px;
        background: transparent;
        color: #000;
        border-width: 0 0 1px 0;
        border-style: solid;
        border-color: #e5e5e5;
    }

    #text-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
