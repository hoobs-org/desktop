const Monaco = require("monaco-editor-webpack-plugin");

module.exports = {
    pluginOptions: { electronBuilder: { outputDir: "dist", nodeIntegration: true } },

    configureWebpack: {
        plugins: [new Monaco({ languages: ["json"] })],
        performance: { hints: false },
        optimization: { runtimeChunk: "single" },
    },
};
