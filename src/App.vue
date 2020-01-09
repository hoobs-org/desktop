<template>
    <div id="app" class="hoobs-dark">
        <div v-on:click="title()" class="header">
            <div class="logo">
                <svg width="20" height="20" viewBox="0 0 80 80.92" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#feb400" d="M65.05,0H15A15.08,15.08,0,0,0,0,15.12V65.8A15.09,15.09,0,0,0,15,80.92h50.1A15.09,15.09,0,0,0,80,65.8V15.12A15.08,15.08,0,0,0,65.05,0Zm2,39.07a2.09,2.09,0,0,1-1.79,1.71,1.76,1.76,0,0,1-2.09-1c-.83-2.21-2.63-3.55-4.2-5.07a5.66,5.66,0,0,1-2-4.81c.09-1.24,0-2.49,0-3.73h0c0-1.66,0-3.32,0-5,0-1.5-.94-1.78-2.15-1.76s-2.64-.21-2.72,1.65c-.07,1.5,0,3-.06,4.51,0,.5.25,1.2-.23,1.44s-.83-.45-1.18-.78c-3.29-3.11-6.59-6.22-9.83-9.39-1-1-1.74-1-2.71,0Q27.51,27.79,16.75,38.57c-.94.94-1.07,1.7,0,2.57.24.19.44.44.66.65,1.41,1.4,1.62,1.36,3.13,0,4.68-4.35,9.08-9,13.63-13.48,1-.94,2-1.81,2.93-2.74a3.81,3.81,0,0,1,5.74,0c2,1.9,3.84,3.89,5.78,5.82C52.18,34.88,55.8,38.4,59.37,42c2.35,2.36,2.31,4.44,0,6.83-3.65,3.72-5.08,3.7-8.77,0-3.21-3.2-6.5-6.32-9.7-9.53-1-1-1.76-.91-2.71.06Q33,44.63,27.81,49.8c-.91.9-.91,1.65,0,2.48a13.05,13.05,0,0,1,1,1,1.48,1.48,0,0,0,2.48,0c1.82-1.83,3.7-3.59,5.55-5.38a4,4,0,0,1,5.9-.13q3.09,2.91,6.07,6a4,4,0,0,1,0,5.72c-1.36,1.47-2.82,2.87-4.23,4.3a8.46,8.46,0,0,0-2.22,2.92,1.84,1.84,0,0,1-2.1,1.23,2,2,0,0,1-1.84-1.63,2.09,2.09,0,0,1,1.09-2.5c2.93-1.4,4.61-4.19,6.94-6.26a1.08,1.08,0,0,0,0-1.75l-5.57-5.59c-.75-.75-1.43-.54-2.13.14-1.84,1.8-3.71,3.57-5.56,5.37a4,4,0,0,1-5.9.26c-.51-.43-1-.92-1.44-1.4-2.38-2.44-2.38-4.57,0-7Q31,42.31,36.22,37c2.22-2.23,4.32-2.25,6.57-.06l10.6,10.39c1.5,1.46,1.67,1.44,3.45-.37,1.51-1.54,1.53-1.76,0-3.25-5.21-5.21-10.46-10.39-15.65-15.62-.88-.89-1.58-.95-2.46-.07-2.41,2.4-4.84,4.77-7.27,7.16q-4.8,4.71-9.59,9.42a3.94,3.94,0,0,1-5.79.13c-3.81-3.46-4.75-5.29-.33-9.57,6.88-6.67,13.53-13.58,20.29-20.39,2.41-2.43,4.49-2.44,6.91-.07,1.65,1.62,3.35,3.2,5,4.81.68.66,1.15,1.07,1.51-.3a3.4,3.4,0,0,1,3-2.57,14.24,14.24,0,0,1,1.83-.21c4.28-.12,5.77,1.36,5.78,5.68,0,2.6,0,5.19,0,7.78a3.09,3.09,0,0,0,1.06,2.61c1.66,1.44,2.86,3.38,5,4.27A1.88,1.88,0,0,1,67.1,39.07Z" />
                </svg>
            </div>
        </div>
        <div class="chrome">
            <button v-on:click="$minimize()" class="title-button minimize"></button>
            <button v-on:click="$maximize()" class="title-button maximize"></button>
            <button v-on:click="$close()" class="title-button close"></button>
        </div>
        <div class="nav"></div>
        <div class="content">
            <router-view />
        </div>
    </div>
</template>

<script>
    export default {
        name: "app",

         data() {
            return {
                delay: 700,
                clicks: 0,
                timer: null
            }
        },

        methods: {
            title() {
                this.clicks += 1;

                if(this.clicks === 1) {
                    this.timer = setTimeout(() => {
                        this.clicks = 0
                    }, this.delay);
                } else {
                    clearTimeout(this.timer);  

                    this.$maximize();
                    this.clicks = 0;
                }         
            }      
        }
    }
</script>

<style>
    #app {
        font-family: "Avenir", Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
    }

    #nav {
        padding: 30px;
    }

    #nav a {
        font-weight: bold;
        color: #2c3e50;
    }

    #nav a.router-link-exact-active {
        color: #42b983;
    }
</style>

