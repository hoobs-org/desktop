export default {
    name: "monaco",

    props: {
        value: {
            type: String,
            required: true
        },
        theme: {
            type: String,
            default: "hoobs"
        }
    },

    model: {
        event: "change"
    },

    watch: {
        value(value) {
            if (this.editor) {
                if (value !== this.editor.getValue()) {
                    this.editor.setValue(value);
                }
            }
        }
    },

    mounted() {
        const monaco = require("monaco-editor");

        this.monaco = monaco;

        this.init(monaco);
    },

    beforeDestroy() {
        window.removeEventListener("resize", this.resize);

        this.editor && this.editor.dispose();
    },

    methods: {
        init(monaco) {
            this.$emit("mounting", this.monaco);

            monaco.editor.defineTheme("hoobs", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "", foreground: "999999", background: "262626" },
                    { token: "attribute.value.hex.css", foreground: "999999" }
                ],
                colors: {
                    "editor.background": "#262626",
                    "editor.foreground": "#999999"
                }
            });

            monaco.editor.defineTheme("hoobs-field", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "", foreground: "FFFFFF", background: "444444" },
                    { token: "attribute.value.hex.css", foreground: "FFFFFF" }
                ],
                colors: {
                    "editor.background": "#444444",
                    "editor.foreground": "#FFFFFF"
                }
            });

            this.editor = monaco.editor.create(this.$el, {
                value: this.value,
                theme: this.theme,
                language: "json",
                wordWrap: "on",
                wrappingIndent: "indent",
                renderLineHighlight: "none",
                scrollBeyondLastLine: false,
                contextmenu: false,
                minimap: {
                    enabled: false
                },
                scrollbar: {
                    useShadows: false,
                    horizontal: "hidden",
                    vertical: "hidden"
                },
                lineNumbers: false
            });

            this.editor.onDidChangeModelContent(event => {
                this.$emit("change", this.editor.getValue(), event);
            })

            window.addEventListener("resize", this.resize);

            this.$emit("mounted", this.editor);
        },

        focus() {
            this.editor.focus();
        },

        resize() {
            this.editor.layout();
        }
    },

    render(h) {
        return h("div");
    }
}