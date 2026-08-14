import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Eraser, RotateCcw, Upload, Pencil, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('draw'); // 'draw' or 'upload'
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Canvas Refs & States
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Canvas Background as Black (MNIST Style)
  useEffect(() => {
    if (activeTab === 'draw') {
      clearCanvas();
    }
  }, [activeTab]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  // Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'white'; // White stroke on black canvas
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // API Call for Canvas Drawing Prediction
  const handleCanvasPredict = async () => {
    const canvas = canvasRef.current;
    const imageBase64 = canvas.toDataURL('image/png');

    setLoading(true);
    try {
      const response = await axios.post('https://digit-cnn-backend.onrender.com/api/predict/', {
        image_base64: imageBase64,
      });
      setPrediction(response.data);
    } catch (error) {
      console.error("Prediction Error:", error);
      alert("Error connecting to Django backend!");
    } finally {
      setLoading(false);
    }
  };

  // API Call for File Upload Prediction
  const handleFileUploadPredict = async () => {
    if (!selectedFile) return alert("Please select an image first!");

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    try {
      const response = await axios.post('https://digit-cnn-backend.onrender.com/api/predict/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(response.data);
    } catch (error) {
      console.error("Upload Prediction Error:", error);
      alert("Error predicting uploaded image!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🧠 CNN Digit Predictor AI</h1>
        <p>Powered by TensorFlow CNN, Django REST API &amp; React</p>
      </header>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'draw' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('draw')}
        >
          <Pencil size={18} /> Draw Digit
        </button>
        <button 
          className={activeTab === 'upload' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('upload')}
        >
          <Upload size={18} /> Upload Image
        </button>
      </div>

      <main className="main-content">
        {/* LEFT PANEL: INPUT (CANVAS OR UPLOAD) */}
        <div className="input-card">
          {activeTab === 'draw' ? (
            <div className="canvas-section">
              <h3>Draw a Digit (0-9) inside the box:</h3>
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={360}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <div className="action-buttons">
                <button className="btn btn-secondary" onClick={clearCanvas}>
                  <RotateCcw size={16} /> Clear Canvas
                </button>
                <button className="btn btn-primary" onClick={handleCanvasPredict} disabled={loading}>
                  <Sparkles size={16} /> {loading ? 'Predicting...' : 'Predict Digit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="upload-section">
              <h3>Upload handwritten digit image:</h3>
              <div className="file-dropzone">
                <input type="file" accept="image/*" onChange={handleFileChange} id="fileInput" hidden />
                <label htmlFor="fileInput" className="file-label">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="image-preview" />
                  ) : (
                    <div>
                      <Upload size={40} color="#888" />
                      <p>Click or Drag image here</p>
                    </div>
                  )}
                </label>
              </div>
              <button className="btn btn-primary btn-full" onClick={handleFileUploadPredict} disabled={loading || !selectedFile}>
                <Sparkles size={16} /> {loading ? 'Predicting...' : 'Predict Digit'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: RESULTS & PROBABILITY BARS */}
        <div className="results-card">
          <h3>Inference Results</h3>
          {prediction ? (
            <div className="prediction-display">
              <div className="winner-badge">
                <span className="winner-label">Predicted Digit</span>
                <span className="winner-digit">{prediction.predicted_digit}</span>
                <span className="confidence-text">Confidence: {prediction.confidence}%</span>
              </div>

              <div className="bars-container">
                <h4>Class Probabilities Distribution:</h4>
                {prediction.all_probabilities.map((prob, digit) => (
                  <div key={digit} className="bar-row">
                    <span className="digit-index">{digit}</span>
                    <div className="bar-track">
                      <div 
                        className={`bar-fill ${digit === prediction.predicted_digit ? 'highlight' : ''}`}
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                    <span className="prob-value">{prob}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Draw a number or upload an image and click <b>Predict</b> to see CNN results.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;