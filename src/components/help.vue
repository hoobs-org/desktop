<template>
    <div id="help">
        <h1>Welcome to HOOBS</h1>
        <span>Pronounced as "huːbz"</span>
        <p>
            HOOBS is an ecosystem that aims to unify and simplfy the "Smart Home". We beilive that you should
            be able to use the devices you want, and not be locked into one provider's solution. If you want
            to use Google Home for your voice control and Apple Home for your routines, go ahead, HOOBS will
            make tht happen for you. HOOBS can connect your devices togeather by the use of plugins. HOOBS has
            "Certified Plugins", and it supports Homebridge plugins. This means you have over 1,000 choices
            when it comes to your Smart Home tech.
        </p>
        <h2>Documentation</h2>
        <p>
            <ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/1.0-Community')">Community</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.0-Getting-Started')">Getting Started</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.0-User-Interface')">User Interface</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/4.0-Plugins')">Plugins</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/5.0-Hardware')">Hardware</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/7.0-Legal')">Legal</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/8.0-Credits')">Credits</li>
            </ul>
        </p>
    </div>
</template>

<script>
    export default {
        name: "help"
    }
</script>

<style scoped>
    #help {
        text-align: left;
        font-size: 12px;
        user-select: none;
        cursor: default;
    }

    #help h1 {
        margin: 0 0 7px 0;
        padding: 0 0 7px 0;
        line-height: normal;
        font-size: 20px;
        color: #feb400;
        border-bottom: 1px #e5e5e5 solid;
    }

    #help h2 {
        margin: 20px 0 0 0;
        padding: 0;
        line-height: normal;
        font-size: 18px;
    }

    #help ul {
        margin: 0 0 0 7px;
        padding: 0 0 0 1em;
        list-style: none;
    }

    #help ul li {
        padding: 3px 0;
        font-size: 12px;
        font-weight: bold;
        color: #feb400;
        cursor: pointer;
    }

    #help ul li:hover {
        text-decoration: underline;
    }
</style>