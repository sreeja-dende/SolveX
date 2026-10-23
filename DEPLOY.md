# 🚀 Deploying SolveX (Build for Bharat submission)

| Piece | Where | Cost |
|---|---|---|
| Database | MongoDB Atlas (M0) | Free |
| Backend API | Render Web Service (`solvex-api`) | Free |
| Web app | Render Static Site (`solvex-web`) | Free |
| Mobile app | Expo Go (QR) or EAS APK | Free |

Total time: ~20 minutes.

---

## 1 · MongoDB Atlas (5 min)
1. Sign up at https://www.mongodb.com/cloud/atlas → **Create** → **M0 Free** cluster (region: Mumbai `ap-south-1`).
2. **Database Access** → Add user (e.g. `solvex`) with a password. Avoid `@ : / ?` in the password, or URL-encode them.
3. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`). Render's free tier has no fixed IP, so this is required.
4. **Connect → Drivers** → copy the string and add the DB name `solvex`:
   ```
   mongodb+srv://solvex:<password>@cluster0.xxxxx.mongodb.net/solvex?retryWrites=true&w=majority
   ```

## 2 · Push to GitHub
Commit these changes (`render.yaml`, `DEPLOY.md`, `.env.example` files, and the code edits) to `sreeja-dende/SolveX` on `main`.

## 3 · Render — backend + web in one go (10 min)
1. https://dashboard.render.com → **New → Blueprint** → connect GitHub → pick **SolveX**.
2. Render reads `render.yaml` and shows two services: `solvex-api` and `solvex-web`.
3. When prompted, paste **MONGO_URI** from step 1. Leave `EMAIL_USER` / `EMAIL_PASS` blank unless you want reset-OTP emails (Gmail App Password).
4. Click **Apply**. Wait for both to show **Live**.
5. Check the API: open `https://solvex-api-34k6.onrender.com/api/health` → `{"status":"ok"}`.

> ⚠️ If Render named the API something other than `solvex-api.onrender.com`, update `EXPO_PUBLIC_API_URL` on `solvex-web` (Environment tab) and click **Manual Deploy → Clear cache & deploy**.

## 4 · Create the admin account (once)
Copy `ADMIN_SETUP_KEY` from `solvex-api` → **Environment**, then:
```bash
curl -X POST https://solvex-api-34k6.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@solvex.com","password":"<strong-password>","role":"admin","adminKey":"<ADMIN_SETUP_KEY>"}'
```
Without the key, admin signup is refused (so nobody can make themselves admin on the live site).

## 5 · The app
**Web (the link to submit):** `https://solvex-web.onrender.com`

**Phone via Expo Go (for demo):**
```bash
cd frontend
echo "EXPO_PUBLIC_API_URL=https://solvex-api-34k6.onrender.com/api" > .env
npm install
npx expo start --tunnel
```
Scan the QR with Expo Go. Works on any network — no same-WiFi or IP setup needed.

**Installable APK (optional):**
```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview   # set EXPO_PUBLIC_API_URL in eas.json env or EAS secrets
```

---

## ✅ Pre-submission checklist
- [ ] `/api/health` returns ok
- [ ] Register a student and a startup on the web app
- [ ] Startup posts a challenge → student submits a solution → shows on leaderboard
- [ ] Admin logs in and sees dashboard
- [ ] Hit the API once ~1 min before judging — Render free services sleep after 15 min idle and take ~50 s to wake

## Troubleshooting
| Symptom | Fix |
|---|---|
| API deploy fails: `MongoDB Connection Error` | Wrong MONGO_URI/password, or Atlas Network Access missing `0.0.0.0/0` |
| API deploy fails: `JWT_SECRET is not set` | Add `JWT_SECRET` in Render → Environment |
| Web app: "Network Error" | `EXPO_PUBLIC_API_URL` wrong → fix it, then **Clear cache & deploy** `solvex-web` |
| First request slow | Free-tier cold start; wait ~50 s |
| Page 404 on refresh | Rewrite rule `/* → /index.html` missing on static site |
