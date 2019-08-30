
const AWS = require('aws-sdk');
const BuildCommand = require('../BuildCommand');
const userPoolFacade = require('../aws-facades/cognitoUserPoolFacade');

class CognitoUserPoolIdpGoogle extends BuildCommand {

  constructor(options) {
    super(options);
    options = options || {};
    this.userPool = options.userPool
      || new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
    this.userPoolFacade = options.userPoolFacade || userPoolFacade;
  }

  getName() {
    return 'cognitoUserPoolIdpGoogle';
  }

  async do(stage) {
    const UserPoolId = await this.userPoolFacade.getUserPoolId(stage);
    await this.userPool.createIdentityProvider({
      ProviderDetails: {
        attributes_url: 'https://people.googleapis.com/v1/people/me?personFields=',
        attributes_url_add_attributes: 'true',
        authorize_scopes: 'profile email openid',
        authorize_url: 'https://accounts.google.com/o/oauth2/v2/auth',
        client_id: '123456789012-abcdef34ghijk5lmnop67q8rs9tuvwx0.apps.googleusercontent.com',
        client_secret: 'a_bcDE123FGhij_KlMnOPQRS',
        oidc_issuer: 'https://accounts.google.com',
        token_request_method: 'POST',
        token_url: 'https://www.googleapis.com/oauth2/v4/token'
      },
      ProviderName: 'Google',
      ProviderType: 'Google',
      UserPoolId,
      AttributeMapping: {
        email: 'email',
        profile: 'profile',
        username: 'sub'
      },
      IdpIdentifiers: []
    }).promise();
  }

  async undo(stage) {
    const UserPoolId = await this.userPoolFacade.getUserPoolId(stage);
    await this.userPool.deleteIdentityProvider({
      ProviderName: 'Google',
      UserPoolId
    }).promise();
  }

  async isDone(stage) {
    const UserPoolId = await this.userPoolFacade.getUserPoolId(stage);
    try {
      const response = await this.userPool.describeIdentityProvider({
        ProviderName: 'Google',
        UserPoolId
      }).promise();
      return !!response.IdentityProvider;
    } catch (error) {
      if (/ResourceNotFoundException/.test(error.code)) return false;
      else throw error;
    };
  }

}

module.exports = new CognitoUserPoolIdpGoogle();
module.exports.CognitoUserPoolIdpGoogle = CognitoUserPoolIdpGoogle;
