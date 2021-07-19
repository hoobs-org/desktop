<!-------------------------------------------------------------------------------------------------
 | hoobs-desktop                                                                                  |
 | Copyright (C) 2020 HOOBS                                                                       |
 |                                                                                                |
 | This program is free software: you can redistribute it and/or modify                           |
 | it under the terms of the GNU General Public License as published by                           |
 | the Free Software Foundation, either version 3 of the License, or                              |
 | (at your option) any later version.                                                            |
 |                                                                                                |
 | This program is distributed in the hope that it will be useful,                                |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of                                 |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  |
 | GNU General Public License for more details.                                                   |
 |                                                                                                |
 | You should have received a copy of the GNU General Public License                              |
 | along with this program.  If not, see <http://www.gnu.org/licenses/>.                          |
 -------------------------------------------------------------------------------------------------->

<template>
    <div>
        <video ref="videoPlayer" class="video-js vjs-theme-hoobs"></video>
    </div>
</template>

<script>
    import Video from "video.js";
    import "video.js/dist/video-js.css";

    export default {
        name: "player",

        props: {
            source: {
                type: String,
                require: true,
            },
        },

        data() {
            return {
                player: null,
            };
        },

        mounted() {
            this.player = Video(this.$refs.videoPlayer, {
                liveui: true,
                autoplay: true,
                controls: true,
                sources: [
                    {
                        src: this.source,
                        type: "video/mp4",
                    },
                ],
            });
        },

        beforeDestroy() {
            if (this.player) this.player.dispose();
        },
    };
</script>

<style lang="scss">
    .video-js {
        width: 100%;
        height: 100%;
        outline: 0 none !important;

        .vjs-tech {
            outline: 0 none !important;
        }

        .vjs-big-play-button {
            width: 100%;
            height: 100%;
            background: transparent;
            top: 0;
            left: 0;
            border: 0 none;
            border-radius: 0;
            justify-content: space-around;
            outline: 0 none !important;
            align-items: center;
            align-content: center;
        }

        .vjs-icon-placeholder:before {
            position: unset !important;
            top: unset !important;
            left: unset !important;
            width: unset !important;
            height: unset !important;
        }

        .vjs-volume-panel,
        .vjs-live-control,
        .vjs-remaining-time,
        .vjs-picture-in-picture-control {
            display: none !important;
        }
    }

    @keyframes vjs-spinner-fade {
        0% {
            border-top-color: #adadad;
        }

        20% {
            border-top-color: #adadad;
        }

        35% {
            border-top-color: white;
        }

        60% {
            border-top-color: #adadad;
        }

        100% {
            border-top-color: #adadad;
        }
    }

    @-webkit-keyframes vjs-spinner-fade {
        0% {
            border-top-color: #adadad;
        }

        20% {
            border-top-color: #adadad;
        }

        35% {
            border-top-color: white;
        }

        60% {
            border-top-color: #adadad;
        }

        100% {
            border-top-color: #adadad;
        }
    }

    .vjs-theme-hoobs {
        .vjs-control-bar {
            height: 60px;
            padding-top: 15px;
            background: none;
            background-image: linear-gradient(0deg, #000, transparent);
        }

        .vjs-button > .vjs-icon-placeholder:before {
            line-height: 50px;
        }

        .vjs-play-progress:before {
            display: none;
        }

        .vjs-progress-control {
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 20px;
        }

        .vjs-progress-control .vjs-progress-holder {
            position: absolute;
            top: 20px;
            right: 0;
            left: 0;
            width: 100%;
            margin: 0;
        }

        .vjs-play-progress {
            background-color: var(--application-highlight);
        }

        .vjs-load-progress {
            background-color: #ffffffc5;
        }

        .vjs-remaining-time {
            order: 1;
            line-height: 50px;
            flex: 3;
            text-align: left;
        }

        .vjs-play-control {
            order: 2;
            flex: 8;
            font-size: 1em;
            text-align: unset;
            margin-left: 7px;
        }

        .vjs-fullscreen-control,
        .vjs-picture-in-picture-control,
        .vjs-volume-panel {
            order: 3;
            flex: 1;
            text-align: right;
            margin-right: 7px;
        }

        .vjs-volume-panel:hover .vjs-volume-control.vjs-volume-horizontal {
            height: 100%;
        }

        .vjs-mute-control {
            display: none;
        }

        .vjs-volume-panel {
            margin-left: 0.5em;
            margin-right: 0.5em;
            padding-top: 1.5em;
        }

        .vjs-volume-bar.vjs-slider-horizontal,
        .vjs-volume-panel,
        .vjs-volume-panel.vjs-volume-panel-horizontal:hover,
        .vjs-volume-panel:active .vjs-volume-control.vjs-volume-horizontal,
        .vjs-volume-panel:focus .vjs-volume-control.vjs-volume-horizontal,
        .vjs-volume-panel:hover,
        .vjs-volume-panel:hover .vjs-volume-control.vjs-volume-horizontal {
            width: 3em;
        }

        .vjs-volume-level:before {
            font-size: 1em;
        }

        .vjs-volume-panel .vjs-volume-control {
            opacity: 1;
            width: 100%;
            height: 100%;
        }

        .vjs-volume-bar {
            background-color: transparent;
            margin: 0;
        }

        .vjs-slider-horizontal .vjs-volume-level {
            height: 100%;
        }

        .vjs-volume-bar.vjs-slider-horizontal {
            margin-top: 0;
            margin-bottom: 0;
            height: 100%;
        }

        .vjs-volume-bar:before {
            content: "";
            z-index: 0;
            width: 0;
            height: 0;
            position: absolute;
            top: 0;
            left: 0;
            border-color: transparent transparent hsla(0, 0%, 100%, 0.25);
            border-style: solid;
            border-width: 0 0 1.75em 3em;
        }

        .vjs-volume-level {
            overflow: hidden;
            background-color: transparent;
        }

        .vjs-volume-level:before {
            content: "";
            z-index: 1;
            width: 0;
            height: 0;
            position: absolute;
            top: 0;
            left: 0;
            border-left: 3em solid transparent;
            border-bottom: 1.75em solid var(#fff);
            border-right: 0 solid transparent;
            border-top: 0 solid transparent;
        }
    }
</style>
