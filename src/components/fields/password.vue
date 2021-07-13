<template>
    <div id="field" class="field">
        <span v-if="title" class="title" v-html="title"></span>
        <span v-else class="title" v-html="description || format(field)"></span>
        <span v-if="title && description && description !== ''" class="description" v-html="description"></span>
        <input
            :id="id || uuid"
            :ref="uuid"
            :name="name"
            type="password"
            autocomplete="false"
            data-lpignore="true"
            :value="value"
            :placeholder="placeholder"
            v-on:input="update"
            v-on:change="change"
            v-bind:required="required"
        />
    </div>
</template>

<script>
    import { decamel } from "../../services/schema";

    const INPUT_FOCUS_DELAY = 10;

    export default {
        name: "password-field",

        props: {
            id: {
                type: String,
                default: undefined,
            },
            name: String,
            field: [String, Number],
            title: String,
            description: String,
            placeholder: {
                type: String,
                default: "",
            },
            value: String,
            required: {
                type: Boolean,
                default: false,
            },
            autofocus: {
                type: Boolean,
                default: false,
            },
        },

        data() {
            return {
                uuid: "",
            };
        },

        mounted() {
            if (this.id === undefined || typeof String) {
                this.uuid = `password_field_${Math.random().toString(36).substring(2, 10)}`;
            } else {
                this.uuid = this.id;
            }

            if (this.autofocus) {
                setTimeout(() => {
                    if (this.$refs[this.uuid]) this.$refs[this.uuid].focus();
                }, INPUT_FOCUS_DELAY);
            }
        },

        methods: {
            format(value) {
                if (!Number.isNaN(parseInt(value, 10))) return "";
                if (!value || value === "") return value;

                return decamel(value);
            },

            update() {
                this.$emit("input", this.$refs[this.uuid].value);
            },

            change() {
                this.$emit("change", this.$refs[this.uuid].value);
            },
        },
    };
</script>

<style lang="scss" scoped>
    #field {
        display: flex;
        flex-direction: column;
        padding: 0 10px 20px 0;

        .title {
            font-size: 14px;
            overflow: hidden;
            margin: 0 0 7px 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        .description {
            font-size: 12px;
            margin: -7px 0 7px 0;
            user-select: none;

            &:empty {
                display: none;
            }
        }

        input {
            flex: 1;
            padding: 7px;
            font-size: 14px;

            &:focus {
                outline: 0 none;
            }

            &::placeholder {
                opacity: 0.5;
            }
        }
    }
</style>
