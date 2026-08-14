import os
import tensorflow as tf
from tensorflow.keras import layers, models

print("TensorFlow Version:", tf.__version__)

# 1. Dataset Load Pandrom
mnist = tf.keras.datasets.mnist
(X_train, y_train), (X_test, y_test) = mnist.load_data()

# 2. Reshape for CNN (Height, Width, Channel=1 for Grayscale) & Normalization
X_train = X_train.reshape((X_train.shape[0], 28, 28, 1)) / 255.0
X_test = X_test.reshape((X_test.shape[0], 28, 28, 1)) / 255.0

print("Train Data Shape:", X_train.shape)

# 3. High Performance CNN Architecture Design
model = models.Sequential([
    # Feature Extractor Layer 1: Edges & Lines
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),

    # Feature Extractor Layer 2: Shapes & Curves
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    # Dropout to prevent Overfitting
    layers.Dropout(0.25),

    # Classifier Head
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax')
])

model.summary()

# 4. Model Compile
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 5. Model Training (5 Epochs is enough for CNN to reach ~99%)
print("\nTraining CNN Model... ⏳")
model.fit(X_train, y_train, epochs=5, batch_size=64, validation_data=(X_test, y_test))

# 6. Test Evaluation
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=2)
print(f"\n🎯 CNN Test Accuracy: {test_acc * 100:.2f}%")

# 7. Model-a 'saved_models' folder-kulla save pandrom
os.makedirs('saved_models', exist_ok=True)
model_save_path = os.path.join('saved_models', 'digit_cnn_model.keras')
model.save(model_save_path)

print(f"\n🎉 CNN Model saved successfully at: {model_save_path}")