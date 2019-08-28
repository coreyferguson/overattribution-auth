
const runList = require('./defaultBuildCommandRunList');

class BuildInvoker {

  constructor(options) {
    options = options || {};
    this.runList = options.runList || runList;
  }

  async deploy(stage) {
    for (let command of this.runList) {
      const isDone = await command.isDone(stage);
      if (!isDone) {
        console.info('Deploying ' + command.getName());
        await command.do(stage);
        console.info('Completed ' + command.getName());
      } else {
        console.info(command.getName() + ' already done. Skipping.');
      }
    }
  }

  async remove(stage) {
    let command, isDone;
    for (let i=this.runList.length-1; i>=0; i--) {
      command = this.runList[i];
      isDone = await command.isDone(stage);
      if (isDone) {
        console.info('Removing ' + command.getName());
        await command.undo(stage);
        console.info('Completed ' + command.getName());
      } else {
        console.info(command.getName() + ' already removed. Skipping.');
      }
    }
  }

}

module.exports = new BuildInvoker();
module.exports.BuildInvoker = BuildInvoker;
