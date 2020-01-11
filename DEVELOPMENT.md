Development
===========

## Requirements

Install dependencies:

```bash
yarn
```

## Run

```bash
yarn dev
```

If you don't need autofocus when your files was changed, then run `dev` with env `START_MINIMIZED=true`:

```bash
START_MINIMIZED=true yarn dev
```

To start the app in `production` environment:

```bash
yarn build
yarn start
```

To start the app in `production` environment with debugging enabled:

```bash
DEBUG_PROD=true yarn start
```

## Testing

Run normal tests:

```bash
yarn test
```

## Packaging

To package apps for the local platform:

```bash
yarn package
```

To package apps for all platforms:

First, refer to the [Multi Platform Build docs](https://www.electron.build/multi-platform-build) for dependencies.

Then,

```bash
yarn package-all
```

To package apps with options:

```bash
yarn package --[option]
```

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:

```bash
DEBUG_PROD=true yarn package
```

## Publishing

First, create a [personal access GitHub Token](https://github.com/settings/tokens) with the `repo` permission.

To publish the linux snap build, you also must be logged into the snap store, which you do via the `snap` cli.

#### macOS

The macOS build must be published from a mac, with a valid code signing certificate available in your keychain. Then, simply:

```bash
GH_TOKEN=<github token> yarn publish-mac
```

This will push all relevant assets to a draft release on GitHub.

#### Windows

The Windows build can be built from a linux box. Simply run:

```bash
GH_TOKEN=<github token> yarn publish-win
```

This will push all relevant assets to a draft release on GitHub.

#### Linux

From a linux box, simply run:

```bash
GH_TOKEN=<github token> yarn publish-linux
```

This will push all relevant assets to a draft release on GitHub and push the new build to the snap store.
