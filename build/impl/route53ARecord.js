
const AWS = require('aws-sdk');
const BuildCommand = require('../BuildCommand');

const HOSTED_ZONE_FOR_CLOUD_FORMATION = 'Z2FDTNDATAQYW2'; // https://docs.aws.amazon.com/general/latest/gr/rande.html#elb_region

class Route53ARecord extends BuildCommand {

  constructor(options) {
    super(options);
    options = options || {};
    this.route53 = options.route53 || new AWS.Route53({ apiVersion: '2013-04-01', region: 'us-west-2' });
    this.userPool = options.userPool
      || new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18', region: 'us-west-2' });
    this.subDomain = options.subDomain || 'auth';
    this.domain = options.domain || 'overattribution.com';
    this.dnsName = 'overattribution.com';
    this.recordSetName = `auth.${this.dnsName}`;
  }

  getName() {
    return 'route53ARecord';
  }

  async do(stage) {
    const HostedZoneId = await this.getHostedZoneId();
    const DNSName = await this.getCloudFrontDns(stage);
    const response = await this.route53.changeResourceRecordSets({
      ChangeBatch: {
        Changes: [
          {
            Action: 'CREATE',
            ResourceRecordSet: {
              Name: this.getRecordSetName(stage),
              Type: 'A',
              AliasTarget: {
                DNSName,
                EvaluateTargetHealth: false,
                HostedZoneId: HOSTED_ZONE_FOR_CLOUD_FORMATION
              }
            }
          }
        ],
        Comment: 'Alias to CloudFront for User Pool'
      },
      HostedZoneId
    }).promise();
  }

  async undo(stage) {
    const HostedZoneId = await this.getHostedZoneId();
    const DNSName = await this.getCloudFrontDns(stage);
    const ResourceRecordSet = {
      Name: this.getRecordSetName(stage),
      Type: 'A',
      AliasTarget: {
        DNSName,
        EvaluateTargetHealth: false,
        HostedZoneId: HOSTED_ZONE_FOR_CLOUD_FORMATION
      }
    };
    const response = await this.route53.changeResourceRecordSets({
      ChangeBatch: {
        Changes: [
          {
            Action: 'DELETE',
            ResourceRecordSet
          }
        ],
        // Comment: 'Alias to CloudFront for User Pool'
      },
      HostedZoneId
    }).promise();

  }

  async isDone(stage) {
    const HostedZoneId = await this.getHostedZoneId();
    const response = await this.route53.listResourceRecordSets({ HostedZoneId }).promise();
    for (let record of response.ResourceRecordSets) {
      if (record.Name !== `${this.getRecordSetName(stage)}.`) continue;
      if (record.Type !== 'A') continue;
      if (!record.AliasTarget) continue;
      return true;
    }
    return false;
  }

  async getHostedZoneId() {
    const response = await this.route53.listHostedZonesByName({ DNSName: `${this.dnsName}.` }).promise();
    if (!response.HostedZones || response.HostedZones.length === 0)
      throw new Error(`Could not find hosted zone for domain=${this.dnsName}`);
    for (let hostedZone of response.HostedZones) if (hostedZone.Name === `${this.dnsName}.`)
      return hostedZone.Id.replace('/hostedzone/', '');
    throw new Error(`Could not find hosted zone for domain=${this.dnsName}`);
  }

  async getCloudFrontDns(stage) {
    let response = await this.userPool.describeUserPoolDomain({ Domain: this.getFullDomainName(stage) }).promise();
    if (!response.DomainDescription || !response.DomainDescription.CloudFrontDistribution)
      throw new Error('No User Pool Domain configured.');
    return response.DomainDescription.CloudFrontDistribution;
  }

  getFullDomainName(stage) {
    return stage === 'prod'
      ? `${this.subDomain}.${this.domain}`
      : `${this.subDomain}-${stage}.${this.domain}`;
  }

  getRecordSetName(stage) {
    return stage === 'prod'
      ? `${this.subDomain}.${this.dnsName}`
      : `${this.subDomain}-${stage}.${this.dnsName}`;
  }

}

module.exports = new Route53ARecord();
module.exports.Route53ARecord = Route53ARecord;
