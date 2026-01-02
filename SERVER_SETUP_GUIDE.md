# 🚀 Server Setup Guide - Eczema Care Application

Complete step-by-step guide to run all three servers: **FastAPI (AI Model)**, **Node.js Backend**, and **React Frontend**.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **Python 3.12+** with virtual environment support
- ✅ **Node.js 18+** and **npm**
- ✅ **MongoDB** running (local or cloud)
- ✅ **Git** (if cloning the repository)

---

## 🎯 Quick Start (All Servers)

### Option 1: Run All Servers in Separate Terminals (Recommended)

Open **3 separate terminal windows/tabs** and run each server:

#### Terminal 1: FastAPI (AI Model Service)
```bash
cd /home/abdur-raffay/Music/Junaid-Skin-Disease-Image-FYP/Ai-Model-Working
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
✅ Model loaded successfully
✅ All services initialized successfully
```

**Service URL:** `http://localhost:8000`
**API Docs:** `http://localhost:8000/docs`

---

#### Terminal 2: Node.js Backend
```bash
cd /home/abdur-raffay/Music/Junaid-Skin-Disease-Image-FYP/backend
npm run dev
```

**Expected Output:**
```
🚀 Server running on 0.0.0.0:3000
🌍 Environment: development
📡 API Base URL: http://localhost:3000/api
✅ MongoDB connected
```

**Service URL:** `http://localhost:3000`
**API Base:** `http://localhost:3000/api`

---

#### Terminal 3: React Frontend
```bash
cd /home/abdur-raffay/Music/Junaid-Skin-Disease-Image-FYP/frontend-website
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Service URL:** `http://localhost:5173`

---

## 📝 Detailed Setup Instructions

### 1️⃣ FastAPI Server (AI Model Service)

#### Step 1: Navigate to AI Model Directory
```bash
cd /home/abdur-raffay/Music/Junaid-Skin-Disease-Image-FYP/Ai-Model-Working
```

#### Step 2: Activate Virtual Environment
```bash
source venv/bin/activate
```

**Note:** If virtual environment doesn't exist, create it:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Step 3: Configure Environment Variables (Optional)
Create a `.env` file in `Ai-Model-Working/` directory:
```env
# Optional: Google Gemini API Key for LLM explanations
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemma-3-27b-it

# Optional: Model Configuration
MODEL_PATH=models/eczema_detector_efficientnet.h5
MODEL_INPUT_SIZE=224
```

**Note:** The service will run without `GEMINI_API_KEY`, but LLM explanations will be disabled.

#### Step 4: Verify Model File Exists
Ensure the model file is present:
```bash
ls models/eczema_detector_efficientnet.h5
```

If missing, the service will start but model inference will be unavailable.

#### Step 5: Start FastAPI Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Flags:**
- `--host 0.0.0.0`: Listen on all network interfaces (for mobile access)
- `--port 8000`: Port number
- `--reload`: Auto-reload on code changes (development mode)

**Alternative (without reload):**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### Step 6: Verify FastAPI is Running
```bash
curl http://localhost:8000/health
```

Or open in browser: `http://localhost:8000/docs`

---

### 2️⃣ Node.js Backend Server

#### Step 1: Navigate to Backend Directory
```bash
cd /home/abdur-raffay/Music/Junaid-Skin-Disease-Image-FYP/backend
```

#### Step 2: Install Dependencies
```bash
npm install
```

**Note:** This only needs to be done once or when `package.json` changes.

#### Step 3: Configure Environment Variables
Create a `.env` file in `backend/` directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/eczema-care

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
MOBILE_URL=http://localhost:8080

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Required Variables:**
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (minimum 32 characters)

#### Step 4: Ensure MongoDB is Running
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or start MongoDB
sudo systemctl start mongod
```

**Alternative:** Use MongoDB Atlas (cloud) and update `MONGO_URI` accordingly.

#### Step 5: Start Backend Server
```bash
npm run dev
```

**Scripts:**
- `npm run dev`: Development mode with auto-reload (nodemon)
- `npm start`: Production mode (no auto-reload)

#### Step 6: Verify Backend is Running
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{"success":true,"message":"Server is running","timestamp":"..."}
```

---

### 3️⃣ React Frontend (Website)

#### Step 1: Navigate to Frontend Directory
```bash
cd /home/abdur-raffay/Music/Junaid-Skin-Disease-Image-FYP/frontend-website
```

#### Step 2: Install Dependencies
```bash
npm install
```

