export default {
    name: "monaco",

    props: {
        value: {
            type: String,
            required: true,
        },
        theme: {
            type: String,
            default: "dark",
        },
        foreground: {
            type: String,
            default: "999999",
        },
        background: {
            type: String,
            default: "141414",
        },
    },

    model: {
        event: "change",
    },

    watch: {
        value(value) {
            if (this.editor && value !== this.editor.getValue()) this.editor.setValue(value);
        },
    },

    mounted() {
        const monaco = require("monaco-editor");

        this.monaco = monaco;

        this.init(monaco);
    },

    beforeDestroy() {
        if (this.watcher) this.watcher();

        this.editor && this.editor.dispose();
    },

    methods: {
        init(monaco) {
            this.$emit("mounting", this.monaco);

            monaco.editor.defineTheme("theme", {
                base: this.theme === "dark" ? "vs-dark" : "vs",
                inherit: true,
                colors: {
                    "editor.foreground": `#${this.foreground}`,
                    "editor.background": `#${this.background}`,
                },
                rules: [
                    { token: "", foreground: this.foreground, background: this.background },
                ],
            });

            this.editor = monaco.editor.create(this.$el, {
                value: this.value,
                theme: "theme",
                language: "json",
                wordWrap: "on",
                wrappingIndent: "indent",
                renderLineHighlight: "none",
                scrollBeyondLastLine: false,
                contextmenu: false,
                minimap: {
                    enabled: false,
                },
                scrollbar: {
                    useShadows: false,
                    horizontal: "hidden",
                    vertical: "hidden",
                },
                lineNumbers: false,
            });

            this.editor.onDidChangeModelContent((event) => {
                this.$emit("change", this.editor.getValue(), event);
            });

            this.watcher = this.$store.subscribe((mutation) => {
                if (mutation.type === "resizeWindow") {
                    this.resize();
                }
            });

            this.$emit("mounted", this.editor);
        },

        focus() {
            this.editor.focus();
        },

        resize() {
            this.editor.layout();
        },
    },

    render(h) {
        return h("div");
    },
};
