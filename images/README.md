# The CI's machines

QAzinho's API starts one machine per CI job at Namespace, and the runner (`dist/runner.js`) walks
the job on it, keeping the API's `docs/runner-protocol.md`. Two images hold the runner:

| Image    | Runs                                 | Holds                                                     |
| -------- | ------------------------------------ | --------------------------------------------------------- |
| `linux/` | web and Android jobs, as a container | Node, Google Chrome, ffmpeg, the Android SDK and an AVD   |
| `macos/` | iOS jobs, as a Mac application       | the runner and a Node for macOS; Xcode and idb on the Mac |

Both build from the harness's root, so the runner is the code this repository tests:

```sh
docker buildx build --platform linux/amd64 -f images/linux/Dockerfile -t nscr.io/<workspace>/qazinho-runner-linux:<version> --push .
docker buildx build --platform linux/amd64 -f images/macos/Dockerfile -t nscr.io/<workspace>/qazinho-runner-macos:<version> --push .
```

The API reads them as `CI_RUNNER_IMAGE_LINUX` and `CI_RUNNER_IMAGE_MACOS`. `images/runner/` pins
what the runner needs at run time to the versions the harness is built and tested against; lift
them with the harness's own.

- **Android** runs its emulator on KVM: the API starts an Android job's container privileged, with
  nested virtualization, and the image names its AVD in `QAZINHO_AVD`.
- **iOS** needs idb on the Mac (`idb_companion` from Homebrew and the `fb-idb` client), found on
  `PATH` or at `QAZINHO_IDB`; the runner names what is missing when it is not there.
- **A browser is recorded** through the image's ffmpeg; a machine without one walks unrecorded.
