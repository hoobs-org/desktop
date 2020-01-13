<template>
    <div id="help">
        <h1>Welcome to HOOBS</h1>
        <span>Pronounced as "huːbz"</span>
        <p>
            HOOBS a Homebridge stack with a interface that simplifies configuration and installing plugins.
        </p>
        <h2>Introduction</h2>
        <p>
            HOOBS goal is to make Homebridge more accessible to new inexperienced users and advanced users.
            To achieve this HOOBS aims to unify, simplify and make the Homebridge ecosystem more user-friendly.
            Starting with a standardized installation in the form of a free downloadable image file that can
            be easily written to an SD card. Up to the complete hardware solution which works out of the box.
        </p>
        <p>
            HOOBS combine hardware and operating system, with server service and user interface for easy
            installation of your favorite plugins and guide the user with manuals and assistance.
        </p>
        <h2>Documentation</h2>
        <p>
            <ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki')">Welcome</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/1.0-Community')">Community</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/1.1-News')">News</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.0-Getting-Started')">Getting Started</li>
                <ul>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.1-HOOBS-Box')">HOOBS Box</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.2-HOOBS-SD-Card')">HOOBS SD Card</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.3-Upgrading-HOOBS')">Upgrading HOOBS</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.4-Upgrading-Manually')">Upgrading Manually</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.5-Installing-from-Scratch')">Installing HOOBS</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/2.7-Remote-Access')">Remote Access</li>
                </ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.0-User-Interface')">User Interface</li>
                <ul>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.1-Administrator-Account')">Administrator Account</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.2-Status-Dashboard')">Status Dashboard</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.3-Accessories')">Accessories</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.4-Room-Layout')">Room Layout</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.5-Log')">Log</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.6-System')">System</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.7-Plugins')">Plugins</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.8-Configuration')">Configuration</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.9-User-Accounts')">User Accounts</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/3.10-Themes')">Themes</li>
                </ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/4.0-Plugins')">Plugins</li>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/5.0-Hardware')">Hardware</li>
                <ul>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/5.1-Certified-Hardware')">Certified Hardware</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/5.2-Certified-Accessories')">Certified Accessories</li>
                </ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/6.0-Developers')">Developers</li>
                <ul>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/6.1-Building')">Building</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/6.2-Command-Line-Interface')">Command Line</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/6.3-Architecture')">Architecture</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/6.4-API-Reference')">API Reference</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/6.5-Developing-Plugins')">Developing Plugins</li>
                </ul>
                <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/7.0-Legal')">Legal</li>
                <ul>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/7.1-Terms-and-Conditions')">Terms &amp; Conditions</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/7.2-Shipping-and-Taxes')">Shipping &amp; Taxes</li>
                    <li v-on:click="$browse('https://github.com/hoobs-org/HOOBS/wiki/7.3-Warranty')">Warranty</li>
                </ul>
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