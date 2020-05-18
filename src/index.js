const path = require('path');
const spawn = require('cross-spawn');
const prompts = require('prompts');

const scripts = getPkgScripts();
if (!scripts || Object.keys(scripts).length === 0) {
  console.log('None of npm script could be found!');
  return;
}

prompts({
  type: 'autocomplete',
  name: 'value',
  message: 'Pick npm script',
  choices: Object.keys(scripts).map((script) => ({
    title: script,
    description: scripts[script],
  })),
}).then(({ value }) => {
  const command = hasYarn() ? 'yarn' : 'npm';
  const args = ['run', value];

  spawn(command, args, { stdio: 'inherit' });
});

function getPkgScripts() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');

  try {
    const { scripts } = require(pkgPath);
    return scripts;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Oops...cannot find the package.json');
    }

    throw error;
  }
}

function hasYarn() {
  try {
    spawn.sync('yarnpkg', ['--version'], { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}