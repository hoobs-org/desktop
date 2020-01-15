<template>
    <div id="hex-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <div class="field-container">
            <input type="text" ref="field" autocomplete="false" :value="value" @input="update()" @change="change" v-bind:required="required" />
            <div class="regenerate-link" v-on:click="$emit('generate')">
                <span class="icon">autorenew</span>
            </div>
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
        padding: 7px;
        margin: 4px 0 0 0;
        font-size: 14px;
        background: #444;
        color: #fff;
        border: 1px #333 solid;
        border-radius: 5px;
    }

    #hex-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #hex-field.light input {
        flex: 1;
        padding: 7px;
        margin: 4px 0 0 0;
        font-size: 14px;
        background: #fff;
        color: #000;
        border: 1px #e5e5e5 solid;
        border-radius: 5px;
    }

    #hex-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #hex-field .field-container {
        display: flex;
        position: relative;
    }

    #hex-field .regenerate-link {
        width: 33px;
        height: 33px;
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: space-around;
        cursor: pointer;
    }

    #hex-field .regenerate-link .icon {
        font-size: 17px;
    }
</style>
