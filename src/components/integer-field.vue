<template>
    <div id="integer-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <input type="number" ref="field" autocomplete="false" step="1" :value="value" @input="update()" @change="change" v-bind:required="required" />
    </div>
</template>

<script>
    export default {
        name: "integer-field",
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
                this.$emit("input", parseInt(this.$refs.field.value, 10));
            },

            change() {
                this.$emit("change", this.$refs.field.value);
            }
        }
    };
</script>

<style scoped>
    #integer-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #integer-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #integer-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #integer-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #integer-field.dark input {
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

    #integer-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #integer-field.light input {
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

    #integer-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
