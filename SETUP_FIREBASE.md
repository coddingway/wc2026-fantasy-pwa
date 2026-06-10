# Phone Login Setup (Firebase) — 10 minutes

Phone OTP login + cloud save is fully coded. It activates the moment you add
Firebase keys. Until then the app works exactly as before (local-only).

## 1. Create the Firebase project (free)
1. Go to https://console.firebase.google.com → **Add project** → name it `wc2026-fantasy` → disable Analytics → Create.
2. In the project: click the **Web** icon (`</>`) → register app `wc2026-fantasy-pwa` → copy the `firebaseConfig` values.

## 2. Enable Phone Authentication
1. Build → **Authentication** → Get started → **Sign-in method** → enable **Phone**.
2. Settings → **Authorized domains** → add `fantasy.amritpodder.dev` (localhost is pre-added).
3. (Recommended for testing/friends demo) Sign-in method → Phone → **Phone numbers for testing** → add e.g. `+91 9999999999` with code `123456` — logs in without sending a real SMS, costs nothing.

> SMS quota: Firebase's free Spark plan includes a small daily SMS allowance —
> fine for a friends crew. If you ever hit it, test numbers always work.

## 3. Create Firestore + security rules
1. Build → **Firestore Database** → Create database → production mode → region `asia-south1` (Mumbai).
2. **Rules** tab → paste and publish:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
Each user can only ever read/write their own data.

## 4. Add the keys

**Local dev** — create `.env.local` (copy from `.env.local.example`) and fill the 6 values.

**Production (Vercel)** — run each of these and paste the value when prompted:
```bash
npx vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
npx vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
npx vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
npx vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
npx vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
npx vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production
npx vercel deploy --prod --yes
```

## 5. Done — how it works
- **Login:** `/login` → phone number → OTP → in. (Person icon, top-right.)
- **Cloud save:** every change (squad, transfers, captain, boosters, predictions,
  badges, team name) auto-saves to Firestore ~1.5s after the change. No save button.
- **First login migration:** existing local progress is lifted to the cloud automatically — nobody loses anything.
- **Any device:** same phone number = same team everywhere.
- **Logged out:** app still works, data stays local like before.
