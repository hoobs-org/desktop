<template>
    <div id="dropdown">
        <slot />
    </div>
</template>

<script>
    export default {
        name: "dropdown"
    };
</script>

<style scoped>
    #dropdown {
        background: #fff;
        border-radius: 3px;
        max-height: 400px;
        overflow: auto;
        padding: 3px 0;
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12);
    }

    #dropdown .item,
    #dropdown .item:link,
    #dropdown .item:active,
    #dropdown .item:visited {
        padding: 5px 20px;
        color: #515151;
        font-size: 14px;
        text-align: left;
        display: block;
        text-decoration: none;
        cursor: pointer;
        user-select: none;
    }

    #dropdown .item:hover {
        background: #f1f1f1;
        text-decoration: none;
        color: #000;
    }

    #dropdown .disabled {
        padding: 10px 20px;
        cursor: default;
        user-select: none;
        opacity: 0.4;
    }

    #dropdown .seperator {
        height: 1px;
        margin: 0 10px;
        background: #e5e5e5;
    }
</style>
