module.exports = {
    pluginOptions: {
        electronBuilder: {
            outputDir: "dist",
            nodeIntegration: true,
        },
    },

    chainWebpack: (config) => {
        config.performance.maxEntrypointSize(400000).maxAssetSize(400000);

        config.plugin("html").tap((args) => {
            const payload = args;

            payload[0].title = "HOOBS";

            return payload;
        });
    },
};
