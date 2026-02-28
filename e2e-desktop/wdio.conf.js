import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
let tauriDriver;
let exit = false;

export const config = {
  host: '127.0.0.1',
  port: 4444,
  specs: ['./specs/**/*.js'],
  maxInstances: 1,
  capabilities: [{
    maxInstances: 1,
    'tauri:options': {
      application: path.resolve(__dirname, '../src-tauri/target/debug/saola'),
    },
  }],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: { ui: 'bdd', timeout: 60000 },
  onPrepare: () => {
    spawnSync('npm', ['run', 'build'], { cwd: path.resolve(__dirname, '..'), stdio: 'inherit', shell: true });
    spawnSync('cargo', ['build'], { cwd: path.resolve(__dirname, '../src-tauri'), stdio: 'inherit', shell: true });
  },
  beforeSession: () => {
    tauriDriver = spawn(path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'), [], { stdio: [null, process.stdout, process.stderr] });
    tauriDriver.on('error', (e) => { console.error('tauri-driver error:', e); process.exit(1); });
    tauriDriver.on('exit', (code) => { if (!exit) { console.error('tauri-driver exited:', code); process.exit(1); } });
  },
  afterSession: () => { exit = true; tauriDriver?.kill(); },
};

function onShutdown(fn) {
  const cleanup = () => { try { fn(); } finally { process.exit(); } };
  ['exit','SIGINT','SIGTERM','SIGHUP','SIGBREAK'].forEach(s => process.on(s, cleanup));
}
onShutdown(() => { exit = true; tauriDriver?.kill(); });
