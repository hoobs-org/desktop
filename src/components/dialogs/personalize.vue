<template>
    <modal :title="$t('personalize')" :draggable="true" width="760px" height="687px">
        <div id="personalize">
            <div v-if="!loading" class="content">
                <div class="form">
                    <div class="row title">{{ $t("login_image") }}</div>
                    <div class="row">
                        <div class="backdrop" :style="`background-color: ${working.application.background}; background-image: ${backdrop};`">
                            <div class="display dark" :style="`background: ${working.application.background}; box-shadow: ${working.elevation.default};`">
                                <div v-if="!updating" class="title" :style="`color: ${working.application.highlight};`">{{ $t("title") }}</div>
                                <div v-if="!updating" class="accent" :style="`color: ${working.application.accent};`">{{ $t("accent") }}</div>
                                <div v-if="!updating" class="text" :style="`color: ${working.application.text.default};`">{{ $t("text") }}</div>
                            </div>
                            <div
                                class="display light"
                                :style="`background: ${working.modal.background}; backdrop-filter: ${working.transparency}; box-shadow: ${working.elevation.default}; border-top: 4px ${working.modal.highlight} solid;`"
                            >
                                <div v-if="!updating" class="title" :style="`color: ${working.modal.highlight};`">{{ $t("title") }}</div>
                                <div v-if="!updating" class="text" :style="`color: ${working.modal.text.default};`">{{ $t("text") }}</div>
                            </div>
                            <div class="display navigation" :style="`background: ${working.navigation.background};`">
                                <icon v-if="!updating" name="view-dashboard" class="icon" :style="`color: ${working.navigation.highlight};`" />
                                <icon v-if="!updating" name="lightbulb-on" class="icon" :style="`color: ${working.navigation.text.default};`" />
                                <icon v-if="!updating" name="text-box" class="icon" :style="`color: ${working.navigation.text.default};`" />
                                <icon v-if="!updating" name="layers" class="icon" :style="`color: ${working.navigation.text.default};`" />
                                <icon v-if="!updating" name="puzzle" class="icon" :style="`color: ${working.navigation.text.default};`" />
                            </div>
                        </div>
                        <div class="backdrops">
                            <div class="row">
                                <backdrop image="default.jpg" v-model="backdrop" />
                                <backdrop image="amber.jpg" v-model="backdrop" />
                            </div>
                            <div class="row">
                                <backdrop image="purple.jpg" v-model="backdrop" />
                                <backdrop image="pink.jpg" v-model="backdrop" />
                            </div>
                            <div class="row">
                                <backdrop image="teal.jpg" v-model="backdrop" />
                                <backdrop image="green.jpg" v-model="backdrop" />
                            </div>
                            <div class="row">
                                <backdrop image="red.jpg" v-model="backdrop" />
                                <div v-on:click="$refs.backdrop.click();" class="add">
                                    <input type="file" ref="backdrop" v-on:change="upload()" accept="image/*" hidden />
                                    <icon name="plus" class="icon" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row title" style="margin-top: 20px;">{{ $t("mode") }}</div>
                    <div class="row">
                        <radio id="light" name="mode" :title="$t('light')" v-model="mode" value="light" />
                    </div>
                    <div class="row">
                        <radio id="dark" name="mode" :title="$t('dark')" v-model="mode" value="dark" />
                    </div>
                    <div class="row title" style="margin-top: 20px;">{{ $t("color") }}</div>
                    <div class="row auto">
                        <checkbox id="auto" :title="$t('automatically_set')" v-model="auto" />
                    </div>
                    <div v-on:click="() => { auto = false; }" class="row colors">
                        <color v-for="(color, index) in colors" :key="`color:${index}`" v-model="highlight" :color="color" />
                    </div>
                </div>
            </div>
            <div v-else class="loading">
                <spinner v-model="message" />
            </div>
            <div class="actions modal">
                <div class="button" v-on:click="$dialog.close('personalize')">{{ $t("cancel") }}</div>
                <div v-if="!loading" class="button primary" v-on:click="save()">{{ $t("apply") }}</div>
            </div>
        </div>
    </modal>
