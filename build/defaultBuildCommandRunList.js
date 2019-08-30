
const runList = [
  require('./impl/cognitoUserPoolDomain'),
  require('./impl/route53ARecord'),
  require('./impl/cognitoUserPoolIdpGoogle'),
  require('./impl/appClients')
];

module.exports = runList;
