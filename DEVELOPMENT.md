# Development

## Requirements

Install dependencies:

```bash
npm i
```

## Run

```bash
npm run dev
```

If you don't need autofocus when your files was changed, then run `dev` with env `START_MINIMIZED=true`:

```bash
START_MINIMIZED=true npm run dev
```

To start the app in `production` environment:

```bash
npm run build
npm run start
```

To start the app in `production` environment with debugging enabled:

```bash
DEBUG_PROD=true npm run start
```

## Testing

Run normal tests:

```bash
npm test
```

## Packaging

To package apps for the local platform:

```bash
npm run package
```

:bulb: When packaging for MacOS make sure to set your signing/notirization env variables per [the electron-builder docs](https://www.electron.build/mac#notarize). You can obtain an API key from [App Store Connect](https://appstoreconnect.apple.com/access/integrations/api).
Create a **Team Key** (not an _Individual Key_) with **App Manager** access.:

```bash
APPLE_API_KEY='YOUR_APPLE_API_KEY' APPLE_API_KEY_ID='YOUR_APPLE_API_KEY_ID' APPLE_API_ISSUER='YOUR_APPLE_API_ISSUER' npm run package
```

To package apps for all platforms:

First, refer to the [Multi Platform Build docs](https://www.electron.build/multi-platform-build) for dependencies.

Then,

```bash
npm run package-all
```

To package apps with options:

```bash
npm run package --[option]
```

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:

```bash
DEBUG_PROD=true npm run package
```

## Publishing

First, create a [personal access GitHub Token](https://github.com/settings/tokens) with the `repo` permission.

#### macOS

The macOS build must be published from a mac, with a valid code signing certificate available in your keychain. Then, simply:

```bash
GH_TOKEN=<github token> npm run publish-mac
```

This will push all relevant assets to a draft release on GitHub.

#### Windows

The Windows build can be built from a linux box. There are a few dependencies requried, see https://www.electron.build/multi-platform-build#to-build-app-for-windows-on-linux.

Then run:

```bash
GH_TOKEN=<github token> npm run publish-win
```

This will push all relevant assets to a draft release on GitHub.

#### Linux

The linux build must be built from a linux machine.

You also must have installed the `snapcraft` cli tool:

```bash
sudo snap install snapcraft --classic
```

To publish the linux snap build, you also must be logged into snapcraft:

```bash
snapcraft login
```

And should also install the `review-tools` snap for enhanced checks before uploading the snap:

```bash
sudo snap install review-tools
```

Finally, install deps for building rpms:

```bash
sudo apt install rpm
```

Then run:

```bash
GH_TOKEN=<github token> npm run publish-linux
```

This will push all relevant assets to a draft release on GitHub and push the new build to the snap store.
