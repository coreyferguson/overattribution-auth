
const AppClients = require('../../../../../build/impl/appClients/appClients').AppClients;
const userPool = require('../../../../support/stubs/aws-sdk/stubCognitoIdentityServiceProvider');
const userPoolFacade = require('../../../../support/stubs/build/aws-facades/stubCognitoUserPoolFacade');
const { expect, sinon } = require('../../../../support/TestUtilities');

describe('appClients', () => {

  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('isDone - true', async () => {
    const command = new AppClients({
      userPool,
      userPoolFacade,
      appClientsConfig: createAppClientsConfig()
    });
    sandbox.stub(userPool, 'listUserPoolClients').returns({
      promise: () => Promise.resolve({
        "UserPoolClients": [
          { "ClientId": "1", "UserPoolId": "us-west-2_abCdEfG12", "ClientName": "one" },
          { "ClientId": "2", "UserPoolId": "us-west-2_abCdEfG12", "ClientName": "two" }
        ]
      })
    });
    await expect(command.isDone('dev')).to.eventually.be.true;
  });

  it('isDone - false - missing one client', async () => {
    const command = new AppClients({
      userPool,
      userPoolFacade,
      appClientsConfig: createAppClientsConfig()
    });
    sandbox.stub(userPool, 'listUserPoolClients').returns({
      promise: () => Promise.resolve({
        "UserPoolClients": [
          { "ClientId": "2", "UserPoolId": "us-west-2_abCdEfG12", "ClientName": "two" }
        ]
      })
    });
    await expect(command.isDone('dev')).to.eventually.be.false;
  });

  it('isDone - false - one extra client', async () => {
    const command = new AppClients({
      userPool,
      userPoolFacade,
      appClientsConfig: createAppClientsConfig()
    });
    sandbox.stub(userPool, 'listUserPoolClients').returns({
      promise: () => Promise.resolve({
        "UserPoolClients": [
          { "ClientId": "1", "UserPoolId": "us-west-2_abCdEfG12", "ClientName": "one" },
          { "ClientId": "2", "UserPoolId": "us-west-2_abCdEfG12", "ClientName": "two" },
          { "ClientId": "3", "UserPoolId": "us-west-2_abCdEfG12", "ClientName": "three" }
        ]
      })
    });
    await expect(command.isDone('dev')).to.eventually.be.false;
  });

  it('do - create missing clients', async () => {
    const command = new AppClients({
      userPool,
      userPoolFacade,
      appClientsConfig: createAppClientsConfig()
    });
    sandbox.stub(userPool, 'listUserPoolClients').returns({
      promise: () => Promise.resolve({
        UserPoolClients: [ { ClientName: "one" } ]
      })
    });
    sandbox.stub(command, 'createClient');
    sandbox.stub(command, 'deleteClient');
    await command.do('dev');
    expect(command.createClient).to.be.calledOnce;
    expect(command.deleteClient).to.not.be.called;
  });

  it('do - delete extra clients', async () => {
    const command = new AppClients({
      userPool,
      userPoolFacade,
      appClientsConfig: createAppClientsConfig()
    });
    sandbox.stub(userPool, 'listUserPoolClients').returns({
      promise: () => Promise.resolve({
        UserPoolClients: [ { ClientName: "one" }, { ClientName: "two" }, { ClientName: "deleteme" } ]
      })
    });
    sandbox.stub(command, 'createClient');
    sandbox.stub(command, 'deleteClient');
    await command.do('dev');
    expect(command.createClient).to.not.be.called;
    expect(command.deleteClient).to.be.calledOnce;
  });

  it('undo - delete all clients', async () => {
    const command = new AppClients({
      userPool,
      userPoolFacade,
      appClientsConfig: createAppClientsConfig()
    });
    sandbox.stub(userPool, 'listUserPoolClients').returns({
      promise: () => Promise.resolve({
        UserPoolClients: [ { ClientName: "one" }, { ClientName: "two" } ]
      })
    });
    sandbox.stub(command, 'createClient');
    sandbox.stub(command, 'deleteClient');
    await command.undo('dev');
    expect(command.deleteClient).to.be.calledTwice;
  });

});

function createAppClientsConfig() {
  return {
    appClients: [
      { ClientName: 'one' },
      { ClientName: 'two' }
    ]
  };
};