</template>

<script>
    import ColorScheme from "color-scheme";
    import ColorExtractor from "colorthief/dist/color-thief";

    import ColorComponent from "@/components/elements/color.vue";
    import BackdropComponent from "@/components/elements/backdrop.vue";

    import Colors from "@/services/colors";

    export default {
        name: "personalize",

        components: {
            "color": ColorComponent,
            "backdrop": BackdropComponent,
        },

        data() {
            return {
                loading: true,
                updating: false,
                auto: false,
                colors: Colors,
                message: "",
                backdrop: "",
                highlight: "",
                original: {},
                working: {},
                mode: "",
            };
        },

        async mounted() {
            this.loading = true;

            this.original = await this.$hoobs.theme.get(this.$store.state.theme);
            this.working = JSON.parse(JSON.stringify(this.original));

            this.auto = this.working.auto;
            this.mode = this.working.mode;

            this.backdrop = this.working.backdrop;
            this.highlight = this.working.auto ? "auto" : this.working.application.highlight;

            if (this.auto) await this.extract();

            this.loading = false;
        },

        watch: {
            highlight(_updated, current) {
                if (current && current !== "" && !this.loading && this.highlight !== "auto") this.adjust(this.highlight);
            },

            async mode(_updated, current) {
                if (current && current !== "" && !this.loading && !this.updating) {
                    this.updating = true;

                    const { backdrop } = this.working;
                    const { auto } = this.working;

                    this.original = await this.$hoobs.theme.get(this.mode);
                    this.working = JSON.parse(JSON.stringify(this.original));

                    this.working.backdrop = backdrop;
                    this.working.auto = auto;

                    this.highlight = this.working.auto ? "auto" : this.working.application.highlight;

                    if (this.auto) await this.extract();
                    if (!this.auto) this.adjust(this.highlight);

                    this.updating = false;
                    this.dirty();
                }
            },

            async backdrop(_updated, current) {
                if (current && current !== "") {
                    this.working.backdrop = this.backdrop;

                    if (!this.loading && this.auto) await this.extract();
                    if (!this.loading) this.dirty();
                }
            },

            async auto() {
                if (!this.loading) await this.extract();
            },
        },

        methods: {
            async save() {
                this.loading = true;

                if (this.working.name !== "light" && this.working.name !== "dark") await this.$hoobs.theme.save(this.working.display, this.working);

                this.$theme.set(this.working.name);
                this.$dialog.close("personalize");
                this.$action.emit("personalize", "update");
            },

            dirty() {
                if (JSON.stringify(this.working) !== JSON.stringify(this.original)) {
                    this.working.name = "custom";
                    this.working.display = "Custom";

                    return true;
                }

                return false;
            },

            contrast(value) {
                const scheme = new ColorScheme();

                scheme.from_hex(value.replace("#", "").toUpperCase());
                scheme.scheme("contrast");
                scheme.variation("hard");

                return `#${scheme.colors()[0]}`;
            },

            analogic(value) {
                const scheme = new ColorScheme();

                scheme.from_hex(value.replace("#", "").toUpperCase());
                scheme.scheme("analogic");
                scheme.variation("hard");

                return `#${scheme.colors()[7]}`;
            },

            tetrade(value) {
                const scheme = new ColorScheme();

                scheme.from_hex(value.replace("#", "").toUpperCase());
                scheme.scheme("tetrade");
                scheme.variation("hard");

                return `#${scheme.colors()[5]}`;
            },

            adjust(value) {
                const color = value.toLowerCase();

                this.working.application.highlight = color;
                this.working.application.accent = this.mode === "light" ? this.tetrade(color) : this.analogic(color);
                this.working.button.primary.background = color;
                this.working.button.primary.border = color;
                this.working.modal.highlight = color;
                this.working.widget.highlight = color;
                this.working.navigation.text.active = color;
                this.working.navigation.highlight = color;

                this.dirty();
            },

            extract() {
                return new Promise((resolve) => {
                    if (this.auto) {
                        const extractor = new ColorExtractor();
                        const element = document.createElement("img");

                        element.src = this.backdrop.replace("url('", "").replace("')", "");
                        element.crossOrigin = "Anonymous";
                        element.style.display = "none";

                        element.addEventListener("load", () => {
                            const color = extractor.getColor(element).map((item) => item.toString(16)).map((item) => (item.length === 1 ? `0${item}` : item)).join("");
                            const scheme = new ColorScheme();

                            scheme.from_hex(color.replace("#", "").toUpperCase());
                            scheme.scheme("triade");
                            scheme.variation("soft");

                            element.remove();

                            const accent = `#${scheme.colors()[0]}`;
                            const highlight = this.contrast(`#${scheme.colors()[0]}`);

                            this.working.auto = true;
                            this.highlight = "auto";

                            this.working.application.highlight = highlight;
                            this.working.application.accent = accent;
                            this.working.button.primary.background = highlight;
                            this.working.button.primary.border = highlight;
                            this.working.modal.highlight = highlight;
                            this.working.widget.highlight = highlight;
                            this.working.navigation.text.active = highlight;
                            this.working.navigation.highlight = highlight;

                            this.dirty();

                            resolve();
                        });

                        element.addEventListener("error", () => {
                            element.remove();

                            this.auto = false;

                            resolve();
                        });

                        document.body.appendChild(element);
                    } else {
                        this.working.auto = false;

                        resolve();
                    }
                });
            },

            async upload() {
                this.loading = true;
                this.message = this.$t("uploading_image");
                this.backdrop = `url('${this.$hoobs.config.host.get("themes")}/${(await this.$hoobs.theme.backdrop(this.$refs.backdrop.files[0]))}')`;
                this.loading = false;
            },
        },
    };
