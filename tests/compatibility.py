"""Verify native OpenCode v1/v2 loading with isolated state and an offline SAIA fixture."""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


def verify(binary, root, source):
    config_dir = root / 'config/opencode'
    (config_dir / 'plugins').mkdir(parents=True)
    (root / 'project').mkdir()
    config_file = config_dir / 'opencode.json'
    config_file.write_text(json.dumps({'$schema': 'https://opencode.ai/config.json', 'autoupdate': False}))
    marker = root / 'catalog-requests.jsonl'
    original_path = 'const CONFIG = path.join(os.homedir(), ".config", "opencode", "opencode.json")'
    assert original_path in source, 'Update the test config-path adapter for the plugin source'
    text = source.replace(original_path, 'const CONFIG = path.join(process.env.XDG_CONFIG_HOME!, "opencode", "opencode.json")', 1)
    # The transport fixture leaves native plugin loading and both entry points intact.
    text += f'''
const compatibilityMarker = {json.dumps(str(marker))}
const originalFetch = globalThis.fetch
globalThis.fetch = async (...args: Parameters<typeof fetch>) => {{
  if (String(args[0]) !== ENDPOINT) return originalFetch(...args)
  await fs.appendFile(compatibilityMarker, "catalog-request\\n")
  return new Response(JSON.stringify({{data:[{{id:"compatibility-test-model"}}]}}), {{headers:{{"content-type":"application/json"}}}})
}}
'''
    (config_dir / 'plugins/saia.ts').write_text(text)
    env = {key: value for key, value in os.environ.items()
           if not key.startswith(('XDG_', 'OPENCODE_', 'HERDR_')) and key != 'SAIA_API_KEY'}
    for name, folder in [('XDG_CONFIG_HOME', 'config'), ('XDG_DATA_HOME', 'data'),
                         ('XDG_CACHE_HOME', 'cache'), ('XDG_STATE_HOME', 'state')]:
        env[name] = str(root / folder)
    # This placeholder is consumed only by the offline transport fixture.
    env['SAIA_API_KEY'] = 'offline-compatibility-test'

    def run(*args):
        result = subprocess.run([binary, *args], env=env, cwd=root / 'project',
                                capture_output=True, text=True, timeout=90)
        assert result.returncode == 0, result.stdout + result.stderr
        return result.stdout

    reported = run('--version').strip()
    match = re.search(r'(\d+\.\d+\.\d+)', reported)
    assert match, 'Unrecognized OpenCode version: ' + reported
    version = match.group(1)
    args = ['models'] + (['--standalone'] if int(version.split('.')[0]) >= 2 else [])
    run(*args)
    config = json.loads(config_file.read_text())
    assert marker.exists(), 'Native loader did not invoke SAIA discovery'
    assert 'compatibility-test-model' in config.get('provider', {}).get('saia', {}).get('models', {})
    modified = config_file.stat().st_mtime_ns
    output = run(*args)
    assert 'saia/compatibility-test-model' in output, 'Persisted catalog missing on next launch'
    assert len(marker.read_text().splitlines()) >= 2, 'Second launch did not refresh discovery'
    assert config_file.stat().st_mtime_ns == modified, 'Unchanged catalog rewrote the config'
    print(f'PASS OpenCode {version}: native load, discovery, next-launch catalog, unchanged-write guard', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('binaries', nargs='+', help='Paths or command names for OpenCode release binaries')
    arguments = parser.parse_args()
    source = (Path(__file__).resolve().parents[1] / 'src/saia.ts').read_text()
    with tempfile.TemporaryDirectory(prefix='saia-opencode-compat-') as directory:
        for index, value in enumerate(arguments.binaries):
            binary = shutil.which(value)
            assert binary, 'OpenCode binary not found: ' + value
            verify(str(Path(binary).resolve()), Path(directory) / str(index), source)


if __name__ == '__main__':
    main()
