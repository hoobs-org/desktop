<template>
    <div id="port-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <input type="number" ref="field" autocomplete="false" min="1" step="1" max="65535" :value="value" @input="update()" @change="change" v-bind:required="required" />
    </div>
</template>

<script>
    export default {
        name: "port-field",
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
    #port-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #port-field .title {
        font-weight: bold;
        font-size: 12px;
    }

    #port-field .description {
        font-size: 12px;
    }

    #port-field.dark input {
        flex: 1;
        padding: 7px;
        font-size: 14px;
        background: #444;
        color: #fff;
        border: 1px #333 solid;
        border-radius: 5px;
    }

    #port-field.dark input:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #port-field.light input {
        flex: 1;
        padding: 7px;
        font-size: 14px;
        background: #fff;
        color: #000;
        border: 1px #e5e5e5 solid;
        border-radius: 5px;
    }

    #port-field.light input:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
