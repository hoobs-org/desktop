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

    #text-field .title {
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
        background: #444;
        color: #fff;
        border: 1px #333 solid;
        border-radius: 5px;
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
        background: #fff;
        color: #000;
        border: 1px #e5e5e5 solid;
        border-radius: 5px;
    }

    #text-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
