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

import emojer from "emojer";

function load() {
    return require("../lang/emojis.json");
}

export default function emoji(): any {
    return [{
        type: "output",
        filter: (text: string) => emojer(
            text,
            "<img src=\"https://github.githubassets.com/images/icons/emoji/__EMOJI_NAME__.png?v5\" alt=\":__EMOJI_NAME__:\" title=\":__EMOJI_NAME__:\" class=\"emoji-img emoji\">",
            load,
        ),
    }];
}
