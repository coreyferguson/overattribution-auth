
const AWS = require('aws-sdk');
const BuildCommand = require('../BuildCommand');

class CognitoUserPoolDomain extends BuildCommand {

  constructor(options) {
    super(options);
    options = options || {};
    this.userPool = options.userPool
      || new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
    this.domain = options.domain || 'auth.overattribution.com';   // manually registered domain
    this.userPoolName = options.userPoolName || 'auth-overattribution'; // from serverless.yml
  }

  getName() {
    return 'CognitoUserPoolDomain';
  }

  async do(stage) {
    const userPoolId = await this.getUserPoolId(stage);
    try {
      await this.userPool.createUserPoolDomain({
        Domain: this.domain,
        UserPoolId: userPoolId,
        CustomDomainConfig: {
          CertificateArn: 'arn:aws:acm:us-east-1:863138142000:certificate/078933c7-2e00-415f-b964-ead49b37f915'
        }
      }).promise();
    } catch (err) {
      if (/CNAMEAlreadyExists/.test(err.message)) {
        console.error('ERROR: CNAME already exists. Try `./node_modules/.bin/sls remove` and redeploy.');
      }
      throw err;
    }
  }

  async undo(stage) {
    const userPoolId = await this.getUserPoolId(stage);
    await this.userPool.deleteUserPoolDomain({ Domain: this.domain, UserPoolId: userPoolId }).promise();
  }

  async isDone(stage) {
    const meta = await this.userPool.describeUserPoolDomain({ Domain: this.domain }).promise();
    return !!meta.DomainDescription.Status;
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

module.exports = new CognitoUserPoolDomain();
module.exports.CognitoUserPoolDomain = CognitoUserPoolDomain;
