# OpenCode version compatibility

The plugin supports the shared object entry point documented in [OpenCode's V1-to-V2 migration guide](https://opencode.ai/v2/docs/build/plugins/migrate-v1/#support-v1-and-v2-from-one-package).

## Supported versions

- **OpenCode 1.18.29 and newer v1 releases:** the loader calls `server({ client })`. Discovery retains the original background behavior and uses the v1 client for logging.
- **OpenCode 2:** the loader calls `setup()`. Discovery is awaited and does not use a v1 client. Network waiting is limited by the existing three-second fetch timeout.
- **OpenCode before 1.18.29:** unsupported by this shared object entry point. Those releases require a separate legacy package version or entry point. Exporting a bare v1 function again would make the file unloadable in v2.

Both entry points call the same refresh function. A failed discovery keeps the existing catalog. The plugin still writes the supported v1-shaped provider configuration; OpenCode 2 normalizes that configuration when reading it. This does not migrate the rest of a user's configuration.

## Installation and refresh behavior

Place `saia.ts` in `~/.config/opencode/plugins/`. Supported v1 and v2 releases discover the file automatically. The installers no longer add an explicit `"./saia"` registration, because v2's configured local paths must point to directories.

For an existing installation, remove only that old entry from `plugin` or `plugins` and retain unrelated entries. Plugin configuration and plugin implementation APIs are separate compatibility concerns.

Discovery persists the model catalog to the global JSON config. Restart OpenCode to use newly discovered models. The plugin skips writing identical content so v2's config watcher does not repeatedly reload an unchanged catalog. It does not provide an in-memory provider transform or a periodic refresh timer.

## Validation and its limits

Native plugin loading and model discovery passed with OpenCode **1.18.29**, **1.19.5**, and **2.2.0** on Linux x64. The tests use the real release binaries, isolated data/config directories, and an offline SAIA catalog fixture. They verify that the loader invokes discovery, that the generated catalog is available on the next launch, and that an unchanged catalog does not rewrite the config.

These tests do not use real credentials or make inference requests. They do not establish compatibility with every intermediate release, Windows, macOS, or every SAIA model's tools and streaming behavior. The PowerShell installer change was reviewed but not executed on Windows.

### Run the checks

Python 3 and the OpenCode binaries to test must already be installed or downloaded. The test never changes the installed OpenCode version or the user's normal configuration:

```sh
python3 tests/compatibility.py /path/to/opencode-1.18.29 /path/to/opencode-1.19.5 /path/to/opencode-2.2.0
```

Each binary's version is detected using `--version`. Test copies redirect the plugin's config destination and intercept only the SAIA `/v1/models` request with a deterministic fixture. The implementation's entry points and the native OpenCode loader are exercised together.
