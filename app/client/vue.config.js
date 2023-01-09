// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defineConfig } = require("@vue/cli-service");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = defineConfig({
    transpileDependencies: true,
    css: {
        extract: false
    },
    chainWebpack: (config) => {
        config
            .resolve
            .alias
            .set("@settings", path.resolve(
                __dirname,
                "src/settings/",
                process.env.BUILD_TARGET || "development"
            ));
    }
});
