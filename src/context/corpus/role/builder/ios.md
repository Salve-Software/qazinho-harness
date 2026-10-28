---
order: 30
---

## Um build de iOS

Construa para o simulador com a assinatura desligada, e mantenha o build dentro da pasta:
`xcodebuild -workspace <name>.xcworkspace -scheme <scheme> -configuration Debug -sdk iphonesimulator -derivedDataPath build CODE_SIGNING_ALLOWED=NO build`,
com -project <name>.xcodeproj quando não houver workspace. O `xcodebuild -list` nomeia os schemes.
O .app cai em build/Build/Products/Debug-iphonesimulator/.

- React Native e Expo: instale os pacotes, depois `pod install` na pasta ios, e construa a
  configuração Release, que leva o JavaScript dentro do app. Expo sem a pasta ios roda
  `npx expo prebuild --platform ios --no-install` antes disso.
- Flutter: `flutter build ios --simulator --debug`. O .app cai em build/ios/iphonesimulator/.
