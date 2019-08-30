
const runList = [
  require('./impl/cognitoUserPoolDomain'),
  require('./impl/route53ARecord'),
  require('./impl/cognitoUserPoolIdpGoogle')
];

module.exports = runList;
