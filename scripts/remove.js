
const buildInvoker = require('../build/buildInvoker');

const stage = process.argv[2];

if (!stage) throw new Error('Must pass stage in as first argument');

buildInvoker.remove(stage).then(() => {
  console.info('Successfully executed all commands in run list');
}).catch(err => {
  console.info('Error executing commands in run list', err);
});
