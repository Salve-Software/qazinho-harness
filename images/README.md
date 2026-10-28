# As máquinas do CI

A API do QAzinho inicia uma máquina por job do CI na Namespace, e o runner (`dist/runner.js`) anda
o job nela, seguindo o `docs/runner-protocol.md` da API. Duas imagens guardam o runner:

| Imagem   | Roda                                  | Guarda                                                 |
| -------- | ------------------------------------- | ------------------------------------------------------ |
| `linux/` | jobs de web e Android, como contêiner | Node, Google Chrome, ffmpeg, o SDK do Android e um AVD |
| `macos/` | jobs de iOS, como aplicativo do Mac   | o runner e um Node para macOS; Xcode e idb no Mac      |

As duas são construídas a partir da raiz do harness, então o runner é o código que este
repositório testa:

```sh
docker buildx build --platform linux/amd64 -f images/linux/Dockerfile -t nscr.io/<workspace>/qazinho-runner-linux:<version> --push .
docker buildx build --platform linux/amd64 -f images/macos/Dockerfile -t nscr.io/<workspace>/qazinho-runner-macos:<version> --push .
```

A API as lê como `CI_RUNNER_IMAGE_LINUX` e `CI_RUNNER_IMAGE_MACOS`. O `images/runner/` fixa o que
o runner precisa na hora de rodar nas versões contra as quais o harness é construído e testado;
suba-as junto com as do harness.

- **O Android** roda o emulador em KVM: a API inicia o contêiner de um job de Android privilegiado,
  com virtualização aninhada, e a imagem nomeia o AVD em `QAZINHO_AVD`.
- **O iOS** precisa do idb no Mac (o `idb_companion` do Homebrew e o cliente `fb-idb`), achado no
  `PATH` ou em `QAZINHO_IDB`; o runner diz o que falta quando não está lá.
- **Um navegador é gravado** pelo ffmpeg da imagem; uma máquina sem ele anda sem gravar.
