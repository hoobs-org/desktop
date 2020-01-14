<template>
    <div id="chckbox" :class="[classes, this.theme]">
        <div class="group" v-on:click.stop="toggle()">
            <div class="check" v-if="state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
            </div>
            <div class="ripple">
                <input type="checkbox" :id="id" :name="name" :value="value" :disabled="disabled" :required="required" :checked="state">
            </div>
        </div>
        <label class="label" v-on:click.stop :for="id">
            <slot/>
        </label>
    </div>  
</template>

<script>

export default {
    name: "checkbox",

    model: {
        prop: "model",
        event: "change"
    },

    props: {
        model: [Boolean, Array],
        checked: Boolean,
        value: [String, Boolean, Number, Object, Array, Function],
        name: String,
        required: Boolean,
        disabled: Boolean,
        theme: {
            type: String,
            default: "dark"
        }
    },

    data() {
        return {
            id: "",
            last: this.model
        }
    },

    watch: {
        checked(value) {
            if (value !== this.state) {
                this.toggle();
            }
        },

        model(value) {
            this.last = value;
        }
    },

    computed: {
        state() {
            if (Array.isArray(this.model)) {
                return this.model.indexOf(this.value) !== -1;
            }

            return this.model || Boolean(this.last);
        },

        classes() {
            return {
                "disabled": this.disabled,
                "active": this.state
            };
        }
    },

    mounted() {
        this.id = `checkbox_${Math.random().toString(36).substring(2,10)}`;

        if (this.checked && !this.checkboxState) {
            this.toggle();
        }
    },

    methods: {
        toggle() {
            if(this.disabled) {
                return;
            }

            let value = this.model || this.last

            if (Array.isArray(value)) {
                const i = value.indexOf(this.value);

                if (i === -1) {
                    value.push(this.value);
                } else {
                    value.splice(i, 1);
                }
            } else {
                value = !value;
            }

            this.last = value;

            this.$emit("change", value, this.value);
        }
    }
}
</script>

<style scoped>
    #chckbox {
        box-sizing: border-box;
        display: inline-flex;
        position: relative;
        margin: 0;
        width: 100%;
        height: 14px;
        min-height: 14px;
        cursor: pointer;
        align-items: center;
    }

    #chckbox .label {
        position: relative;
        padding-left: 7px;
        user-select: none;
        cursor: pointer;
    }

    #chckbox .group {
        box-sizing: border-box;
        position: relative;
        border-radius: 2px;
        height: 14px;
        width: 14px;
    }

    #chckbox.dark .group {
        background-color: #444;
        border: 1px #333 solid;
    }

    #chckbox.light .group {
        background-color: #fff !important;
        border: 1px #e5e5e5 solid !important;
    }

    #chckbox .group input[type=checkbox] {
        position: absolute;
        -webkit-appearance: none;
        appearance: none;
        left: -999rem;
    }

    #chckbox.active .group {
        background-color: #feb400 !important;
        border: 1px #feb400 solid !important;
    }

    #chckbox .group .check {
        height: 13px;
        width: 13px;
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
    }

    #chckbox .group .check svg {
        height: 13px;
        width: 12px;
    }

    #chckbox.disabled {
        cursor: not-allowed;
    }

    #chckbox.disabled .group {
        opacity: .14;
    }

    #chckbox.disabled .label {
        opacity: .24;
        cursor: not-allowed;
    }

    #chckbox .ripple {
        display: none !important;
    }
</style>