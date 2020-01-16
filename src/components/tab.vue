<template>
    <div id="tab" v-on:click="activate()" :class="active ? 'on' : 'off'">
        <span v-if="dirty">&bull; {{ title }}</span>
        <span v-else>{{ title }}</span>
    </div>
</template>

<script>

export default {
    name: "tab",

    props: {
        title: String,
        dirty: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: false
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

    methods: {
        activate() {
            if (!this.active) {
                this.$emit("activate");
            }
        }
    }
}
</script>

<style scoped>
    #tab {
        height: 31px;
        line-height: 32px;
        padding: 0 14px;
        box-sizing: border-box;
        border-bottom: 1px #424242 solid;
        font-size: 14px;
        user-select: none;
        cursor: pointer;
    }

    #tab.on {
        line-height: 32px;
        background: #262626;
        border-top: 1px #424242 solid;
        border-right: 1px #424242 solid;
        border-bottom: 0 none;
        border-left: 1px #424242 solid;
        border-radius: 2px 2px 0 0;
        color: #feb400;
    }
</style>