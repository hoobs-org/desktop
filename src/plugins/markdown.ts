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
                $markdown: (value: string): string => {
                    let html = (value || "").replace(/```[a-zA-Z ]*\n/gi, (match) => `${match.trim().toLowerCase()}\n`);
                    let href = "";

                    html = this.converter.makeHtml(html);

                    const links = html.match(/<\s*a[^>]*>/igm) || [];

                    for (let i = 0; i < links?.length; i += 1) {
                        href = (links[i].match(/href=["'](.*?)["']/ig) || [])[0] || "";
                        href = ((href.match(/(["'])(?:(?=(\\?))\2.)*?\1/ig) || [])[0] || "");

                        if (href !== "" && href.length > 2) {
                            href = href.substring(1);
                            href = href.slice(0, -1);

                            html = html.replace(links[i], `<a href="#" onclick="window.$open('${href}');">`);
                        } else {
                            html = html.replace(links[i], "<a>");
                        }
                    }

                    return html;
                },
            },
        });
    }
}

export default function markdown(): Markdown {
    return new Markdown();
}
