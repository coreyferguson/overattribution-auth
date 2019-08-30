
const AWS = require('aws-sdk');

class CognitoUserPoolFacade {

  constructor(options) {
    options = options || {};
    this.userPool = options.userPool
      || new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
    this.userPoolName = options.userPoolName || 'auth-overattribution'; // from serverless.yml
  }

  async getUserPoolId(stage) {
    const userPoolName = this.getUserPoolName(stage);
    let data, NextToken, userPoolId;
    do {
      data = await this.userPool.listUserPools({ MaxResults: 60, NextToken }).promise();
      for (let userPool of data.UserPools) {
        if (userPool.Name === userPoolName) {
          userPoolId = userPool.Id;
          break;
        }
      }
      NextToken = data.NextToken;
    } while (!userPoolId && NextToken);
    if (!userPoolId) throw new Error(`No User Pool found in stage=${stage}`);
    return userPoolId;
  }

  getUserPoolName(stage) {
    return `${this.userPoolName}-${stage}`;
  }

}

module.exports = new CognitoUserPoolFacade();
module.exports.CognitoUserPoolFacade = CognitoUserPoolFacade;
