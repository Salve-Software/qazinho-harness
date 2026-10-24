---
order: 20
---

## An Android build

- React Native and Expo load their JavaScript from a dev server in a debug build, which the QA's
  emulator does not have. Build the release variant, which the project signs with the debug key
  unless it says otherwise: `./gradlew assembleRelease` in the android folder. The .apk lands in
  android/app/build/outputs/apk/release/.
- Expo with no android folder: `npx expo prebuild --platform android --no-install` once the
  packages are installed, then the same Gradle build.
- Flutter: `flutter build apk --debug`. The .apk lands in build/app/outputs/flutter-apk/.
- A native app: `./gradlew assembleDebug` where settings.gradle sits. The .apk lands in
  app/build/outputs/apk/debug/.
