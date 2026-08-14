from django.shortcuts import render
import base64
import os
import cv2
import numpy as np
import tensorflow as tf
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from PIL import Image
import io

# Django server start aagum podhu single time model-a memory-la load pandrom!
print("Loading Trained CNN Model into Django Memory... 🧠")
MODEL_PATH = settings.CNN_MODEL_PATH

if os.path.exists(MODEL_PATH):
    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ CNN Model Loaded Successfully in Django!")
else:
    model = None
    print("❌ Model File Not Found! Check saved_models directory.")


def preprocess_image(image_bytes):
    """Image bytes-a vaangi 28x28 Grayscale Normalized array-a maathum"""
    image = Image.open(io.BytesIO(image_bytes)).convert('L') # Convert to Grayscale
    image = image.resize((28, 28)) # Resize to 28x28
    
    img_array = np.array(image)

    # Invert logic: If background is white and stroke is black (Paint style)
    if np.mean(img_array) > 127:
        img_array = 255 - img_array

    # Scale 0.0 to 1.0 & Reshape for CNN (1, 28, 28, 1)
    img_array = img_array / 255.0
    img_array = img_array.reshape(1, 28, 28, 1)
    return img_array


@api_view(['POST'])
def predict_digit(request):
    if model is None:
        return Response({"error": "CNN Model is not loaded on server."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        # Case 1: Base64 String image (React Canvas-la irundhu varradhu)
        if 'image_base64' in request.data:
            base64_str = request.data['image_base64']
            if ',' in base64_str:
                base64_str = base64_str.split(',')[1] # Remove metadata header
            image_bytes = base64.b64decode(base64_str)

        # Case 2: File Upload (Image file drag-and-drop)
        elif 'file' in request.FILES:
            image_bytes = request.FILES['file'].read()

        else:
            return Response({"error": "No image data provided. Send 'image_base64' or 'file'."}, status=status.HTTP_400_BAD_REQUEST)

        # Preprocess & Predict
        processed_input = preprocess_image(image_bytes)
        predictions = model.predict(processed_input)[0] # Array of 10 probabilities

        predicted_digit = int(np.argmax(predictions))
        confidence = float(predictions[predicted_digit] * 100)

        # Return Clean JSON Response
        return Response({
            "predicted_digit": predicted_digit,
            "confidence": round(confidence, 2),
            "all_probabilities": [round(float(p) * 100, 2) for p in predictions]
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)