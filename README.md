# ✨ Lux Fusion

**Lux Fusion** is a desktop image editing and HDR fusion app built with **React**, **Vite**, **Electron**, **Tailwind CSS**, **Adobe Spectrum**, and **OpenCV.js**.

It gives users a clean workspace for importing images, adjusting visual properties, zooming and panning around the preview, exporting the edited result, and merging multiple photos into a single HDR-style image.

---

## 📸 What Lux Fusion Does

Lux Fusion focuses on simple, practical image enhancement inside a desktop app experience.

### 🖼️ Image Import

- Import local image files directly from your system.
- Supported formats:
  - **JPEG**
  - **PNG**
  - **WebP**
- Invalid file types are blocked with user-friendly alert messages.
- Importing a normal image automatically exits HDR mode and resets the editing workspace.

### 🎚️ Image Adjustments

Lux Fusion includes real-time adjustment controls powered by the HTML canvas rendering pipeline.

- **Brightness**
  - Range: `0%` to `200%`
  - Useful for darkening or brightening the whole image.

- **Contrast**
  - Range: `0%` to `200%`
  - Helps make highlights and shadows more or less intense.

- **Saturation**
  - Range: `0%` to `200%`
  - Controls how vivid or muted the image colors appear.

- **Zoom**
  - Range: `50%` to `400%`
  - Available through both the slider and mouse scroll wheel.

All adjustments update the canvas preview immediately.

### 🔍 Zoom and Pan

- Use the **Zoom** slider to scale the image.
- Use the **mouse wheel** over the preview to zoom in and out quickly.
- Click and drag the image preview to pan around.
- Pan movement is clamped so the image stays inside sensible bounds.
- Cursor states change between grab and grabbing for a more natural editing feel.

### 🌅 HDR Merge

Lux Fusion can combine multiple images into a merged HDR-style output using OpenCV.js exposure fusion.

- Select multiple images for HDR processing.
- Minimum images required: **2**
- Maximum images allowed: **20**
- Each selected image gets a preview thumbnail.
- Individual HDR images can be removed before merging.
- A **Clear All** action resets the HDR selection.
- During merging, the UI shows a loading state.
- When the merge finishes, the result opens in the main editor.

Behind the scenes, Lux Fusion:

- Loads each selected image into an OpenCV matrix.
- Resizes images to the same dimensions when needed.
- Converts images from RGBA to RGB for OpenCV compatibility.
- Uses `cv.MergeMertens()` for exposure fusion.
- Converts the fused image back to an exportable JPEG file.

### 📤 Export

The edited preview can be exported in:

- **PNG**
- **JPEG**

The export is based on the current visible edited canvas preview, including:

- Brightness
- Contrast
- Saturation
- Zoomed/cropped view
- Pan position

The exported file is downloaded as:

```txt
lux-fusion.png
lux-fusion.jpeg
```

### 🚨 User-Friendly Errors

Lux Fusion shows alerts for important user-facing problems, such as:

- Unsupported image formats.
- Unsupported HDR file selections.
- Trying to add more than 20 HDR images.
- Trying to merge fewer than 2 HDR images.
- HDR merge failures.

---

## 🧰 Tech Stack

| Technology | Purpose |
| --- | --- |
| ⚛️ **React** | Builds the interactive UI and manages app state. |
| ⚡ **Vite** | Fast development server and production build tool. |
| 🖥️ **Electron** | Wraps the web app into a desktop application. |
| 🎨 **Tailwind CSS** | Utility-first styling for layout, spacing, colors, and responsive UI. |
| 🧩 **Adobe React Spectrum** | Accessible UI controls such as buttons, menus, and sliders. |
| 👁️ **OpenCV.js** | Handles image matrix processing and HDR/exposure fusion. |

---

## 🗂️ Project Structure

```txt
Lux Fusion/
├── electron/
│   └── main.cjs          # Electron main process and desktop window setup
├── public/
│   ├── favicon.ico       # Browser/app favicon
│   ├── icon.ico          # App icon asset
│   └── icons.svg         # Public SVG icon asset
├── src/
│   ├── App.jsx           # Main app UI, state, canvas editor, HDR flow, export logic
│   ├── App.css           # App-specific styling
│   ├── index.css         # Global styles and Tailwind import
│   ├── main.jsx          # React entry point
│   ├── opencv.js         # OpenCV.js HDR merge processing
│   └── assets/           # Local image/static assets
├── index.html            # Vite HTML entry
├── vite.config.js        # Vite + React + Tailwind configuration
├── eslint.config.js      # ESLint configuration
├── package.json          # Scripts, dependencies, metadata, Electron build config
└── README.md             # Project documentation
```

---


## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Browser Development Mode

```bash
npm run dev
```

This starts the Vite development server.

### 3. Run as Desktop App During Development

```bash
npm run start
```

This runs:

- Vite dev server
- Electron app
- A wait step so Electron opens only after Vite is ready

### 4. Build for Production

```bash
npm run build
```

This creates the production files inside:

```txt
dist/
```

### 5. Obfuscate the code

```bash
npx javascript-obfuscator dist --output dist --compact true --string-array true
```

### 6. Create setup and executable file in dist folder

```bash
npx electron-builder
```

---

## 📦 Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run electron` | Starts Electron directly. |
| `npm run start` | Runs Vite and Electron together for desktop development. |
| `npm run build` | Builds the React/Vite app for production. |
| `npx electron-builder` | Creates setup and executable file in dist folder |


---



## 🧠 Main Features Summary

- 🖼️ Import JPEG, PNG, and WebP images.
- 🎚️ Adjust brightness, contrast, and saturation.
- 🔍 Zoom from `50%` to `400%`.
- 🖱️ Pan around zoomed images with click-and-drag.
- 🌅 Merge 2 to 20 images into an HDR-style result.
- 🧾 Preview HDR images before merging.
- ❌ Remove individual HDR images before merge.
- 🧹 Clear all HDR selections.
- 📤 Export edited output as PNG or JPEG.
- 🖥️ Run as a desktop app with Electron.
- ⚡ Use Vite for fast development builds.
- 🎨 Use Tailwind CSS and React Spectrum for the UI.
- 🚨 Show user-facing alerts for validation and processing errors.

---


## 👤 Author

Made by **Krish Dua**.


