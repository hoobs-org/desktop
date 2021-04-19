<template>
    <div>
        <video ref="videoPlayer" class="video-js"></video>
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
                autoplay: "play",
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
        border-radius: 7px;

        .vjs-tech {
            border-radius: 7px;
        }

        .vjs-big-play-button {
            width: 100%;
            height: 100%;
            background: transparent;
            top: 0;
            left: 0;
            border: 0 none;
            justify-content: space-around;
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

        .vjs-control-bar {
            background: transparent;
            transition: unset;
        }
    }
</style>