<style>
    @font-face {
        font-family: "Montserrat";
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local("Montserrat Regular"),
             local("Montserrat-Regular"),
             url(./assets/montserrat.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }

    @font-face {
        font-family: "Montserrat Black";
        font-style: normal;
        font-weight: 900;
        font-display: swap;
        src: local("Montserrat Black"),
             local("Montserrat-Black"),
             url(./assets/montserrat-black.woff2) format("woff2");
        unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
    }
      
    @font-face {
        font-family: "Material Icons";
        font-style: normal;
        font-weight: 400;
        src: url(./assets/material.eot);
        src: local("Material Icons"),
             local("MaterialIcons-Regular"),
             url(./assets/material.woff2) format('woff2'),
             url(./assets/material.woff) format('woff'),
             url(./assets/material.ttf) format('truetype');
}
</style>

<style>
    html,
    body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
        background: #262626;
    }

    .icon {
        font-family: "Material Icons";
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        font-feature-settings: "liga";
        -webkit-font-smoothing: antialiased;
    }

    .button,
    .button:link,
    .button:active,
    .button:visited {
        background: #1a1a1a;
        color: #fff !important;
        text-decoration: none !important;
        display: inline-block;
        border: 1px #333 solid;
        border-radius: 3px;
        padding: 10px;
        cursor: pointer;
        user-select: none;
        margin: 0 10px 0 0;
        white-space: pre;
    }

    .button-primary,
    .button-primary:link,
    .button-primary:active,
    .button-primary:visited {
        background: #feb400;
        color: #fff !important;
        border: 1px #feb400 solid;
    }

    .button-warning,
    .button-warning:link,
    .button-warning:active,
    .button-warning:visited {
        background: #e30505;
        color: #fff !important;
        border: 1px #e30505 solid;
    }

    .button:hover {
        box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.24),
                    0 2px 1px -1px rgba(0, 0, 0, 0.22),
                    0 1px 3px 1px rgba(0, 0, 0, 0.3);;
    }

    ::placeholder {
        color: #999;
    }

    .hidden-submit {
        width: 1px;
        height: 1px;
        overflow: hidden;
        opacity: 0;
        position: absolute;
    }

    .m-chckbox--container {
        margin: 0 !important;
    }

    .m-chckbox--container .m-chckbox--group {
        background-color: #444;
        border: 1px #333 solid;
    }

    .m-chckbox--container.active .m-chckbox--group {
        background-color: #feb400 !important;
        border: 1px #feb400 solid !important;
    }

    .m-chckbox--ripple {
        display: none !important;
    }

    .m-chckbox--label {
        padding-left: 7px !important;
    }

    #app {
        flex: 1;
        margin: 0;
        padding: 0;
        height: 100%;
        background: #262626;
        font-family: "Montserrat", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow: hidden;
        color: #999;
        display: flex;
        flex-direction: row;
    }

    #app a,
    #app a:link,
    #app a:active,
    #app a:visited {
        color: #feb400;
        text-decoration: none;
    }

    #app a:hover {
        text-decoration: underline;
    }

    #app .header {
        -webkit-app-region: drag;
        position: fixed;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        top: 0;
        left: 0;
        width: 100%;
        height: 37px;
        z-index: 500;
    }

    #app .header .logo {
        display: flex;
        align-content: center;
        align-items: center;
        margin: 0 0 0 9px;
        user-select: none;
    }

    #app .header .logo svg {
        margin: 0 3px 0 0;
        user-select: none;
    }

    #app .chrome {
        -webkit-app-region: no-drag;
        position: fixed;
        top: 10px;
        right: 14px;
        z-index: 1000;
    }

    #app .chrome .title-button {
        width: 12px;
        height: 12px;
        margin: 0 0 0 7px;
        border-radius: 6px;
        background: #cfcfcf;
        border: 1px #adadad solid;
        outline: 0 none !important;
        opacity: 0.5;
        padding: 0;
    }

    #app .chrome:hover .title-button.close {
        background: #e81a0c;
        border: 1px #e81a0c solid;
        opacity: 1;
    }

    #app .chrome:hover .title-button.minimize {
        background: #f7d216;
        border: 1px #f7d216 solid;
        opacity: 1;
    }

    #app .chrome:hover .title-button.maximize {
        background: #42b983;
        border: 1px #42b983 solid;
        opacity: 1;
    }

    #app .nav {
        min-width: 57px;
        padding: 0 0 15px 0;
        background: #262626;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        user-select: none;
        z-index: 100;
    }

    #app .nav .routes {
        min-width: 57px;
        display: flex;
        flex-direction: column;
        align-content: center;
        align-items: center;
    }

    #app .nav .action-seperator {
        width: 100%;
        height: 1px;
        margin: 10px 0 0 0;
        padding: 0 17px;
        box-sizing: border-box;
    }

    #app .nav .action-seperator div {
        background: #3d3d3d;
        height: 1px;
    }

    #app .nav a,
    #app .nav a:link,
    #app .nav a:active,
    #app .nav a:visited,
    #app .nav .action-link {
        color: #bababa;
        text-decoration: none;
        margin-top: 15px;
        width: 100%;
        text-align: left;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: flex-start;
        cursor: pointer;
    }

    #app .nav a:hover,
    #app .nav .action-link:hover {
        color: #fff !important;
        text-decoration: none;
    }

    #app .nav .route-link {
        font-size: 17px;
        margin: 0 24px 0 -6px;
    }

    #app .nav .icon {
        margin: 0 16px;
    }

    #app .nav .route-link-on,
    #app .nav .icon-on,
    #app .nav .route-link-on:hover,
    #app .nav .icon-on:hover {
        color: #feb400 !important;
    }

    #app .nav .icon svg {
        width: 24px;
        height: 24px;
    }

    #app .content {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        font-size: 12pt;
    }
</style>