</script>

<style lang="scss" scoped>
    #personalize {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin: 0 0 0 10px;

        .auto {
            margin: 0 0 7px 0;
        }

        .backdrop {
            width: 470px;
            height: 263px;
            position: relative;
            background-repeat: no-repeat;
            background-position: center center;
            background-size: cover;
            box-sizing: border-box;
            user-select: none;

            .display {
                position: absolute;
                width: 150px;
                height: 200px;
                box-sizing: border-box;

                &.light {
                    top: 14px;
                    right: 14px;
                    padding: 10px;
                }

                &.dark {
                    top: 47px;
                    right: 114px;
                    padding: 10px;
                }

                .title {
                    font-size: 14px;
                }

                .accent {
                    font-size: 12px;
                }

                .text {
                    font-size: 12px;
                }

                &.navigation {
                    top: 0;
                    left: 0;
                    width: 20px;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    .icon {
                        height: 12px;
                        margin: 10px 0 0 0;
                        box-sizing: border-box;
                    }
                }
            }
        }

        .backdrops {
            flex: 1;
            margin: 0 0 0 10px;

            .row {
                height: 59px;
                margin: 0 0 9px 0;

                &:last-child {
                    margin: 0;
                }
            }

            .add {
                width: 104px;
                height: 59px;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: space-around;
                border: var(--modal-border) 1px solid;
                box-sizing: border-box;
                user-select: none;
                cursor: pointer;

                &:hover {
                    border: var(--modal-highlight) 1px solid;
                }

                .icon {
                    color: var(--modal-border);
                }
            }
        }

        .colors {
            display: flex;
            flex-wrap: wrap;

            .row {
                height: 34px;
                margin: 0 0 7px 0;

                &:last-child {
                    margin: 0;
                }
            }
        }
    }
</style>
