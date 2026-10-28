import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const watch = process.argv.includes('--watch');

mkdirSync(dist, { recursive: true });
mkdirSync(join(dist, 'icons'), { recursive: true });

function copyStatic() {
  cpSync(join(root, 'manifest.json'), join(dist, 'manifest.json'));
  cpSync(join(root, 'src', 'popup.html'), join(dist, 'popup.html'));
  cpSync(join(root, 'src', 'options.html'), join(dist, 'options.html'));
  cpSync(join(root, 'src', 'popup.css'), join(dist, 'popup.css'));
  cpSync(join(root, 'src', 'options.css'), join(dist, 'options.css'));

  const iconsSrc = join(root, 'icons');
  if (existsSync(iconsSrc)) {
    cpSync(iconsSrc, join(dist, 'icons'), { recursive: true });
  }
}

const ctx = await esbuild.context({
  entryPoints: {
    background: join(root, 'src', 'background.ts'),
    popup: join(root, 'src', 'popup.ts'),
    options: join(root, 'src', 'options.ts'),
  },
  bundle: true,
  outdir: dist,
  format: 'esm',
  target: 'chrome120',
  sourcemap: true,
  logLevel: 'info',
});

copyStatic();

if (watch) {
  await ctx.watch();
  console.log('[MuteSound extension] watching…');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('[MuteSound extension] build complete → dist/');
}
