const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(__dirname, 'build-case-bundle.cjs')], {stdio: 'inherit'});
for (const name of fs.readdirSync(path.join(root, 'src')).filter(name => name.endsWith('.js'))) {
  execFileSync(process.execPath, ['--check', path.join(root, 'src', name)], {stdio: 'inherit'});
}
const output = path.join(root, 'dist');
fs.rmSync(output, {recursive: true, force: true});
fs.mkdirSync(output, {recursive: true});
for (const name of ['index.html', 'src', 'data']) {
  fs.cpSync(path.join(root, name), path.join(output, name), {recursive: true});
}
console.log('Prepared dist: index.html, src, data');
