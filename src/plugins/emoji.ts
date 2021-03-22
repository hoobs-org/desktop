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
