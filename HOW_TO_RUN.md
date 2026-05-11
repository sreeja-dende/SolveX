# ✅ SolveX — How to Run (Step by Step)

## BEFORE EVERYTHING — Find Your PC's IP Address
- **Windows**: Open cmd → type `ipconfig` → look for "IPv4 Address" (e.g. 192.168.1.5)
- **Mac/Linux**: Open terminal → type `hostname -I`
- Write this IP down — you need it in Step 3.

---

## STEP 1 — Start MongoDB
```bash
sudo systemctl start mongod
```
If that fails on Windows: Open "Services" → Start "MongoDB"

---

## STEP 2 — Start Backend
```bash
cd SolveX/backend
npm install
npm run dev
```
✅ You must see BOTH lines:
- `✅ MongoDB connected`
- `🚀 SolveX server running on port 5000`

If you see only one — MongoDB is not running. Go back to Step 1.

---

## STEP 3 — Set Your IP in Frontend
Open this file: `frontend/src/utils/api.js`

Change line 13 to your PC's IP from Step 0:
```
export const BASE_URL = 'http://YOUR_IP_HERE:5000/api';
```
Example: `export const BASE_URL = 'http://192.168.1.5:5000/api';`

⚠️ Your phone and PC must be on the SAME WiFi network!

---

## STEP 4 — Start Frontend
Open a NEW terminal (keep backend running):
```bash
cd SolveX/frontend
npm install
npx expo start --clear
```

---

## STEP 5 — Scan QR in Expo Go
- Open Expo Go on your phone
- Tap "Scan QR Code"
- Scan the QR shown in terminal
- App should open! ✅

---

## STEP 6 — Create Admin Account (First Time Only)
Run this in a new terminal:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@solvex.com","password":"admin123","role":"admin"}'
```
Then login with: admin@solvex.com / admin123

---

## ❌ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Red screen on phone | You fixed this already (GestureHandlerRootView added) |
| "Network Error" in app | Wrong IP in api.js, or backend not running |
| "MongoDB connection failed" | Run: sudo systemctl start mongod |
| App loads but login fails | Backend not running or wrong IP |
| QR scan but blank screen | Delete node_modules, run npm install again |
