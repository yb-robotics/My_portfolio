# Yash Bansal Portfolio: Frontend Context & Documentation

This document provides a comprehensive overview of the portfolio codebase, explaining the directory layout, technology choices, and component interactions.

---

## 1. Tech Stack Overview

The application is built using modern web technologies tailored for rich interactive aesthetics:
*   **Framework**: [Next.js 16.2.6 (App Router)](file:///E:/portfolio_site/package.json#L14)
*   **Library Core**: [React 19.2.4](file:///E:/portfolio_site/package.json#L15)
*   **Styling**: [Tailwind CSS v4](file:///E:/portfolio_site/package.json#L23) combined with CSS Modules for scoped component isolation
*   **3D Renderers**: 
    *   [Three.js (WebGL)](file:///E:/portfolio_site/package.json#L17) for dynamic mathematical particle grids
    *   **Spline Viewer** (via `@splinetool/viewer`) for interactive 3D mechatronics model rendering
*   **Animations**: **Framer Motion** for spring-damped viewport entries and 3D card tilt gestures
*   **Scroll Engine**: **Lenis** for global inertial kinetic scrolling physics

---

## 2. Directory Layout & Routing Map

```
E:/portfolio_site/
├── public/                 # Static Assets (Videos, SVGs)
└── src/
    ├── app/                # Global Routing & Styles
    │   ├── projects/[id]/  # Dynamic Project Details Pages
    │   ├── globals.css     # Global CSS & Tailwind Config
    │   ├── layout.js       # App Root & Global Providers
    │   └── page.js         # Homepage Template
    ├── components/         # Modular Components
    ├── constants/          # Site Configuration
    └── hooks/              # Custom React Hooks
```

---

## 3. Detailed Component Catalog

### Core Core Infrastructure

#### 1. [layout.js](file:///E:/portfolio_site/src/app/layout.js)
*   **Purpose**: Root template for the entire application.
*   **Features**:
    *   Imports Google Webfonts: **Orbitron** (weights `400, 700, 900` for titles) and **Inter** (weights `300, 400, 500, 700` for readable body text).
    *   Wraps children in the [SmoothScrollProvider](file:///E:/portfolio_site/src/components/SmoothScrollProvider.jsx) (Lenis scroll context).
    *   Renders the [StarfieldBackground](file:///E:/portfolio_site/src/components/StarfieldBackground.jsx) canvas and [CustomCursor](file:///E:/portfolio_site/src/components/CustomCursor.jsx) globally.
    *   Asynchronously injects the `@splinetool/viewer` runtime script for 3D elements.

#### 2. [globals.css](file:///E:/portfolio_site/src/app/globals.css)
*   **Purpose**: Manages global Tailwind theme configurations and typography resets.
*   **Features**:
    *   Binds CSS variables `--font-title` (Orbitron) and `--font-sans` (Inter) to Tailwind's default fonts.
    *   Forces Orbitron rendering on headings (`h1`-`h6`) globally.
    *   Excludes the Hero section (`#hero-section`) from global transparent overlays.
    *   Applies transparent glassmorphism variables and backdrop filters to other sections.
    *   Applies custom styling and glowing hover states to scrollbars.

#### 3. [SmoothScrollProvider.jsx](file:///E:/portfolio_site/src/components/SmoothScrollProvider.jsx)
*   **Purpose**: Wraps the App Router in a client-side Lenis instance.
*   **Features**: Sets scroll duration to `1.2s` with custom ease-out transitions to create smooth scroll inertia.

#### 4. [StarfieldBackground.jsx](file:///E:/portfolio_site/src/components/StarfieldBackground.jsx)
*   **Purpose**: Background star particle system.
*   **Features**:
    *   Runs on an optimized HTML5 2D canvas context.
    *   Draws ~150 twinkling stars, drifting purple/cyan nebula gases, and sweeps shooting star paths.
    *   **Scroll-Reactive Depth**: Splits stars into 3 depth layers (50 each). Layer 1 (near) translates at `0.08x` scroll velocity, Layer 2 (mid) at `0.04x`, and Layer 3 (far) at `0.01x` via Lenis scroll velocity, wrapping vertically.
    *   **Hyperdrive Warp-speed**: When scroll velocity exceeds 8, the shooting star spawn chance is boosted from `1%` to `12%` per frame.
    *   **Mechatronics Color Morphing**: Monitored the position of `#simulation-section` to interpolate star and nebula colors towards warm amber (`rgb(255, 154, 60)`) when scrolled near it.
    *   Auto-resizes and pauses when the browser tab loses focus.

#### 5. [CustomCursor.jsx](file:///E:/portfolio_site/src/components/CustomCursor.jsx)
*   **Purpose**: Custom reticle pointer overriding the standard browser mouse.
*   **Features**:
    *   Tracks positions using direct DOM `translate3d` positioning on `mousemove` to secure lag-free performance at 144 Hz.
    *   Applies a CSS transition on the outer ring to create smooth follow lag.
    *   Uses event delegation to detect interactive anchors (`a, button`), scaling up the reticle and shifting from Electric Blue to Amber.

---

### Page Sections

#### 1. [Header.jsx](file:///E:/portfolio_site/src/components/Header.jsx)
*   **Purpose**: Sticky navigation bar.
*   **Features**: Auto-highlights links based on the active scroll section ID. Supports smooth jumps.

#### 2. [VideoIntro.jsx](file:///E:/portfolio_site/src/components/VideoIntro.jsx)
*   **Purpose**: Hero landing container.
*   **Features**:
    *   Blurs the background video (`/yash-video.mp4`) as an ambient background layer.
    *   Imports [CinematicLayer.jsx](file:///E:/portfolio_site/src/components/CinematicLayer.jsx) (Three.js WebGL particle network).
    *   Hosts the main video frame with playback controllers.
    *   Renders a mock Rviz widget displaying system clock logs and axes telemetry markers.
    *   Uses [useGSAPEntrance.js](file:///E:/portfolio_site/src/hooks/useGSAPEntrance.js) hook to animate element entries.
    *   **GSAP Parallax & Pinning**: Pinned for `100vh` scroll duration using GSAP ScrollTrigger. Translates foreground video (`0.4x` speed), Cinematic Three.js canvas (`0.6x`), and Orbitron titles (`0.8x`) based on Lenis scroll position.

#### 3. [Projects.jsx](file:///E:/portfolio_site/src/components/Projects.jsx)
*   **Purpose**: Showcase catalog grid.
*   **Features**:
    *   Maps project details to card frames.
    *   Card videos play in a dimmed loop continuously (`opacity: 0.35`).
    *   Hovering triggers `rotateX` and `rotateY` spring-damped tilts (3D perspective tilt) and fades video to full opacity (`0.95`).
    *   Clicking navigates to dynamic sub-routes (`/projects/[id]`).

#### 4. [SimulationLab.jsx](file:///E:/portfolio_site/src/components/SimulationLab.jsx)
*   **Purpose**: 3D interactive workbench node.
*   **Features**:
    *   Embeds the Spline 3D robot arm model (`https://prod.spline.design/IOg-s51tJs7GuT2D/scene.splinecode`).
    *   Left Console: Telemetry panels displaying active joint angles ($J_1$-$J_6$) with random sensor jitter. Button selectors execute joint sweeps mimicking motion planning pathways.
    *   Right Console: stdout console logger printing dynamic diagnostic messages.

#### 5. [FiverrGigs.jsx](file:///E:/portfolio_site/src/components/FiverrGigs.jsx)
*   **Purpose**: Freelance commission board.
*   **Features**:
    *   Lists services (ROS2 autonomous navigation, SolidWorks DFM design, custom PID firmware) with pricing grids and ratings.
    *   **Staggered Scroll Entrance**: Staggers cards (`opacity: 0, y: 50, rotateX: 8deg` to default state) on viewport entrance using the [useGSAPGigsEntrance.js](file:///E:/portfolio_site/src/hooks/useGSAPGigsEntrance.js) hook.
    *   **Collision Prevention**: Wraps cards in a `.cardContainer` to separate GSAP scroll transformations from Framer Motion hover gestures.

#### 6. [Contact.jsx](file:///E:/portfolio_site/src/components/Contact.jsx)
*   **Purpose**: Gamified message transmitter form.
*   **Features**:
    *   Left Panel: Digital oscilloscope canvas drawing active sine waves.
    *   Right Panel: Input form. Submitting triggers an upload progress loader and prints mechatronics diagnostic transmission codes.
    *   **Panel Entrance**: Slides left transceiver panel in from `x: -60` and right form panel from `x: 60` simultaneously via ScrollTrigger.
    *   **Oscilloscope Focus Tween**: Smoothly tweens oscilloscope amplitude from `25` to `45` using GSAP when form fields are focused, and back to `25` on blur.
    *   **Magnetic Submit Button**: Nudges Submit button toward cursor when mouse is within `80px` (nudge factor `0.3` of client offset).

#### 7. [Footer.jsx](file:///E:/portfolio_site/src/components/Footer.jsx)
*   **Purpose**: Telemetry footer.
*   **Features**: Simulates ping latency, lists environment libraries, and provides social redirect links.

---

### Dynamic Sub-Routing Viewport

#### [projects/[id]/page.js](file:///E:/portfolio_site/src/app/projects/%5Bid%5D/page.js)
*   **Purpose**: Project details summary viewport.
*   **Features**:
    *   Retrieves project index params via `useParams()`.
    *   Renders mechatronic telemetry charts (spec tables), documentation anchors, chronological engineering build timelines, and scrollable Git commit logs.
    *   Incorporates a custom inline SVG for the GitHub logo, bypassing Lucide-react brand icon restrictions.

---

## 4. Key Package Dependencies

From [package.json](file:///E:/portfolio_site/package.json):
*   `next` (16.2.6): Page routes, dynamic SSR generation, compiler assets.
*   `react` (19.2.4) & `react-dom` (19.2.4): Render core.
*   `framer-motion` (12.40.0): Interface interactions (3D tilts, timeline progress, bar expansions).
*   `three` (0.184.0): Three.js WebGL particle buffers for the hero canvas.
*   `lenis` (1.3.23): Damped scroll momentum engine with React hook context wrappers.
*   `gsap` (3.15.0): Drives hero entrance, scroll parallax pinning, staggered cards, and input wave tweens.
*   `lucide-react` (1.16.0): Core site icons.
