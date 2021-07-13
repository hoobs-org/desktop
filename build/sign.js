/* eslint-disable */

const { windows } = require("../../security/credentials.json");
const { join, basename } = require("path");

const root = join(__dirname, "../");

exports.default = async function (context) {
    const { path } = context;

    if (path.indexOf("HOOBS Setup") < 0) return;

    require("child_process").execSync(`java -jar ./build/jsign.jar --keystore ${windows.certificate} --storepass '${windows.password}' --storetype PKCS12 --tsaurl http://timestamp.digicert.com --alias ${windows.alias} './dist/${basename(path)}'`, { cwd: root, stdio: "inherit" });
};
