
# Secrets

Secrets managed with AWS Systems Manager Parameter Store.

## Quick Reference

Create the secret in EC2 Parameter Store:

```
aws ssm put-parameter \
  --name /overattribution-auth/dev/TEST_SECRET \
  --value "test-secret-value-123" \
  --type SecureString
aws ssm put-parameter \
  --name /overattribution-auth/prod/TEST_SECRET \
  --value "test-secret-value-123" \
  --type SecureString
```

Use secret in client code:

TODO
