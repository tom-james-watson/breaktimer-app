BreakTimer App - https://breaktimer.app
===========

BreakTimer is a desktop application for managing and enforcing periodic breaks. BreakTimer is available for Windows, macOS and Linux.

BreakTimer allows you to customize:

* How long your breaks are and how often you wish to have them
* Whether to be reminded with a simple notification or a fullscreen break window
* Working hours so you are only reminded when you want to be
* The content of messages shown during breaks.
* Whether to intelligently restart your break countdown when it detects that you have not been using the computer

## Installation

* **Windows** - [BreakTimer.exe](https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.exe) (unsigned - you will receive a warning on install, press more info -> run anyway)
* **macOS** - [BreakTimer.dmg](https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.dmg)
* **Linux**:
  * Auto-updating **[preferred]**:
    * [BreakTimer Snap](https://snapcraft.io/breaktimer) - **also available in the Ubuntu App Store**.
    * [BreakTimer.AppImage](https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.AppImage)
  * Non auto-updating
    * [BreakTimer.deb](https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.deb)
    * [BreakTimer.rpm](https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.rpm) (untested)
    * [BreakTimer.tar.gz](https://github.com/tom-james-watson/breaktimer-app/releases/latest/download/BreakTimer.tar.gz)

## Screenshots

![break panel](screenshots/break.png)
---
![settings panel](screenshots/settings.png)
---
![notification](screenshots/notification.png)

## FAQ

### Why can't I see the app in the tray?

Some operating systems, such as linux distributions running plain Gnome (e.g. Fedora) or Pantheon (e.g. Elementary OS), don't support system tray icons. In this case, simply re-run the app to open the settings window. You will lose access to certain functionality only available in the tray menu, but at least this workaround lets you use the app.

### Is there a way to control the app via the commmand line?

On linux, if you run the app via the command line there is some basic support for command line arguments:

Disable breaks:

```bash
breaktimer disable
```

Enable breaks:

```bash
breaktimer enable
```

## Development

See [./DEVELOPMENT.md](DEVELOPMENT.md).
