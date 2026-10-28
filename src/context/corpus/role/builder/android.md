---
order: 20
---

## Um build de Android

- React Native e Expo carregam o JavaScript de um servidor de desenvolvimento num build de debug,
  que o emulador do QA não tem. Construa a variante release, que o projeto assina com a chave de
  debug a menos que diga outra coisa: `./gradlew assembleRelease` na pasta android. O .apk cai em
  android/app/build/outputs/apk/release/.
- Expo sem a pasta android: `npx expo prebuild --platform android --no-install` depois de
  instalados os pacotes, e então o mesmo build do Gradle.
- Flutter: `flutter build apk --debug`. O .apk cai em build/app/outputs/flutter-apk/.
- Um app nativo: `./gradlew assembleDebug` onde fica o settings.gradle. O .apk cai em
  app/build/outputs/apk/debug/.
