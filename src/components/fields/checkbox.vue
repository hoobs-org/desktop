<template>
    <div class="checkbox" :class="[classes]">
        <div class="group" v-on:click="toggle()">
            <div v-if="state">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
            </div>
            <input type="checkbox" :id="id || uuid" :name="name" :value="value" :disabled="disabled" :required="required" :checked="state" />
        </div>
        <label class="label" :for="id || uuid" v-html="title || description || format(field)"></label>
    </div>
</template>

<script>
    import { decamel } from "../../services/schema";

    export default {
        name: "checkbox",

        model: {
            prop: "model",
            event: "change",
        },

        props: {
            id: {
                type: String,
                default: undefined,
            },
            model: {
                type: Boolean,
                default: false,
            },
            checked: Boolean,
            value: {
                type: Boolean,
                default: false,
            },
            default: Boolean,
            name: String,
            field: [String, Number],
            title: String,
            description: String,
            required: Boolean,
            disabled: Boolean,
            size: Number,
        },

        data() {
            return {
                uuid: "",
                view: this.model,
            };
        },

        computed: {
            state() {
                return this.model || Boolean(this.view);
            },

            classes() {
                return {
                    "disabled": this.disabled,
                    "active": this.state,
                };
            },
        },

        methods: {
            format(value) {
                if (!Number.isNaN(parseInt(value, 10))) return "";
                if (!value || value === "") return value;

                return decamel(value);
            },

            toggle() {
                if (this.disabled) return;

                let value = this.model || this.view;

                value = !value;

                this.view = value;

                this.$emit("input", value, this.value);
                this.$emit("change", value, this.value);
            },
        },

        watch: {
            checked(value) {
                if (value !== this.state) this.toggle();
            },

            model(value) {
                this.view = value;
            },
        },

        mounted() {
            if (this.id === undefined || typeof String) {
                this.uuid = `checkbox_${Math.random().toString(36).substring(2, 10)}`;
            } else {
                this.uuid = this.id;
            }

            if (this.value === undefined && this.default !== undefined) {
                this.view = this.default;

                this.$emit("input", this.default, this.value);
                this.$emit("change", this.default, this.value);
            }

            if (this.checked && !this.state) this.toggle();
        },
    };
</script>

<style lang="scss" scoped>
    .checkbox {
        width: 100%;
        height: 29px;
        min-height: 29px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        position: relative;
        margin: 0;
        line-height: 20px;

        .label {
            position: relative;
            padding-left: 7px;
            font-size: 14px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            user-select: none;
            cursor: pointer;
        }

        .group {
            box-sizing: border-box;
            position: relative;
            height: 20px;
            width: 20px;
            transition: 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
            cursor: pointer;

            input[type="checkbox"] {
                position: absolute;
                appearance: none;
                display: none;
                left: -999rem;
            }
        }

        &.disabled {
            cursor: not-allowed;

            .group {
                opacity: 0.14;
            }

            .label {
                opacity: 0.24;
                cursor: not-allowed;
            }
        }
    }
</style>
