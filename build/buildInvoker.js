
const defaultRunList = require('./defaultBuildCommandRunList');

class BuildInvoker {

  constructor(options) {
    options = options || {};
    this.defaultRunList = options.defaultRunList || defaultRunList;
  }

  async deploy(stage, runList) {
    runList = runList && runList.length>0 ? runList : this.defaultRunList;
    for (let command of runList) {
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

  async remove(stage, runList) {
    runList = runList && runList.length>0 ? runList : this.defaultRunList;
    let command, isDone;
    for (let i=runList.length-1; i>=0; i--) {
      command = runList[i];
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
