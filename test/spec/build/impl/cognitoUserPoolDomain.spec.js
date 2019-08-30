
const CognitoUserPoolDomain = require('../../../../build/impl/cognitoUserPoolDomain').CognitoUserPoolDomain;
const userPool = require('../../../support/stubs/aws-sdk/stubCognitoIdentityServiceProvider');
const { expect, sinon } = require('../../../support/TestUtilities');

describe('CognitoUserPoolDomain', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('name is defined', () => {
    const command = new CognitoUserPoolDomain({ userPool });
    const name = command.getName();
    expect(name).to.not.be.null;
  })

  it('isDone - user pool does not exist', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    const response = { DomainDescription: {} };
    sandbox
      .stub(userPool, 'describeUserPoolDomain')
      .returns({ promise: () => Promise.resolve(response) });
    const isDone = await command.isDone('dev');
    expect(isDone).to.be.false;
  });

  it('do - unknown error', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    sandbox.stub(command, 'getUserPoolId').returns('us-west-2_aBcDeFgHi');
    sandbox.stub(userPool, 'createUserPoolDomain').returns({ promise: () => Promise.reject(new Error('oops')) });
    await expect(command.do('dev')).to.eventually.be.rejectedWith('oops');
  });

  it('do - CNAMEAlreadyExists', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    sandbox.stub(command, 'getUserPoolId').returns('us-west-2_aBcDeFgHi');
    sandbox.stub(userPool, 'createUserPoolDomain').returns({ promise: () => Promise.reject(new Error('InvalidParameterException: One or more of the CNAMEs you provided are already associated with a different resource. (Service: AmazonCloudFront; Status Code: 409; Error Code: CNAMEAlreadyExists; Request ID: d67bedf3-cadd-11e9-a61f-c578a76c3695)')) });
    sandbox.stub(console, 'error');
    await expect(command.do('dev')).to.eventually.be.rejectedWith('CNAMEAlreadyExists');
  });

  it('undo - unknown error', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    sandbox.stub(command, 'getUserPoolId').returns('us-west-2_aBcDeFgHi');
    sandbox.stub(userPool, 'deleteUserPoolDomain').returns({ promise: () => Promise.reject(new Error('oops')) });
    await expect(command.undo('dev')).to.eventually.be.rejectedWith('oops');
  });

  it('getUserPoolId - success', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    const response = {
      "UserPools": [
        {
          "CreationDate": "2019-08-30T03:28:39.320Z",
          "Id": "us-west-2_aBcDeFgHi",
          "LambdaConfig": {},
          "LastModifiedDate": "2019-08-30T03:28:39.320Z",
          "Name": "auth-overattribution-dev"
        }
      ]
    };
    sandbox.stub(userPool, 'listUserPools').returns({ promise: () => Promise.resolve(response) });
    const userPoolId = await command.getUserPoolId('dev');
    expect(userPoolId).to.equal('us-west-2_aBcDeFgHi');
  });

  it('getUserPoolId - unknown error', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    sandbox.stub(userPool, 'listUserPools').returns({ promise: () => Promise.reject(new Error('oops')) });
    await expect(command.getUserPoolId('dev')).to.eventually.be.rejected;
  });

  it('getUserPoolId - no pools', async () => {
    const command = new CognitoUserPoolDomain({ userPool });
    const response = { "UserPools": [] };
    sandbox.stub(userPool, 'listUserPools').returns({ promise: () => Promise.resolve(response) });
    await expect(command.getUserPoolId('dev')).to.eventually.be.rejectedWith('No User Pool');
  });

  it('getUserPoolId - paginated results');

});
