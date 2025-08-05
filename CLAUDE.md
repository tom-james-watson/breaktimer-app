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
- **Styling**: CSS with Tailwind CSS for component styling
- **Sounds**: Audio files for break notifications
- **Preload**: `preload.js` - Secure context bridge for IPC
- **Fonts**: Inter font bundled locally in `public/fonts/`

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

- **Main Process**: Uses Webpack 5 for building the Electron main process
- **Renderer Process**: Uses Vite for fast development and optimized production builds
- Babel for transpiliation with TypeScript support
- React Fast Refresh for hot module replacement (replaced react-hot-loader)
- Production builds are optimized and minified
- TypeScript configured with `skipLibCheck: true` to avoid node_modules type checking

## Recent Updates

### UI and Styling

- **Migrated to shadcn/ui** - Modern component library with Radix UI primitives
- **Added Tailwind CSS** - Utility-first CSS framework for consistent styling
- **Bundled Inter font locally** - High-quality typography with WOFF2 format for offline use
- **Enhanced button interactions** - Improved hover/active states for better UX

### Animation System

- **Replaced react-spring with framer-motion** for better performance and modern API
- Break window animations now use `motion.div` components
- **Smooth progress animations** - 50ms updates for notification progress, 100ms for break window
- Fixed infinite loop issues by using functional state updates in useEffect hooks

### Window Management

- **Dynamic notification sizing** - Window width adjusts based on enabled buttons (450px-550px)
- **Circular progress border** - Start button shows countdown progress around its border
- Improved timer cleanup to prevent flickering during hot reloads

### Dependencies

- **React 19** with new JSX transform (`"jsx": "react-jsx"`)
- **TypeScript 5.8** with improved type checking
- **Framer Motion** for smooth animations
- **Vite** for fast development builds

### Development Experience

- Fixed tsconfig.json to only check app code, not node_modules
- Updated script names (`npm run format` instead of `prettier-fix`)
- Improved build configuration for better hot reloading
