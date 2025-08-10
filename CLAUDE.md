# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cross-platform Electron desktop app for managing periodic breaks. Runs as system tray application with notifications and fullscreen overlays.

## Architecture

### Main Process (`app/main/`)

- **Entry Point**: `index.ts`
- **Core Logic**: `lib/` directory:
  - `breaks.ts` - Break scheduling and management
  - `ipc.ts` - Inter-process communication handlers
  - `store.ts` - Settings persistence
  - `tray.ts` - System tray integration
  - `windows.ts` - Window management
  - `notifications.ts` - Native notifications
  - `auto-launch.ts` - Auto-startup

### Renderer Process (`app/renderer/`)

- **Entry Point**: `index.tsx`
- **Components**: React components (Break, Settings, etc.)
- **Styling**: CSS with Tailwind CSS
- **Sounds**: Audio files for notifications
- **Preload**: `preload.js` - Secure IPC bridge
- **Fonts**: Inter font bundled in `public/fonts/`

### Types (`app/types/`)

- Shared TypeScript definitions for IPC, settings, breaks

## Common Development Commands

### Development

```bash
npm run dev                    # Start development server with hot reload
START_MINIMIZED=true npm run dev  # Start development without auto-focus
```

### Building

```bash
npm run build                  # Build both main and renderer processes
npm run build-main             # Build main process only
npm run build-renderer         # Build renderer process only
```

### Production

```bash
npm run start                  # Start production build
DEBUG_PROD=true npm run start  # Start production with debugging
```

### Code Quality

```bash
npm run lint                   # Run ESLint
npm run typecheck              # Run TypeScript compiler check
npm run format-check           # Check code formatting
npm run format                 # Fix code formatting
```

### Testing

```bash
npm test                       # Run tests
```

### Packaging

```bash
npm run package               # Package for current platform
npm run package-all          # Package for all platforms
npm run package-mac          # Package for macOS
npm run package-win          # Package for Windows
npm run package-linux        # Package for Linux
```

## Key Technologies

- **Electron** - Desktop application framework
- **React 19** - UI framework for renderer process with new JSX transform
- **TypeScript 5.8** - Primary language
- **shadcn/ui** - Modern UI component library with Radix UI primitives
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Inter Font** - Typography font bundled locally (WOFF2 format)
- **Framer Motion** - Animation library for smooth transitions
- **Vite** - Frontend build tool and dev server for renderer process
- **Webpack 5** - Module bundler for main process
- **electron-store** - Settings persistence
- **Howler.js** - Audio playback
- **moment.js** - Date/time handling

## IPC Communication

Typed IPC system in `app/types/ipc.ts` with handlers in `app/main/lib/ipc.ts`:

- Settings management
- Break control
- Sound playback
- Window management

## Settings Architecture

electron-store with TypeScript interfaces in `app/types/settings.ts`:

- Break intervals and duration
- Working hours
- Sound preferences
- Notification settings

## Build System

- **Main Process**: Webpack 5
- **Renderer Process**: Vite
- Babel + TypeScript
- React Fast Refresh
- TypeScript `skipLibCheck: true`

## Recent Updates

### UI and Styling

- **shadcn/ui** - Modern component library with Radix UI primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Inter font** - Bundled locally (WOFF2)
- **Enhanced button interactions** - Improved hover/active states

### Animation System

- **framer-motion** - Replaced react-spring
- `motion.div` components for break windows
- **Smooth progress** - 50ms notification, 100ms break window updates
- Fixed infinite loops with functional state updates

### Window Management

- **Dynamic notification sizing** - 450px-550px based on enabled buttons
- **Circular progress border** - Around Start button
- **Multi-screen sync** - Break starts synchronized across displays
- Timer cleanup prevents hot reload flickering

### Dependencies

- **React 19** - New JSX transform
- **TypeScript 5.8**
- **Framer Motion**
- **Vite**

### Development Experience

- tsconfig.json excludes node_modules
- Improved hot reloading

## Development Workflow

**IMPORTANT**: Always run after non-trivial changes:

```bash
npm run format && npm run lint && npm run typecheck
```
