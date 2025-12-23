# ---------------------------
# Step 0: Import libraries
# ---------------------------
import os
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ---------------------------
# Step 1: Dataset paths
# ---------------------------
DATASET_PATH = "/kaggle/input/eczema2/dataset"

eczema_folder = os.path.join(DATASET_PATH, "Eczema")
normal_folder = os.path.join(DATASET_PATH, "Normal")

# ---------------------------
# Step 2: Load images & labels
# ---------------------------
IMG_SIZE = 128

def load_images(folder, label):
    images = []
    labels = []
    for file in os.listdir(folder):
        img_path = os.path.join(folder, file)
        try:
            img = Image.open(img_path).convert("RGB")
            img = img.resize((IMG_SIZE, IMG_SIZE))
            img_array = np.array(img) / 255.0
            images.append(img_array)
            labels.append(label)
        except:
            pass
    return images, labels

# Load Eczema images
eczema_images, eczema_labels = load_images(eczema_folder, 1)

# Load Normal images
normal_images, normal_labels = load_images(normal_folder, 0)

# Combine
X = np.array(eczema_images + normal_images)
y = np.array(eczema_labels + normal_labels)

print("Dataset shape:", X.shape, y.shape)

# ---------------------------
# Step 3: Split train/test
# ---------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print("Train shape:", X_train.shape, y_train.shape)
print("Test shape:", X_test.shape, y_test.shape)

# ---------------------------
# Step 4: Data Augmentation
# ---------------------------
datagen = ImageDataGenerator(
    rotation_range=20,
    width_shift_range=0.1,
    height_shift_range=0.1,
    horizontal_flip=True
)
datagen.fit(X_train)

# ---------------------------
# Step 5: Build CNN model
# ---------------------------
model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
    MaxPooling2D(2,2),
    
    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    
    Conv2D(128, (3,3), activation='relu'),
    MaxPooling2D(2,2),
    
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(1, activation='sigmoid')  # Binary classification
])

model.compile(optimizer=Adam(0.001), loss='binary_crossentropy', metrics=['accuracy'])
model.summary()

# ---------------------------
# Step 6: Train the model
# ---------------------------
EPOCHS = 10  # reduce if CPU is slow
BATCH_SIZE = 16

history = model.fit(
    datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
    validation_data=(X_test, y_test),
    epochs=EPOCHS
)

# ---------------------------
# Step 7: Save the model
# ---------------------------
model.save("eczema_classifier.h5")
print("Model saved as eczema_classifier.h5")

# ---------------------------
# Step 8: Prediction function
# ---------------------------
def predict_eczema_custom(img_path):
    img = Image.open(img_path).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    img_array = np.array(img)/255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    prob = float(model.predict(img_array)[0][0])
    if prob > 0.85:
        severity = "High"
    elif prob > 0.55:
        severity = "Moderate"
    elif prob > 0.25:
        severity = "Low"
    else:
        severity = "Very Low"
    
    if prob >= 0.25:  # threshold for Eczema detection
        return {"is_eczema": True, "severity": severity, "confidence": prob}
    else:
        return {"is_eczema": False, "other_condition": "Normal", "confidence": 1-prob}

# ---------------------------
# Step 9: Test predictions
# ---------------------------
# Pick first eczema image
test_eczema = os.path.join(eczema_folder, os.listdir(eczema_folder)[0])
print("Eczema test:", predict_eczema_custom(test_eczema))

# Pick first normal image
test_normal = os.path.join(normal_folder, os.listdir(normal_folder)[0])
print("Normal test:", predict_eczema_custom(test_normal))

# ---------------------------
# Step 10 (Optional): Plot training history
# ---------------------------
plt.figure(figsize=(12,4))
plt.subplot(1,2,1)
plt.plot(history.history['accuracy'], label='train')
plt.plot(history.history['val_accuracy'], label='val')
plt.title("Accuracy")
plt.legend()

plt.subplot(1,2,2)
plt.plot(history.history['loss'], label='train')
plt.plot(history.history['val_loss'], label='val')
plt.title("Loss")
plt.legend()

plt.show()