**Note:** This only needs to be done once or when `package.json` changes.

#### Step 3: Configure Environment Variables (Optional)
Create a `.env` file in `frontend-website/` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

**Note:** If not set, the app will use the default API URL from `src/config/api.ts`.

#### Step 4: Start Development Server
```bash
npm run dev
```

**Scripts:**
- `npm run dev`: Development server with HMR
- `npm run build`: Build for production
- `npm run preview`: Preview production build

#### Step 5: Verify Frontend is Running
Open browser: `http://localhost:5173`

---

## 🔍 Troubleshooting

### Port Already in Use

If you see `EADDRINUSE: address already in use`:

**Find and kill the process:**
```bash
# For port 8000 (FastAPI)
lsof -ti:8000 | xargs kill -9

# For port 3000 (Backend)
lsof -ti:3000 | xargs kill -9

# For port 5173 (Frontend)
lsof -ti:5173 | xargs kill -9
```

**Or kill all at once:**
```bash
lsof -ti:8000,3000,5173 | xargs kill -9
```

---

### FastAPI File Watch Limit Error

If you see `OSError: OS file watch limit reached`:

**Increase the file watch limit:**
```bash
sudo sysctl -w fs.inotify.max_user_watches=524288
```

**Make it permanent:**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Or run without reload:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

### FastAPI Syntax Errors

If you see `SyntaxError` in FastAPI:

1. Check Python version: `python3 --version` (should be 3.12+)
2. Verify virtual environment is activated: `which python`
3. Check file syntax: `python3 -m py_compile app/main.py`

---

### MongoDB Connection Error

If backend fails to connect to MongoDB:

1. **Check if MongoDB is running:**
   ```bash
   sudo systemctl status mongod
   ```

2. **Start MongoDB:**
   ```bash
   sudo systemctl start mongod
   ```

3. **Verify connection string in `.env`:**
   ```env
   MONGO_URI=mongodb://localhost:27017/eczema-care
   ```

4. **Test MongoDB connection:**
   ```bash
   mongosh mongodb://localhost:27017/eczema-care
   ```

---

### Backend Dependencies Missing

If you see `Module not found` errors:

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

---

### Frontend Dependencies Missing

If you see `Module not found` errors:

```bash
cd frontend-website
rm -rf node_modules package-lock.json
npm install
```

---

### FastAPI Model Not Loading

If you see `⚠️ Warning: Model file not found`:

1. **Check if model file exists:**
   ```bash
   ls -lh Ai-Model-Working/models/eczema_detector_efficientnet.h5
   ```

2. **If missing, the service will still start but inference will be unavailable.**

---

### CORS Errors in Browser

If you see CORS errors:

1. **Check backend `.env` file:**
   ```env
   FRONTEND_URL=http://localhost:5173
   MOBILE_URL=http://localhost:8080
   ```

2. **Restart backend server after updating `.env`**

---

## ✅ Verification Checklist

After starting all servers, verify they're running:

### 1. FastAPI (Port 8000)
```bash
curl http://localhost:8000/health
# Or visit: http://localhost:8000/docs
```

### 2. Backend (Port 3000)
```bash
curl http://localhost:3000/health
# Expected: {"success":true,"message":"Server is running",...}
```

### 3. Frontend (Port 5173)
```bash
curl http://localhost:5173
# Or open in browser: http://localhost:5173
```

---

## 🎯 Server URLs Summary

| Service | URL | Port | Status Endpoint |
|---------|-----|------|----------------|
| **FastAPI** | http://localhost:8000 | 8000 | `/health` |
| **Backend** | http://localhost:3000 | 3000 | `/health` |
| **Frontend** | http://localhost:5173 | 5173 | `/` |

---

## 📱 Mobile App (React Native)

To run the mobile app, see: `frontend-mobile-react-native-app/README.md`

**Quick Start:**
```bash
cd frontend-mobile-react-native-app
npm install
npx expo start --clear
```

---

## 🔄 Restarting Servers

### Stop All Servers
Press `Ctrl+C` in each terminal window.

### Restart All Servers
Follow the "Quick Start" section above in order:
1. FastAPI
2. Backend
3. Frontend

---

## 📚 Additional Resources

- **FastAPI Docs:** http://localhost:8000/docs
- **Backend API:** http://localhost:3000/api
- **Frontend:** http://localhost:5173

---

## 🆘 Need Help?

1. Check the **Troubleshooting** section above
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check server logs for error messages
5. Verify ports are not in use by other applications

---

**Last Updated:** January 2025

