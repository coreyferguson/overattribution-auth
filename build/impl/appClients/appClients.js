
const BuildCommand = require('../../BuildCommand');
const AWS = require('aws-sdk');
const userPoolFacade = require('../../aws-facades/cognitoUserPoolFacade');
// const appClientsConfig = require('./appClientsConfig.json');
const doT = require('dot');
const fs = require('fs');
const path = require('path');

class AppClients extends BuildCommand {

  constructor(options) {
    super(options);
    options = options || {};
    this.userPool = options.userPool
      || new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
    this.userPoolFacade = options.userPoolFacade || userPoolFacade;
  }

  getName() {
    return 'appClients';
  }

  async do(stage) {
    const appClientsConfig = await this.getAppClientsConfig(stage);
    const toBeDeleted = new Map();
    const toBeCreated = new Map();
    for (let client of appClientsConfig.appClients) toBeCreated.set(client.ClientName, client);
    const UserPoolId = await this.userPoolFacade.getUserPoolId(stage);
    const response = await this.userPool.listUserPoolClients({ UserPoolId }).promise();
    for (let client of response.UserPoolClients) {
      if (toBeCreated.has(client.ClientName)) toBeCreated.delete(client.ClientName);
      else toBeDeleted.set(client.ClientName, client);
    }
    for (let [,client] of toBeCreated) {
      await this.createClient(stage, client, UserPoolId);
    }
    for (let [,client] of toBeDeleted) {
      await this.deleteClient(client, UserPoolId);
    }
  }

  async undo(stage) {
    const UserPoolId = await this.userPoolFacade.getUserPoolId(stage);
    const response = await this.userPool.listUserPoolClients({ UserPoolId }).promise();
    for (let client of response.UserPoolClients) {
      await this.deleteClient(client, UserPoolId);
    }
  }

  async isDone(stage) {
    const appClientsConfig = await this.getAppClientsConfig(stage);
    const expected = new Set();
    for (let client of appClientsConfig.appClients) expected.add(client.ClientName);
    const UserPoolId = await this.userPoolFacade.getUserPoolId(stage);
    const response = await this.userPool.listUserPoolClients({ UserPoolId }).promise();
    for (let client of response.UserPoolClients) {
      if (expected.has(client.ClientName)) expected.delete(client.ClientName);
      else return false;
    }
    return expected.size === 0;
  }

  async createClient(stage, client, UserPoolId) {
    const params = Object.assign({}, client, { UserPoolId });
    const paramsAsString = JSON.stringify(params);
    const interpolated = doT.template(paramsAsString)({ stage });
    const newParams = JSON.parse(interpolated);
    await this.userPool.createUserPoolClient(newParams).promise();
  }

  async deleteClient(client, UserPoolId) {
    const params = { ClientId: client.ClientId, UserPoolId };
    await this.userPool.deleteUserPoolClient(params).promise();
  }

  async getAppClientsConfig(stage) {
    const filePath = path.join(__dirname, 'appClientsConfig.json.template');
    const content = fs.readFileSync(filePath).toString();
    const interpolated = doT.template(content)({ stage });
    return JSON.parse(interpolated);
  }

}

module.exports = new AppClients();
module.exports.AppClients = AppClients;
