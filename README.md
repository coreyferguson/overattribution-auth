
# OverAttribution Authentication

## Summary

Provides the authentication for all subdomains of overattribution.com.

## Deploy

```bash
npm run deploy
```

## Manual Setup (required)

One-time setup of the AWS infrastructure.

Manual steps required when CloudFormation templates do not support the required setup.

Configurations:

- App Integration
  - Domain name
- Federation
  - Identity Providers

## Manually adding a client (optional)

- Add a client in `User Pool -> General Settings -> App clients`
- Update client settings in `User Pool -> App integration -> App client settings`
- Add a provider in `Identity Pool -> Authentication providers -> Cognito`

