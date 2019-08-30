
const buildInvoker = require('../build/buildInvoker');

const stage = process.argv[2];
const runListNames = process.argv.slice(3);
const runList = [];
for (let runListName of runListNames) {
  runList.push(require(`../build/impl/${runListName}`));
}

if (!stage) throw new Error('Must pass stage in as first argument');

buildInvoker.deploy(stage, runList).then(() => {
  console.info('Successfully executed all commands in run list');
}).catch(err => {
  console.info('Error executing commands in run list', err);
});
