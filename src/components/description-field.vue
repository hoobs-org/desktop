<template>
    <div id="description-field" :class="theme">
        <span class="title">{{ name }}</span>
        <span v-if="description && description !== ''" class="description">{{ description }}</span>
        <textarea ref="field" autocomplete="false" :value="value" @input="update()" @change="change" v-bind:required="required"></textarea>
    </div>
</template>

<script>
    export default {
        name: "description-field",
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
    #description-field {
        display: flex;
        flex-direction: column;
        padding: 0 0 20px 0;
        text-align: left;
    }

    #description-field.dark .title {
        font-weight: bold;
        font-size: 14px;
        color: #feb400;
        user-select: none;
        cursor: default;
    }

    #description-field.light .title {
        font-weight: bold;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #description-field .description {
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #description-field.dark textarea {
        flex: 1;
        min-height: 107px;
        padding: 7px;
        font-size: 14px;
        background: #444;
        color: #fff;
        border: 1px #333 solid;
        border-radius: 5px;
        resize: none;
    }

    #description-field.dark textarea:focus {
        outline: 0 none;
        border-color: #feb400;
    }

    #description-field.light textarea {
        flex: 1;
        min-height: 107px;
        padding: 7px;
        font-size: 14px;
        background: #444;
        color: #fff;
        border: 1px #333 solid;
        border-radius: 5px;
        resize: none;
    }

    #description-field.light textarea:focus {
        outline: 0 none;
        border-color: #feb400;
    }
</style>
