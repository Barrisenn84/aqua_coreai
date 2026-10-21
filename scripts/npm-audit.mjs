import { spawnSync } from 'node:child_process';

const environment = { ...process.env };
delete environment.npm_config_allow_scripts;

const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('npm_execpath não está disponível.');

const result = spawnSync(
  process.execPath,
  [npmCli, 'audit', '--audit-level=high', '--ignore-scripts'],
  { env: environment, stdio: 'inherit' }
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
