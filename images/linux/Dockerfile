FROM node:22-bookworm AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:22-bookworm AS deps
WORKDIR /opt/qazinho
COPY images/runner/package.json ./
RUN npm install --omit=dev --ignore-scripts

FROM node:22-bookworm
ARG ANDROID_API=35
ARG ANDROID_TOOLS=13114758
ENV ANDROID_HOME=/opt/android \
    QAZINHO_AVD=qazinho \
    QAZINHO_WORK_DIR=/tmp/qazinho

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl gnupg ffmpeg unzip openjdk-17-jre-headless \
      libpulse0 libgl1 libnss3 libxcomposite1 libxcursor1 libxi6 libxtst6 \
 && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub \
      | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
 && echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main' \
      > /etc/apt/sources.list.d/google-chrome.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends google-chrome-stable \
 && rm -rf /var/lib/apt/lists/*

RUN mkdir -p $ANDROID_HOME/cmdline-tools \
 && curl -fsSL -o /tmp/tools.zip https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_TOOLS}_latest.zip \
 && unzip -q /tmp/tools.zip -d $ANDROID_HOME/cmdline-tools \
 && mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest \
 && rm /tmp/tools.zip \
 && yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null \
 && $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager \
      "platform-tools" "emulator" "build-tools;${ANDROID_API}.0.0" \
      "system-images;android-${ANDROID_API};google_apis;x86_64" \
 && echo no | $ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
      --name $QAZINHO_AVD --package "system-images;android-${ANDROID_API};google_apis;x86_64" --device pixel_6

WORKDIR /opt/qazinho
COPY --from=deps /opt/qazinho/node_modules ./node_modules
COPY --from=build /src/dist ./dist
COPY images/runner/package.json ./package.json

ENTRYPOINT ["node", "/opt/qazinho/dist/runner.js"]
