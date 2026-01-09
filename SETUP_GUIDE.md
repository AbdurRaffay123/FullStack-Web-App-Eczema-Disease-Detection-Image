# 🚀 Complete Setup Guide - Eczema Care Application

This guide will help you set up and run the entire Eczema Care application on your local computer, even if you're not familiar with programming.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Clone the Repository](#step-1-clone-the-repository)
3. [Step 2: Install MongoDB](#step-2-install-mongodb)
4. [Step 3: Set Up Backend](#step-3-set-up-backend)
5. [Step 4: Set Up AI Model Service](#step-4-set-up-ai-model-service)
6. [Step 5: Set Up Frontend Website](#step-5-set-up-frontend-website)
7. [Step 6: Run All Services](#step-6-run-all-services)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before starting, make sure you have these installed on your computer:

### Required Software:

1. **Git** - For downloading the code
   - **Windows**: Download from [https://git-scm.com/download/win](https://git-scm.com/download/win)
   - **Mac**: Install via Homebrew: `brew install git` or download from [https://git-scm.com/download/mac](https://git-scm.com/download/mac)
   - **Linux**: `sudo apt-get install git` (Ubuntu/Debian) or `sudo yum install git` (CentOS/RHEL)

2. **Node.js** (version 18 or higher) - For running the backend and frontend
   - Download from [https://nodejs.org/](https://nodejs.org/)
   - After installation, verify by opening terminal/command prompt and typing: `node --version`
   - You should see something like `v18.x.x` or higher

3. **Python 3.8 or higher** - For running the AI model service
   - **Windows/Mac**: Download from [https://www.python.org/downloads/](https://www.python.org/downloads/)
   - **Linux**: Usually pre-installed. Check with: `python3 --version`
   - ⚠️ **Important**: During installation on Windows, check "Add Python to PATH"

4. **MongoDB** - Database for storing application data
   - See [Step 2: Install MongoDB](#step-2-install-mongodb) for detailed instructions

5. **Google Gemini API Key** - For AI analysis
   - Get it from: [https://aistudio.google.com/app](https://aistudio.google.com/app)
   - Sign in with your Google account
   - Create a new API key
   - Copy and save it for later use

---

## 📥 Step 1: Clone the Repository

This step downloads the project code to your computer.

### Option A: Using Git (Recommended)

1. Open **Terminal** (Mac/Linux) or **Command Prompt** / **Git Bash** (Windows)

2. Navigate to where you want to save the project (e.g., Desktop or Documents):
   ```bash
   cd ~/Desktop
   # or
   cd ~/Documents
   ```

3. Clone the repository:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   ```
   Replace `<YOUR_GITHUB_REPO_URL>` with your actual GitHub repository URL.

4. Navigate into the project folder:
   ```bash
   cd Junaid-Skin-Disease-Image-FYP
   ```

### Option B: Download as ZIP

1. Go to your GitHub repository
2. Click the green **"Code"** button
3. Select **"Download ZIP"**
4. Extract the ZIP file to your desired location
5. Open terminal/command prompt in the extracted folder

---

## 🗄️ Step 2: Install MongoDB

MongoDB is the database that stores all your application data.

### Windows:

1. Download MongoDB Community Server from: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. Click "Install"
6. MongoDB will start automatically

### Mac:

1. Install using Homebrew:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```
2. Start MongoDB:
   ```bash
   brew services start mongodb-community
   ```

### Linux (Ubuntu/Debian):

1. Import MongoDB GPG key:
   ```bash
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. Add MongoDB repository:
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. Install MongoDB:
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. Start MongoDB:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

### Verify MongoDB is Running:

Open terminal and type:
```bash
mongosh
```

If you see MongoDB shell prompt, you're good! Type `exit` to leave.

---

## 🔧 Step 3: Set Up Backend

The backend is the server that handles all API requests.

### 3.1 Navigate to Backend Folder

```bash
cd backend
```

### 3.2 Install Dependencies

```bash
npm install
```

This will take a few minutes. Wait for it to complete.

### 3.3 Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor (Notepad, VS Code, etc.)

3. Fill in the following values:

   ```env
   PORT=3000
   NODE_ENV=development
   
   # MongoDB connection (for local MongoDB, use this):
   MONGO_URI=mongodb://localhost:27017/eczema-care
   
   # Generate a random secret key (at least 32 characters)
   # You can use this command to generate one:
   # openssl rand -base64 32
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-this
   
   # Optional: Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Important**: Replace `your-super-secret-jwt-key-minimum-32-characters-long-change-this` with a random string. You can generate one using:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as your `JWT_SECRET`.

5. Save the file.

### 3.4 Test Backend Setup

The backend is now configured! We'll start it in [Step 6](#step-6-run-all-services).

---

## 🤖 Step 4: Set Up AI Model Service

This service handles the AI image analysis using machine learning.

### 4.1 Navigate to AI Model Folder

```bash
cd ../Ai-Model-Working
```

### 4.2 Create Python Virtual Environment

This creates an isolated Python environment for the project:

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the beginning of your terminal prompt.

### 4.3 Install Python Dependencies

```bash
pip install -r requirements.txt
```

This will take several minutes. Wait for it to complete.

### 4.4 Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor

3. Fill in your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your-actual-gemini-api-key-here
   ```

4. Replace `your-actual-gemini-api-key-here` with the API key you got from [https://aistudio.google.com/app](https://aistudio.google.com/app)

5. Save the file.

### 4.5 Verify Model File Exists

Make sure the model file is in the correct location:
```bash
ls models/eczema_detector_efficientnet.h5
```

If the file doesn't exist, you'll need to add it to the `models/` folder.

### 4.6 Test AI Model Setup

The AI model service is now configured! We'll start it in [Step 6](#step-6-run-all-services).

---

## 🎨 Step 5: Set Up Frontend Website

The frontend is the web interface users interact with.

### 5.1 Navigate to Frontend Folder

```bash
cd ../frontend-website
```

### 5.2 Install Dependencies

```bash
npm install
```

This will take a few minutes. Wait for it to complete.

### 5.3 Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in a text editor

3. The file should contain:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. If your backend runs on a different port, change `3000` to that port number.

5. Save the file.

### 5.4 Test Frontend Setup

The frontend is now configured! We'll start it in [Step 6](#step-6-run-all-services).

---

## 🚀 Step 6: Run All Services

Now we'll start all three services. You'll need **3 separate terminal windows/tabs**.

### Terminal 1: Start MongoDB (if not running as service)

**Skip this if MongoDB is already running as a service (Windows/Systemd).**

**Mac (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Terminal 1: Start Backend Server

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   ✅ MongoDB Connected: localhost
   🚀 Server running on 0.0.0.0:3000
   ```

4. **Keep this terminal open!** The server must keep running.

### Terminal 2: Start AI Model Service

1. Navigate to AI model folder:
   ```bash
   cd Ai-Model-Working
   ```

2. Activate virtual environment:
   ```bash
   # Windows:
   venv\Scripts\activate
   
   # Mac/Linux:
   source venv/bin/activate
   ```

3. Start the AI service:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. You should see:
   ```
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```

5. **Keep this terminal open!** The service must keep running.

### Terminal 3: Start Frontend Website

1. Navigate to frontend folder:
   ```bash
   cd frontend-website
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ```

4. **Keep this terminal open!** The server must keep running.

### ✅ Access the Application

1. Open your web browser
2. Go to: **http://localhost:5173**
3. You should see the Eczema Care application!

---

## 🔍 Troubleshooting

### Problem: "Command not found: node" or "Command not found: npm"

**Solution**: Node.js is not installed or not in your PATH. Reinstall Node.js and make sure to check "Add to PATH" during installation.

---

### Problem: "MongoDB connection failed"

**Solutions**:
1. Make sure MongoDB is running:
   - **Windows**: Check Services (search "Services" in Start menu, look for MongoDB)
   - **Mac**: `brew services list` (should show mongodb-community as started)
   - **Linux**: `sudo systemctl status mongod`

2. Check your `MONGO_URI` in `backend/.env` is correct:
   ```
   MONGO_URI=mongodb://localhost:27017/eczema-care
   ```

---

### Problem: "GEMINI_API_KEY not found" or AI analysis fails

**Solutions**:
1. Make sure you created `.env` file in `Ai-Model-Working/` folder
2. Check that `GEMINI_API_KEY` is set correctly in the `.env` file
3. Verify your API key is valid at [https://aistudio.google.com/app](https://aistudio.google.com/app)

---

### Problem: "Port 3000 already in use" (Backend)

**Solution**: Another application is using port 3000. Either:
1. Stop the other application, OR
2. Change the port in `backend/.env`:
   ```
   PORT=3001
   ```
   Then update `frontend-website/.env`:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```

---

### Problem: "Port 8000 already in use" (AI Model)

**Solution**: Change the port in `Ai-Model-Working/.env`:
```
FASTAPI_PORT=8001
```
Then update `backend/src/services/image.service.js` to use port 8001.

---

### Problem: "Port 5173 already in use" (Frontend)

**Solution**: Vite will automatically use the next available port (5174, 5175, etc.). Just use the new URL shown in the terminal.

---

### Problem: "Module not found" errors

**Solutions**:
1. Make sure you ran `npm install` in the correct folder
2. Delete `node_modules` folder and `package-lock.json`, then run `npm install` again
3. For Python errors, make sure virtual environment is activated and run `pip install -r requirements.txt` again

---

### Problem: Frontend can't connect to backend

**Solutions**:
1. Make sure backend is running (check Terminal 1)
2. Verify `VITE_API_URL` in `frontend-website/.env` matches backend port:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```
3. Check browser console (F12) for specific error messages

---

### Problem: AI analysis returns errors

**Solutions**:
1. Make sure AI model service is running (check Terminal 2)
2. Verify `GEMINI_API_KEY` is set correctly
3. Check that model file exists: `Ai-Model-Working/models/eczema_detector_efficientnet.h5`
4. Check Terminal 2 for error messages

---

## 📝 Quick Reference: All Commands

### First Time Setup:
```bash
# 1. Clone repository
git clone <YOUR_REPO_URL>
cd Junaid-Skin-Disease-Image-FYP

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env file with your values

# 3. AI Model setup
cd ../Ai-Model-Working
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env file with GEMINI_API_KEY

# 4. Frontend setup
cd ../frontend-website
npm install
cp .env.example .env
# Edit .env file if needed
```

### Running Services (Every Time):
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: AI Model
cd Ai-Model-Working
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 3: Frontend
cd frontend-website
npm run dev
```

---

## 🎉 Success!

If you can access the application at `http://localhost:5173` and everything is working, congratulations! You've successfully set up the Eczema Care application.

---

## 📞 Need Help?

If you encounter issues not covered in this guide:
1. Check the error messages in your terminal
2. Verify all environment variables are set correctly
3. Make sure all services are running
4. Check that MongoDB is running
5. Review the troubleshooting section above

---

**Last Updated**: January 2025



