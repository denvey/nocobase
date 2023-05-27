const { Command } = require('commander');
const { isDev, run, postCheck, runInstall, promptForTs } = require('../util');
const { existsSync, unlink } = require('fs');
const { resolve } = require('path');
const chalk = require('chalk');

/**
 *
 * @param {Command} cli
 */
module.exports = (cli) => {
  const { APP_PACKAGE_ROOT, NODE_ARGS } = process.env;
  cli
    .command('start')
    .option('-p, --port [port]')
    .option('-d, --daemon')
    .option('--db-sync')
    .option('--quickstart')
    .allowUnknownOption()
    .action(async (opts) => {
      if (opts.port) {
        process.env.APP_PORT = opts.port;
      }
      if (process.argv.includes('-h') || process.argv.includes('--help')) {
        promptForTs();
        run('ts-node', [
          '-P',
          './tsconfig.server.json',
          '-r',
          'tsconfig-paths/register',
          `./packages/${APP_PACKAGE_ROOT}/server/src/index.ts`,
          ...process.argv.slice(2),
        ]);
        return;
      }
      if (!existsSync(resolve(process.cwd(), `./packages/${APP_PACKAGE_ROOT}/server/lib/index.js`))) {
        console.log('The code is not compiled, please execute it first');
        console.log(chalk.yellow('$ yarn build'));
        console.log('If you want to run in development mode, please execute');
        console.log(chalk.yellow('$ yarn dev'));
        return;
      }
      await postCheck(opts);
      const restartMark = resolve(process.cwd(), 'storage', 'restart');
      if (!existsSync(restartMark)) {
        if (opts.quickstart) {
          await run('node', [`./packages/${APP_PACKAGE_ROOT}/server/lib/index.js`, 'install', '--ignore-installed']);
          await run('node', [`./packages/${APP_PACKAGE_ROOT}/server/lib/index.js`, 'upgrade']);
        }
        if (opts.dbSync) {
          await run('node', [`./packages/${APP_PACKAGE_ROOT}/server/lib/index.js`, 'db:sync']);
        }
      }
      if (opts.daemon) {
        run('pm2', ['start', `packages/${APP_PACKAGE_ROOT}/server/lib/index.js`, '--', ...process.argv.slice(2)]);
      } else {
        run(
          'pm2-runtime',
          [
            'start',
            `packages/${APP_PACKAGE_ROOT}/server/lib/index.js`,
            NODE_ARGS ? `--node-args="${NODE_ARGS}"` : undefined,
            '--',
            ...process.argv.slice(2),
          ].filter(Boolean),
        );
      }
    });
};
