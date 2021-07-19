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
                Highlight({ pre: true }),
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
