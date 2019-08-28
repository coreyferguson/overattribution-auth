
const BuildCommand = require('../BuildCommand');

class route53ARecord extends BuildCommand {

  async do() {
  }

  async undo() {
  }

  async isDone() {
    return false;
  }

}

module.exports = new route53ARecord();
module.exports.route53ARecord = route53ARecord;
