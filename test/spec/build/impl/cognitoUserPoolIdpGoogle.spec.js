
const CognitoUserPoolIdpGoogle = require('../../../../build/impl/cognitoUserPoolIdpGoogle').CognitoUserPoolIdpGoogle;
const userPool = require('../../../support/stubs/aws-sdk/stubCognitoIdentityServiceProvider');
const userPoolFacade = require('../../../support/stubs/build/aws-facades/stubCognitoUserPoolFacade');
const { expect, sinon } = require('../../../support/TestUtilities');

describe('cognitoUserPoolIdpGoogle', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('isDone - true', async () => {
    const command = new CognitoUserPoolIdpGoogle({ userPool, userPoolFacade });
    const response = describeIdentityProviderResponse;
    sandbox.stub(userPool, 'describeIdentityProvider').returns({ promise: () => Promise.resolve(response) });
    await expect(command.isDone('dev')).to.eventually.be.true;
  });

  it('isDone - false', async() => {
    const command = new CognitoUserPoolIdpGoogle({ userPool, userPoolFacade });
    const response = describeIdentityProviderResponse;
    const error = new Error('no idp');
    error.code = 'ResourceNotFoundException';
    sandbox.stub(userPool, 'describeIdentityProvider').returns({ promise: () => Promise.reject(error) });
    await expect(command.isDone('dev')).to.eventually.be.false;
  });

  it('do - unknown error', async () => {
    const command = new CognitoUserPoolIdpGoogle({ userPool, userPoolFacade });
    sandbox.stub(userPool, 'createIdentityProvider').returns({ promise: () => Promise.reject(new Error('oops')) });
    await expect(command.do('dev')).to.be.rejectedWith('oops');
  });

  it('undo - unknown error', async () => {
    const command = new CognitoUserPoolIdpGoogle({ userPool, userPoolFacade });
    sandbox.stub(userPool, 'deleteIdentityProvider').returns({ promise: () => Promise.reject(new Error('oops')) });
    await expect(command.undo('dev')).to.be.rejectedWith('oops');
  });

});

const describeIdentityProviderResponse = {
  "IdentityProvider": {
    "UserPoolId": "us-west-2_abCdEfG12",
    "ProviderName": "Google",
    "ProviderType": "Google",
    "ProviderDetails": {
      "attributes_url": "https://people.googleapis.com/v1/people/me?personFields=",
      "attributes_url_add_attributes": "true",
      "authorize_scopes": "profile email openid",
      "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
      "client_id": "123456789012-abcdef34ghijk5lmnop67q8rs9tuvwx0.apps.googleusercontent.com",
      "client_secret": "a_bcDE123FGhij_KlMnOPQRS",
      "oidc_issuer": "https://accounts.google.com",
      "token_request_method": "POST",
      "token_url": "https://www.googleapis.com/oauth2/v4/token"
    },
    "AttributeMapping": {
      "email": "email",
      "profile": "profile",
      "username": "sub"
    },
    "IdpIdentifiers": [],
    "LastModifiedDate": "2019-08-30T21:45:38.028Z",
    "CreationDate": "2019-08-30T21:44:50.934Z"
  }
};
