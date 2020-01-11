<template>
    <div id="modal">
        <div class="modal-inner" :style="`width: ${width}; height: ${height};`">
            <div v-if="title" class="modal-header">{{ title }}</div>
            <div class="modal-content">
                <slot />
            </div>
            <div class="modal-footer">
                <div v-if="cancelAction" class="button" v-on:click="cancelAction()">{{ cancelTitle }}</div>
                <div v-if="okAction" class="button button-primary" v-on:click="okAction()">{{ okTitle }}</div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "modal",

        props: {
            width: {
                type: String,
                default: "auto"
            },
            height: {
                type: String,
                default: "auto"
            },
            "ok-title": {
                type: String,
                default: "OK"
            },
            "cancel-title": {
                type: String,
                default: "Cancel"
            },
            title: String,
            "ok-action": Function,
            "cancel-action": Function
        }
    };
</script>

<style scoped>
    #modal {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 300;
        position: absolute;
        display: flex;
        align-content: center;
        align-items: center;
        background: #262626b8;
    }

    #modal .modal-inner {
        display: inline;
        margin: 0 auto 10% auto;
        max-height: 65%;
        background: #fff;
        color: #515151;
        display: flex;
        flex-direction: column;
        border-radius: 3px;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12);
    }

    #modal .modal-header {
        padding: 10px 10px 0 10px;
        font-size: 14px;
        font-weight: bold;
        text-align: left;
    }

    #modal .modal-content {
        flex: 1;
        padding: 20px;
        overflow: auto;
    }

    #modal .modal-footer {
        display: flex;
        justify-content: flex-end;
        padding: 0 10px 20px 20px;
    }

    #modal .button {
        background: #fff;
        color: #777 !important;
        border: 1px #e5e5e5 solid;
    }

    #modal .button-primary {
        background: #feb400;
        color: #fff !important;
        border: 1px #feb400 solid;
    }
</style>
