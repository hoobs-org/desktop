<template>
    <div id="etcher">
        <div class="actions">
            <div v-on:click="$router.back()" title="Back" class="icon">arrow_back</div>
        </div>
        <div class="flow">
            
        </div>
    </div>
</template>

<script>
    export default {
        name: "etcher"
    }
</script>

<style scoped>
    #etcher {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 7px 20px 20px 20px;
        overflow: hidden;
    }

    #etcher .actions {
        display: flex;
        flex-direction: row;
        padding: 0 0 10px 0;
        margin: 0 0 10px 0;
        border-bottom: 1px #424242 solid;
    }

    #etcher .actions .icon {
        font-size: 18px;
        margin: 0 7px 0 0;
        cursor: pointer;
    }

    #etcher .actions .icon:hover {
        color: #fff;
    }

    #etcher .actions .action-seperator {
        display: inline;
        margin: 0 7px 0 0;
        border-right: 1px #5e5e5e solid;
        cursor: default;
    }

    #etcher .flow {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 3px 3px 3px;
        overflow: auto;
    }
</style>