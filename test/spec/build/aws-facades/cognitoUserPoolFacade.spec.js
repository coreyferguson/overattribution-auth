
const CognitoUserPoolFacade = require('../../../../build/aws-facades/cognitoUserPoolFacade').CognitoUserPoolFacade;
const userPool = require('../../../support/stubs/aws-sdk/stubCognitoIdentityServiceProvider');
const { expect, sinon } = require('../../../support/TestUtilities');

describe('CognitoUserPoolFacade', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('getUserPoolId - success', async () => {
    const command = new CognitoUserPoolFacade({ userPool });
    const response = {
      "UserPools": [
        {
          "CreationDate": "2019-08-30T03:28:39.320Z",
          "Id": "us-west-2_aBcDeFgHi",
          "LambdaConfig": {},
          "LastModifiedDate": "2019-08-30T03:28:39.320Z",
          "Name": "auth-overattribution-test"
        }
      ]
    };
    sandbox.stub(userPool, 'listUserPools').returns({ promise: () => Promise.resolve(response) });
    const userPoolId = await command.getUserPoolId('test');
    expect(userPoolId).to.equal('us-west-2_aBcDeFgHi');
  });

  it('getUserPoolId - unknown error', async () => {
    const command = new CognitoUserPoolFacade({ userPool });
    sandbox.stub(userPool, 'listUserPools').returns({ promise: () => Promise.reject(new Error('oops')) });
    await expect(command.getUserPoolId('test')).to.eventually.be.rejected;
  });

  it('getUserPoolId - no pools', async () => {
    const command = new CognitoUserPoolFacade({ userPool });
    const response = { "UserPools": [] };
    sandbox.stub(userPool, 'listUserPools').returns({ promise: () => Promise.resolve(response) });
    await expect(command.getUserPoolId('test')).to.eventually.be.rejectedWith('No User Pool');
  });

  it('getUserPoolId - paginated results');

});

