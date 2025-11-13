const fs = require("fs");
const path = require("path");

// Workaround for macOS Sequoia/Tahoe Liquid Glass icons
// macOS 15+ treats traditional .icns files as "legacy" and displays them with a gray border.
// The fix is to include an Assets.car file (compiled from icon.icon) and set CFBundleIconName.
//
// This workaround manually copies a pre-generated Assets.car into the app bundle after packaging.
// Once https://github.com/electron-userland/electron-builder/pull/9345 is published (v26.2.0+),
// this script can be removed. To migrate:
// 1. Remove the "afterPack" line from package.json
// 2. Change mac.icon from "resources/icon.icns" to "resources/src/icon.icon"
// 3. Keep CFBundleIconName in extendInfo
// 4. Delete resources/Assets.car (electron-builder will generate it automatically)
//
// Workaround based on: https://www.hendrik-erz.de/post/supporting-liquid-glass-icons-in-apps-without-xcode
// Implementation: https://github.com/electron-userland/electron-builder/pull/9279
// Related issue: https://github.com/electron-userland/electron-builder/issues/9254

exports.default = async function (context) {
  if (context.electronPlatformName !== "darwin") {
    return;
  }

  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
  );
  const resourcesPath = path.join(appPath, "Contents", "Resources");
  const assetsCar = path.join(__dirname, "..", "resources", "Assets.car");
  const targetPath = path.join(resourcesPath, "Assets.car");

  console.log("Copying Assets.car to app bundle...");
  fs.copyFileSync(assetsCar, targetPath);
  console.log("Assets.car copied successfully");
};
