<div align="center">

# ✍️ Handwritten Digit Predictor AI

### CNN + Django REST API + React — Real-Time Digit Recognition

<img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&size=22&pause=1000&color=00E5FF&center=true&vCenter=true&width=600&lines=Draw+a+digit%2C+get+an+instant+prediction;Powered+by+a+Convolutional+Neural+Network;99%25%2B+Accuracy+on+MNIST;Django+REST+API+%2B+React+Frontend" alt="Typing SVG" />

<br/>

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor black)
![Accuracy](https://img.shields.io/badge/Accuracy-99%25+-00E5FF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-ff007c?style=for-the-badge)

</div>

---

## 📌 Overview

**Handwritten Digit Predictor AI** is a full-stack, real-time web application that recognizes handwritten digits (0–9). Users can either **draw directly on an interactive canvas** or **upload an image**, and a Convolutional Neural Network (CNN) trained on the MNIST dataset predicts the digit — along with a full class probability breakdown — in milliseconds.

The project demonstrates a complete AI product pipeline: **model training → REST API serving → interactive frontend**, wrapped in a custom Sci-Fi Glassmorphism UI.

> 🎯 **99%+ accuracy** achieved on the MNIST test dataset.

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| 🔬 Deep Learning Engine | TensorFlow / Keras | 2D CNN built and trained, exported in native `.keras` format |
| ⚙️ Backend API | Django + Django REST Framework | Image preprocessing pipeline, in-memory model serving, `POST` API |
| 🎨 Frontend | React.js (Vite) | Glassmorphism SPA with HTML5 Canvas drawing + upload dropzone |
| 🖼️ Image Processing | OpenCV / Pillow / NumPy | Grayscale conversion, resizing, color inversion, normalization |
| 🔗 Connectivity | Axios + django-cors-headers | Secure communication between React (5173) and Django (8000) |

---

## 🏗️ CNN Architecture

Instead of a plain Dense Neural Network — which throws away spatial structure — this project uses a **CNN** to preserve 2D pixel relationships across the digit strokes.

```mermaid
flowchart TD
    A["Input Image<br/>28 × 28 × 1"] --> B["Conv2D — 32 filters, 3×3, ReLU<br/>Extracts edges & lines<br/>→ 26×26×32"]
    B --> C["MaxPooling2D 2×2<br/>Downsamples<br/>→ 13×13×32"]
    C --> D["Conv2D — 64 filters, 3×3, ReLU<br/>Extracts shapes & loops<br/>→ 11×11×64"]
    D --> E["MaxPooling2D 2×2<br/>→ 5×5×64"]
    E --> F["Dropout 0.25<br/>Prevents overfitting"]
    F --> G["Flatten<br/>→ 1,600 elements"]
    G --> H["Dense — 128 neurons, ReLU<br/>Classification reasoning"]
    H --> I["Dropout 0.5<br/>Regularization"]
    I --> J["Dense Output — 10 neurons, Softmax<br/>Class probabilities (0–9)"]

    style A fill:#0b0f1a,stroke:#00e5ff,color:#fff
    style J fill:#0b0f1a,stroke:#ff007c,color:#fff
```

**Training config:** Adam optimizer · `sparse_categorical_crossentropy` loss · 5 epochs on 60,000 MNIST training images.

**Exported model:** `saved_models/digit_cnn_model.keras`

---

## ⚙️ System Architecture & Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React Frontend
    participant D as Django REST API
    participant M as CNN Model (in RAM)

    U->>R: Draws on Canvas / Uploads Image
    R->>D: POST /api/predict/ (Base64 or file)
    D->>D: Grayscale → Resize 28×28
    D->>D: Auto color-inversion check
    D->>D: Normalize [0,255] → [0.0,1.0]
    D->>M: Reshape to (1,28,28,1) → Inference
    M-->>D: Class probabilities
    D-->>R: JSON { predicted_digit, confidence, all_probabilities }
    R-->>U: Animated prediction + probability graph
```

The `.keras` model is **loaded once into RAM at server startup**, eliminating reload overhead and enabling near-instant inference on every request.

---

## 🔌 API Reference

**Endpoint:** `POST /api/predict/`

Accepts either:
- A **Base64 string** (from the canvas), or
- A **multipart file** (from drag-and-drop upload)

**Response Schema:**

```json
{
  "predicted_digit": 8,
  "confidence": 98.5,
  "all_probabilities": [0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 98.5, 1.4]
}
```

**Preprocessing pipeline (`api/views.py`):**
1. **Input parsing** — handles both Base64 and file uploads
2. **Grayscale + resize** — converts to single-channel `L` mode, resizes to 28×28
3. **Color inversion logic** — checks mean pixel brightness (`> 127`); auto-inverts light backgrounds to match MNIST's white-on-black format
4. **Normalization + reshape** — scales to `[0.0, 1.0]` and reshapes to `(1, 28, 28, 1)`

---

## 🎨 Frontend Highlights

- **Dual input system:**
  - 🖊️ Interactive **360×360 HTML5 Canvas** for real-time drawing
  - 📤 **Drag-and-drop upload** dropzone for image files
- **Design system:** Custom Sci-Fi Glassmorphism — frosted translucent panels, neon cyan (`#00e5ff`) accents, neon pink (`#ff007c`) winner highlight
- **Live visualization:** Glowing prediction badge + animated per-class probability bar graph

---

## 📁 Project Structure

```
IMAGE_PREDICTION_AI_APP/
│
├── backend/                      # Django Main Project Settings
│   ├── settings.py               # CORS config & model path
│   ├── urls.py                   # API app routes
│   └── wsgi.py
│
├── api/                          # Django REST App
│   ├── urls.py                   # '/predict/' endpoint
│   └── views.py                  # Model load + preprocessing + inference
│
├── saved_models/
│   └── digit_cnn_model.keras     # Trained CNN weights
│
├── frontend/                     # React Vite SPA
│   ├── src/
│   │   ├── App.jsx               # Canvas logic, upload handlers, state
│   │   └── App.css               # Glassmorphism styles & animations
│   └── package.json
│
├── venv/                         # Python virtual environment
├── train_cnn.py                  # CNN training script
├── visualize_cnn.py              # Matplotlib debugging visualizer
└── manage.py                     # Django CLI runner
```

---

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, connecting to the API at `http://localhost:8000`.

---

## 📊 Key Accomplishments

- ✅ **Full-stack AI integration** — bridged a deep learning model with a production-grade REST API and dynamic frontend
- ✅ **Computer vision preprocessing** — custom color inversion, spatial normalization, resolution downscaling
- ✅ **Optimized serving architecture** — model cached in RAM at startup, zero reload overhead per request
- ✅ **Custom UI/UX design** — responsive Glassmorphism interface built from scratch with CSS Grid, Flexbox, and keyframe animations

---

## 🔮 Future Improvements

- [ ] Deploy live demo (Vercel + Render)
- [ ] Add support for multi-digit sequence recognition
- [ ] Model confidence calibration & uncertainty visualization
- [ ] Mobile-responsive canvas with touch gesture smoothing

---

## 📄 License

This project is licensed under the **MIT License**.

<div align="center">

### 👤 Author

**Mohamad Alharis** — Full-Stack & AI Developer

[![GitHub](https://img.shields.io/badge/GitHub-Haaris--02-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Haaris-02)

⭐ If you found this project interesting, consider giving it a star!

</div>