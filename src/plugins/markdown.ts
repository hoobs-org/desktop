import Vue, { VueConstructor } from "vue";
import Showdown, { Converter } from "showdown";
import Highlight from "showdown-highlight";
import Emoji from "./emoji";

class Markdown {
    declare converter: Converter;

    constructor() {
        Showdown.setFlavor("github");

        this.converter = new Showdown.Converter({
            extensions: [
                Emoji,
                Highlight,
            ],
            tables: true,
            simplifiedAutoLink: true,
            excludeTrailingPunctuationFromURLs: true,
        });
    }

    install(vue: VueConstructor<Vue>): void {
        vue.mixin({
            methods: {
                $markdown: (value: string): string => this.converter.makeHtml((value || "").replace(/```[a-zA-Z ]*\n/gi, (match) => `${match.trim().toLowerCase()}\n`)),
            },
        });
    }
}

export default function markdown(): Markdown {
    return new Markdown();
}
