<p align="center">
  <h1 align="center">✍️ Air Writing</h1>
  <p align="center">
    <strong>Draw in the air using hand gestures — powered by MediaPipe Hands AI</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#how-it-works">How It Works</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#gestures">Gestures</a> •
    <a href="#tech-stack">Tech Stack</a>
  </p>
</p>

---

## 🎥 Demo

> **Live:** [mohak-air-writing-nu.vercel.app](https://mohak-air-writing-nu.vercel.app)

Open the link on any device with a camera and start drawing in the air!

---

## ✨ Features

- 🖐️ **Real-time Hand Tracking** — AI-powered hand detection using MediaPipe Hands
- ✏️ **Air Drawing** — Draw by pointing your index finger
- 🧽 **Air Erasing** — Open your full hand to erase strokes
- ✌️ **Pause Gesture** — Hold up two fingers (peace sign) to pause drawing
- 🎨 **Color Picker** — Choose from preset neon colors or use a custom color picker
- 📏 **Adjustable Sizes** — Control pencil and eraser sizes via sliders
- 🔷 **Shape Drawing** — Type a shape name (circle, star, heart, triangle, etc.) to auto-draw it on the canvas
- 🌙 **Neon Glow Aesthetic** — Beautiful glowing strokes on a dark background
- 🪟 **Glassmorphism UI** — Modern frosted-glass control panel
- 📱 **Responsive Design** — Works on desktop and mobile browsers
- 🔁 **Window Resize Handling** — Strokes scale proportionally when resizing

---

## 🖐️ Gestures

| Gesture | Fingers | Action |
|---|---|---|
| ☝️ **Point** | Index finger only | **Draw** — traces your fingertip movement |
| ✌️ **Peace** | Index + Middle fingers | **Pause** — stops drawing without erasing |
| 🖐️ **Open Hand** | 4+ fingers raised | **Erase** — erases strokes near your palm |

---

## 🔷 Supported Shapes

Type any of these into the shape input field and press **Draw**:

`circle` · `square` · `rectangle` · `triangle` · `star` · `heart` · `diamond` · `hexagon` · `pentagon` · `arrow`

---

## 🚀 Getting Started

### Prerequisites

- A modern browser (Chrome, Edge, Firefox, Safari)
- A device with a webcam
- [Node.js](https://nodejs.org/) (for local dev server, optional)

### Run Locally

```bash
# Clone the repository
git clone https://github.com/Mohak-Godbole/Air-Writing.git
cd Air-Writing

# Start the dev server
npm run dev
```

The app will open at `http://localhost:3000`. Allow camera access when prompted.

### Or Just Open the File

You can also simply open `index.html` directly in your browser — no build step required.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5 / CSS3 / JavaScript** | Core web technologies |
| **MediaPipe Hands** | Real-time hand landmark detection (21 keypoints) |
| **Canvas API** | Drawing strokes with glow effects |
| **Vercel** | Deployment & hosting |

---

## 📁 Project Structure

```
Air-Writing/
├── index.html        # Main HTML — video feed, canvas, controls UI
├── style.css         # Glassmorphism UI, neon glow theme, responsive layout
├── app.js            # Hand tracking, gesture recognition, drawing engine
├── package.json      # Dev server script
├── vercel.json       # Vercel deployment config
└── README.md         # You are here
```

---

## 🧠 How It Works

1. **Camera Feed** — The webcam stream is displayed as a live video background
2. **Hand Detection** — MediaPipe Hands processes each frame to detect 21 hand landmarks
3. **Gesture Classification** — Finger states (up/down) are analyzed to determine the current gesture
4. **Drawing** — When the index finger is pointed, its tip coordinates are tracked and rendered as smooth Bézier curves on an overlay canvas
5. **Erasing** — With an open hand, strokes near the palm center are removed
6. **Mirrored View** — Both the video and canvas are horizontally flipped for a natural mirror experience

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Mohak-Godbole">Mohak Godbole</a>
</p>
