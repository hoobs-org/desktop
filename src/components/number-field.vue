<template>
    <div id="number-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <input type="number" ref="field" autocomplete="false" :value="value" @input="update()" @change="change" v-bind:required="required" />
    </div>
</template>

<script>
    export default {
        name: "number-field",
        props: {
            name: String,
            description: String,
            value: Number,
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
                this.$emit("input", parseFloat(this.$refs.field.value));
            },

            change() {
                this.$emit("change", this.$refs.field.value);
            }
        }
    };
</script>

<style scoped>
    #number-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #number-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #number-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #number-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #number-field.dark input {
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

    #number-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #number-field.light input {
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

    #number-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
