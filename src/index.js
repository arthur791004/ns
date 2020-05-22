const path = require('path');
const { config } = require('dotenv');
const spawn = require('cross-spawn');
const prompts = require('prompts');
const { Command } = require('commander');

const program = new Command('ns')
  .option('--detail', 'print detail of script')
  .option('--use-npm', 'use npm to run script')
  .parse(process.argv);

const scripts = getPkgScripts();
if (!scripts || Object.keys(scripts).length === 0) {
  console.log('None of npm script could be found!');
  return;
}

prompts({
  type: 'autocomplete',
  name: 'value',
  message: 'Pick npm script',
  fallback: 'No npm script found',
  choices: Object.keys(scripts).map((script) => ({
    title: script,
    description: program.detail && scripts[script],
  })),
}).then(({ value }) => {
  if (!scripts[value]) {
    console.error('Oops...command could not be found');
    return;
  }

  const command = program.useNpm || !hasYarn() ? 'npm' : 'yarn';
  const args = ['run', value];

  /**
   * Load environment variables from .env
   */
  config();

  spawn(command, args, { stdio: 'inherit', env: process.env });
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

/**
 * @description check yarn install and yarn.lock exists or not
 */
function hasYarn() {
  const { error } = spawn.sync('yarnpkg', ['--version'], { stdio: 'ignore' });
  if (error) {
    return false;
  }

  try {
    const yarnLockPath = path.resolve(process.cwd(), 'yarn.lock');
    fs.statSync(yarnLockPath);
    return true;
  } catch {
    return false;
  }
}
