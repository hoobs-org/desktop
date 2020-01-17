<template>
    <div id="password-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <input type="password" ref="field" autocomplete="false" :value="value" @input="update()" @change="change" v-bind:required="required" />
    </div>
</template>

<script>
    export default {
        name: "password-field",

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
    #password-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #password-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #password-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #password-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #password-field.dark input {
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

    #password-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #password-field.light input {
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

    #password-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
