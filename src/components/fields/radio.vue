<template>
    <div class="radio" :class="[classes]">
        <div class="group" v-on:click="toggle()">
            <div v-if="state">
                <div class="marker"></div>
            </div>
            <input type="radio" :id="id || uuid" :name="name" :value="value" :disabled="disabled" :required="required" :checked="state" />
        </div>
        <label class="label" :for="id || uuid" v-html="title || description || format(field)"></label>
    </div>
</template>

<script>
    import { decamel } from "../../services/schema";

    export default {
        name: "radio",

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
                type: [String, Boolean, Number, Object],
                default: undefined,
            },
            checked: Boolean,
            value: {
                type: [String, Boolean, Number, Object],
                default: undefined,
            },
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
                return this.model === this.value;
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

                this.view = this.model === this.value;

                this.$emit("input", this.value, this.value);
                this.$emit("change", this.value, this.value);
            },
        },

        watch: {
            checked(value) {
                if (value !== this.state) this.toggle();
            },

            model(value) {
                this.view = this.model === value;
            },
        },

        mounted() {
            if (this.id === undefined || typeof String) {
                this.uuid = `radio_${Math.random().toString(36).substring(2, 10)}`;
            } else {
                this.uuid = this.id;
            }

            if (this.checked && !this.state) this.toggle();
        },
    };
</script>

<style lang="scss" scoped>
    .radio {
        width: 100%;
        height: 29px;
        min-height: 29px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        position: relative;
        margin: 0;
        line-height: 20px;
        border-radius: 100%;

        .label {
            position: relative;
            padding-left: 7px;
            font-size: 14px;
            overflow: hidden;
            user-select: none;
            cursor: pointer;
        }

        .group {
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            box-sizing: border-box;
            position: relative;
            border-radius: 100%;
            cursor: pointer;

            input[type="radio"] {
                position: absolute;
                appearance: none;
                display: none;
                left: -999rem;
            }

            .marker {
                position: absolute;
                border-radius: 100%;
                box-sizing: border-box;
                border: 3px var(--application-input) solid;
                inset: 0;
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
