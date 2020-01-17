<template>
    <div id="select-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <div class="container">
            <select ref="field" :value="value" @input="update()" @change="change()" v-bind:required="required">
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
            type: {
                type: String,
                default: "string"
            },
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
                let selected = null;

                switch (this.type.toLowerCase()) {
                    case "bool":
                    case "boolean":
                        this.$emit("input", (this.$refs.field.value || "").toLowerCase() === "true");
                        break;

                    case "float":
                    case "double":
                    case "decimal":
                    case "number":
                        selected = parseFloat(this.$refs.field.value);

                        if (Number.isNaN(selected)) {
                            selected = null;
                        }

                        this.$emit("input", selected);
                        break;

                    case "int":
                    case "integer":
                        selected = parseInt(this.$refs.field.value, 10);

                        if (Number.isNaN(selected)) {
                            selected = null;
                        }

                        this.$emit("input", selected);
                        break;

                    default:
                        this.$emit("input", this.$refs.field.value);
                        break;
                }
            },

            change() {
                let selected = null;

                switch (this.type.toLowerCase()) {
                    case "bool":
                    case "boolean":
                        this.$emit("change", (this.$refs.field.value || "").toLowerCase() === "true");
                        break;

                    case "float":
                    case "double":
                    case "decimal":
                    case "number":
                        selected = parseFloat(this.$refs.field.value);

                        if (Number.isNaN(selected)) {
                            selected = null;
                        }

                        this.$emit("change", selected);
                        break;

                    case "int":
                    case "integer":
                        selected = parseInt(this.$refs.field.value, 10);

                        if (Number.isNaN(selected)) {
                            selected = null;
                        }

                        this.$emit("change", selected);
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
        padding: 5px 1px;
        height: 33px !important;
        border-bottom: 1px #424242 solid;
    }

    #select-field.light .container {
        flex: 1;
        padding: 5px 1px;
        height: 33px !important;
        border-bottom: 1px #e5e5e5 solid;
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
        padding: 0;
        margin: 0 -16px 0 -8px;
    }

    #select-field.dark .container select {
        color: #fff;
    }

    #select-field.light .container select {
        color: #000;
    }
</style>
