<template>
    <div id="confirm">
        <div v-if="!confirming && !icon" class="button" v-on:click="start()">{{ value }}</div>
        <div v-if="!confirming && icon" :title="value" class="icon" v-on:click="start()">{{ icon }}</div>
        <div v-if="confirming && title" class="title">{{ title }}</div>
        <div v-if="confirming" class="button" v-on:click="cancel()">{{ $t("cancel") }}</div>
        <div v-if="confirming" class="button button-warning" v-on:click="confirm()">{{ $t("confirm") }}</div>
    </div>
</template>

<script>
    export default {
        name: "confirm",

        props: {
            value: String,
            icon: String,
            title: String
        },

        data() {
            return {
                confirming: false
            };
        },

        methods: {
            start() {
                this.confirming = true;
                this.$emit("start");
            },

            cancel() {
                this.confirming = false;
                this.$emit("cancel");
            },

            confirm() {
                this.confirming = false;
                this.$emit("confirm");
            }
        }
    };
</script>

<style scoped>
    #confirm {
        display: flex;
        flex-direction: row;
        align-content: center;
        align-items: center;
    }

    #confirm .button {
        margin: 0 0 0 10px;
    }

    #confirm .icon {
        margin: 0 0 0 7px;
        font-size: 18px;
        cursor: pointer;
    }

    #confirm .icon:hover {
        color: #fff;
    }

    #confirm .title {
        display: inline;
        font-size: 14px;
    }

    @media (min-width: 300px) and (max-width: 915px) {
        #confirm .title {
            display: none;
        }
    }
</style>
