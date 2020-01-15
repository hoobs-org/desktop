<template>
    <div id="select-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <div class="container">
            <select ref="field" v-model="value" @input="update()" @change="change()" v-bind:required="required">
                <option v-for="option in options" v-bind:value="option.value" :key="option.value">
                    {{ option.text }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>
    export default {
        name: "select-field",

        props: {
            name: String,
            description: String,
            value: [String, Number, Boolean, Object, Date],
            type: String,
            options: Array,
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
                let value = null;

                switch ((this.type || "string").toLowerCase()) {
                    case "bool":
                    case "boolean":
                        this.$emit("input", (this.$refs.field.value || "").toLowerCase() === "true");
                        break;

                    case "float":
                    case "double":
                    case "decimal":
                    case "number":
                        value = parseFloat(this.$refs.field.value);

                        if (Number.isNaN(value)) {
                            value = null;
                        }

                        this.$emit("input", value);
                        break;

                    case "int":
                    case "integer":
                        value = parseInt(this.$refs.field.value, 10);

                        if (Number.isNaN(value)) {
                            value = null;
                        }

                        this.$emit("input", value);
                        break;

                    default:
                        this.$emit("input", this.$refs.field.value);
                        break;
                }
            },

            change() {
                let value = null;

                switch ((this.type || "string").toLowerCase()) {
                    case "bool":
                    case "boolean":
                        this.$emit("change", (this.$refs.field.value || "").toLowerCase() === "true");
                        break;

                    case "float":
                    case "double":
                    case "decimal":
                    case "number":
                        value = parseFloat(this.$refs.field.value);

                        if (Number.isNaN(value)) {
                            value = null;
                        }

                        this.$emit("change", value);
                        break;

                    case "int":
                    case "integer":
                        value = parseInt(this.$refs.field.value, 10);

                        if (Number.isNaN(value)) {
                            value = null;
                        }

                        this.$emit("change", value);
                        break;

                    default:
                        this.$emit("change", this.$refs.field.value);
                        break;
                }
            }
        }
    };
</script>

<style scoped>
    #select-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #select-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #select-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #select-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #select-field.dark .container {
        flex: 1;
        padding: 5px 5px 6px 5px;
        height: 33px !important;
        background: #444;
        border: 1px #333 solid;
        border-radius: 5px;
    }

    #select-field.light .container {
        flex: 1;
        padding: 5px 5px 6px 5px;
        height: 33px !important;
        background: #fff;
        border: 1px #e5e5e5 solid;
        border-radius: 5px;
    }

    #select-field.dark .container:focus-within {
        border-color: #feb400;
    }

    #select-field.light .container:focus-within {
        border-color: #feb400;
    }

    #select-field .container select {
        width: 100%;
        font-size: 14px;
        outline: 0 none !important;
        background: transparent;
        border: 0 none;
    }

    #select-field.dark .container select {
        color: #fff;
    }

    #select-field.light .container select {
        color: #000;
    }
</style>
