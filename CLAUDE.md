# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BreakTimer is a cross-platform desktop application built with Electron that helps users manage periodic breaks. The app runs as a system tray application and can display break reminders as notifications or fullscreen overlays.

## Architecture

### Main Process (`app/main/`)

- **Entry Point**: `index.ts` - Main application entry point
- **Core Logic**: `lib/` directory contains the main business logic:
  - `breaks.ts` - Break scheduling and management
  - `ipc.ts` - Inter-process communication handlers
  - `store.ts` - Settings persistence using electron-store
  - `tray.ts` - System tray integration
  - `windows.ts` - Window management
  - `notifications.ts` - Native notification system
  - `auto-launch.ts` - Auto-startup functionality

### Renderer Process (`app/renderer/`)

- **Entry Point**: `index.tsx` - React application entry point
- **Components**: React components for UI (Break, Settings, etc.)
- **Styling**: SCSS files for component styling
- **Sounds**: Audio files for break notifications
- **Preload**: `preload.js` - Secure context bridge for IPC

### Types (`app/types/`)

- Shared TypeScript type definitions for IPC, settings, and breaks

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
npm run prettier-check         # Check code formatting
npm run prettier-fix           # Fix code formatting
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
- **Blueprint.js v6** - UI component library
- **Framer Motion** - Animation library for smooth transitions
- **SCSS** - Styling
- **Webpack 5** - Module bundler
- **electron-store** - Settings persistence
- **Howler.js** - Audio playback
- **moment.js** - Date/time handling

## IPC Communication

The app uses a typed IPC system defined in `app/types/ipc.ts`. Main process handlers are in `app/main/lib/ipc.ts`, providing secure communication between main and renderer processes for:

- Settings management
- Break control
- Sound playback
- Window management

## Settings Architecture

Settings are managed through electron-store with TypeScript interfaces defined in `app/types/settings.ts`. The store persists user preferences including:

- Break intervals and duration
- Working hours
- Sound preferences
- Notification settings

## Build System

- Uses Webpack 5 with separate configurations for main/renderer processes
- Babel for transpilation with TypeScript support
- React Fast Refresh for hot module replacement (replaced react-hot-loader)
- Production builds are optimized and minified
- TypeScript configured with `skipLibCheck: true` to avoid node_modules type checking

## Recent Updates

### Animation System

- **Replaced react-spring with framer-motion** for better performance and modern API
- Break window animations now use `motion.div` components
- Fixed infinite loop issues by using functional state updates in useEffect hooks

### Dependencies

- **React 19** with new JSX transform (`"jsx": "react-jsx"`)
- **Blueprint.js v6** with updated CSS class names (`bp6-*` instead of `bp5-*`)
- **TypeScript 5.8** with improved type checking
- **Framer Motion** for smooth animations

### Development Experience

- Fixed tsconfig.json to only check app code, not node_modules
- All Blueprint CSS classes updated to v6 naming convention
- Improved build configuration for better hot reloading
