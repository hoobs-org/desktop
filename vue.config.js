const Monaco = require("monaco-editor-webpack-plugin");

module.exports = {
    configureWebpack: {
        plugins: [
            new Monaco({
                languages: [
                    "json"
                ]
            })
        ]
    }
};
