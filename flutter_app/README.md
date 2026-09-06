# MEDIrxCARE Patient Flutter App

Native Flutter Android client for the existing MEDIrxCARE Express API.

## Open in Android Studio

Open the `flutter_app` folder in Android Studio. Let Gradle finish syncing, then select an emulator or connected Android phone and press Run.

## Run from terminal

```bash
cd flutter_app
flutter pub get
flutter run --dart-define=API_URL=http://10.0.2.2:5001/api
```

`10.0.2.2` reaches the host machine from the Android emulator. For a physical phone, use the Mac LAN address, for example `http://192.168.1.3:5001/api`, and keep the phone and Mac on the same Wi-Fi network.

## Build APK

```bash
flutter build apk --debug --dart-define=API_URL=http://10.0.2.2:5001/api
```

The app includes patient login/registration, secure session storage, dashboard, doctor search, appointment booking, queue tracking, AI Care Guide, and logout.

Demo patient: `rohan.verma@example.com` / `Password123!`
