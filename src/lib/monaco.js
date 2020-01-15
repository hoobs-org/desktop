export default {
    name: "monaco",

    props: {
        value: {
            type: String,
            required: true
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
                    { token: "attribute.value.hex.css", foreground: "999999" },

                    { token: "variable", foreground: "FEB400" },
                    { token: "variable.parameter", foreground: "FEB400" },
                    { token: "metatag.content.html", foreground: "FEB400" },
                    { token: "key", foreground: "FEB400" },
                    { token: "string.key.json", foreground: "FEB400" },
                    { token: "attribute.name", foreground: "FEB400" },

                    { token: "meta.tag", foreground: "ED4F0E" },
                    { token: "string.value.json", foreground: "ED4F0E" },
                    { token: "attribute.value", foreground: "ED4F0E" },
                    { token: "string", foreground: "ED4F0E" },
                    { token: "keyword.json", foreground: "ED4F0E" },
                ],
                colors: {
                    "editor.background": "#00000000",
                    "editor.foreground": "#999999"
                }
            });

            this.editor = monaco.editor.create(this.$el, {
                value: this.value,
                theme: "hoobs",
                language: "json",
                wordWrap: "on",
                wrappingIndent: "indent",
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
                const value = this.editor.getValue();

                if (this.value !== value) {
                    this.$emit("change", value, event);
                }
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