FROM --platform=$BUILDPLATFORM node:22-bookworm AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM --platform=$BUILDPLATFORM node:22-bookworm AS deps
WORKDIR /opt/qazinho
COPY images/runner/package.json ./
RUN npm install --omit=dev --ignore-scripts

FROM --platform=$BUILDPLATFORM node:22-bookworm AS node
ARG NODE_VERSION=22.20.0
RUN curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-arm64.tar.gz \
      | tar -xz -C /opt \
 && mv /opt/node-v${NODE_VERSION}-darwin-arm64 /opt/node

FROM scratch
COPY --from=node /opt/node /node
COPY --from=deps /opt/qazinho/node_modules /node_modules
COPY --from=build /src/dist /dist
COPY images/runner/package.json /package.json
COPY images/macos/qazinho-runner /qazinho-runner
