<template>
    <modal width="490px" height="220px">
        <div class="content message">{{ options.message }}</div>
        <div class="actions modal">
            <div class="button primary" v-on:click="$dialog.close('alert')">{{ $t("ok") }}</div>
        </div>
    </modal>
</template>

<script>
    export default {
        name: "alert",

        props: {
            options: Object,
        },
    };
</script>
