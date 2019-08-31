
const AWS = require('aws-sdk');
const BuildCommand = require('../BuildCommand');
const userPoolFacade = require('../aws-facades/cognitoUserPoolFacade');

class CognitoUserPoolDomain extends BuildCommand {

  constructor(options) {
    super(options);
    options = options || {};
    this.userPool = options.userPool
      || new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
    this.subDomain = options.subDomain || 'auth';
    this.domain = options.domain || 'overattribution.com';
    this.userPoolFacade = options.userPoolFacade || userPoolFacade;
  }

  getName() {
    return 'cognitoUserPoolDomain';
  }

  async do(stage) {
    const userPoolId = await this.userPoolFacade.getUserPoolId(stage);
    try {
      await this.userPool.createUserPoolDomain({
        Domain: this.getFullDomain(stage),
        UserPoolId: userPoolId,
        CustomDomainConfig: {
          CertificateArn: 'arn:aws:acm:us-east-1:863138142000:certificate/078933c7-2e00-415f-b964-ead49b37f915'
        }
      }).promise();
    } catch (err) {
      if (/CNAMEAlreadyExists/.test(err.message)) {
        console.error('ERROR: CNAME already exists. Try waiting 15 minutes and redeploy.');
      }
      throw err;
    }
  }

  async undo(stage) {
    const userPoolId = await this.userPoolFacade.getUserPoolId(stage);
    await this.userPool.deleteUserPoolDomain({ Domain: this.getFullDomain(stage), UserPoolId: userPoolId }).promise();
  }

  async isDone(stage) {
    const meta = await this.userPool.describeUserPoolDomain({ Domain: this.getFullDomain(stage) }).promise();
    return !!meta.DomainDescription.Status;
  }

  getFullDomain(stage) {
    return stage === 'prod'
      ? `${this.subDomain}.${this.domain}`
      : `${this.subDomain}-${stage}.${this.domain}`;
  }

}

module.exports = new CognitoUserPoolDomain();
module.exports.CognitoUserPoolDomain = CognitoUserPoolDomain;
