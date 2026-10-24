---
order: 30
---

## An iOS build

Build for the simulator with signing off, and keep the build inside the folder:
`xcodebuild -workspace <name>.xcworkspace -scheme <scheme> -configuration Debug -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO build`,
with -project <name>.xcodeproj when there is no workspace. `xcodebuild -list` names the schemes.
The .app lands in build/Build/Products/Debug-iphonesimulator/.

- React Native and Expo: install the packages, then `pod install` in the ios folder, and build the
  Release configuration, which carries the JavaScript inside the app. Expo with no ios folder
  runs `npx expo prebuild --platform ios --no-install` before that.
- Flutter: `flutter build ios --simulator --debug`. The .app lands in build/ios/iphonesimulator/.
