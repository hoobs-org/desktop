/* eslint-disable */

const { notarize } = require("electron-notarize");
const { apple } = require("../../security/credentials.json");

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;

    if (electronPlatformName !== "darwin") return;

    const appName = context.packager.appInfo.productFilename;

    return await notarize({
        appBundleId: "org.hoobs.desktop",
        appPath: `${appOutDir}/${appName}.app`,
        appleId: apple.id,
        appleIdPassword: apple.pass,
    });
};
