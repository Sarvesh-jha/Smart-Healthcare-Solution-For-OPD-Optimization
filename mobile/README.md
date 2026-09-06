# MEDIrxCARE Patient Mobile App

Expo and React Native patient app for the existing MEDIrxCARE API.

## Run locally

```bash
cp .env.example .env
npm start
```

Use `i` for the iOS simulator or scan the Expo QR code with Expo Go. Set `EXPO_PUBLIC_API_URL` to the backend URL reachable from the device. The Docker backend currently runs at `http://localhost:5001`; a physical phone needs the computer's LAN IP instead.

The app includes patient login and registration, doctor search, online appointment booking, live queue tracking, AI Care Guide, and profile sign out.

Demo patient: `rohan.verma@example.com` / `Password123!`
