/**************************************************************************************************
 * hoobs-desktop                                                                                  *
 * Copyright (C) 2020 HOOBS                                                                       *
 *                                                                                                *
 * This program is free software: you can redistribute it and/or modify                           *
 * it under the terms of the GNU General Public License as published by                           *
 * the Free Software Foundation, either version 3 of the License, or                              *
 * (at your option) any later version.                                                            *
 *                                                                                                *
 * This program is distributed in the hope that it will be useful,                                *
 * but WITHOUT ANY WARRANTY; without even the implied warranty of                                 *
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                                  *
 * GNU General Public License for more details.                                                   *
 *                                                                                                *
 * You should have received a copy of the GNU General Public License                              *
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.                          *
 **************************************************************************************************/

export default {
    name: "monaco",

    props: {
        value: { type: String, required: true },
        theme: { type: String, default: "dark" },
        foreground: { type: String, default: "999999" },
        background: { type: String, default: "141414" },
    },

    model: { event: "change" },

    watch: {
        value(value) {
            if (this.editor && value !== this.editor.getValue()) this.editor.setValue(value);
        },
    },

    mounted() {
        this.monaco = require("monaco-editor");
        this.init(this.monaco);
    },

    beforeDestroy() {
        this.$action.off("window", "resize");
        this.editor && this.editor.dispose();
    },

    methods: {
        init(monaco) {
            this.$emit("mounting", this.monaco);

            monaco.editor.defineTheme("theme", {
                base: this.theme === "dark" ? "vs-dark" : "vs",
                inherit: true,
                colors: { "editor.foreground": `#${this.foreground}`, "editor.background": `#${this.background}` },
                rules: [{ token: "", foreground: this.foreground, background: this.background }],
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
                minimap: { enabled: false },
                scrollbar: { useShadows: false, horizontal: "hidden", vertical: "hidden" },
                lineNumbers: false,
            });

            this.editor.onDidChangeModelContent((event) => this.$emit("change", this.editor.getValue(), event));

            this.$action.off("window", "resize");
            this.$action.on("window", "resize", this.resize);

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
