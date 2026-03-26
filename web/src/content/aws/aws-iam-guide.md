# AWS IAM (Identity and Access Management) — Complete Guide

## Table of Contents

- [1. What is IAM?](#1-what-is-iam)
- [2. IAM Users](#2-iam-users)
  - [2.1 Creating Users](#21-creating-users)
  - [2.2 Access Keys vs Console Password](#22-access-keys-vs-console-password)
  - [2.3 User Best Practices](#23-user-best-practices)
- [3. IAM Groups](#3-iam-groups)
  - [3.1 Creating Groups](#31-creating-groups)
  - [3.2 Group Policies](#32-group-policies)
- [4. IAM Roles](#4-iam-roles)
  - [4.1 Role Trust Policy](#41-role-trust-policy)
  - [4.2 Service Roles (EC2, Lambda, etc.)](#42-service-roles-ec2-lambda-etc)
  - [4.3 Cross-Account Roles](#43-cross-account-roles)
  - [4.4 AssumeRole](#44-assumerole)
- [5. IAM Policies](#5-iam-policies)
  - [5.1 Policy Structure (JSON)](#51-policy-structure-json)
  - [5.2 AWS Managed vs Customer Managed vs Inline](#52-aws-managed-vs-customer-managed-vs-inline)
  - [5.3 Policy Evaluation Logic](#53-policy-evaluation-logic)
  - [5.4 Conditions](#54-conditions)
  - [5.5 Resource-Based Policies vs Identity-Based](#55-resource-based-policies-vs-identity-based)
- [6. Security Best Practices](#6-security-best-practices)
  - [6.1 Root Account Protection](#61-root-account-protection)
  - [6.2 Least Privilege Principle](#62-least-privilege-principle)
  - [6.3 MFA](#63-mfa)
  - [6.4 Password Policies](#64-password-policies)
  - [6.5 Access Key Rotation](#65-access-key-rotation)
- [7. Identity Federation](#7-identity-federation)
  - [7.1 SAML 2.0](#71-saml-20)
  - [7.2 Web Identity Federation (Cognito)](#72-web-identity-federation-cognito)
  - [7.3 SSO / IAM Identity Center](#73-sso--iam-identity-center)
- [8. STS (Security Token Service)](#8-sts-security-token-service)
  - [8.1 Temporary Credentials](#81-temporary-credentials)
  - [8.2 AssumeRole API](#82-assumerole-api)
  - [8.3 Session Tokens](#83-session-tokens)
- [9. IAM Access Analyzer](#9-iam-access-analyzer)
- [10. Interview Questions & Answers](#10-interview-questions--answers)

---

## 1. What is IAM?

AWS Identity and Access Management (IAM) is a **global service** (not region-specific) that lets you control **who** (authentication) can do **what** (authorization) in your AWS account. Every AWS API call is evaluated against IAM policies to determine whether it is allowed or denied.

Key characteristics:
- **Global** — IAM entities (users, roles, policies) are available across all AWS regions
- **Free** — No charge for IAM usage; you pay only for the resources IAM identities access
- **Granular** — Permissions can be set at the API-action and resource level
- **Centralized** — Single place to manage access for the entire AWS account
- **Supports federation** — Integrate with corporate directories (AD, SAML) and web identity providers

### IAM Components Overview

```
AWS Account (Root User)
  │
  ├── IAM Users         → Individual people or applications (long-term credentials)
  ├── IAM Groups        → Collections of users (attach policies to groups)
  ├── IAM Roles         → Temporary identities assumed by users, services, or apps
  ├── IAM Policies      → JSON documents defining permissions (allow/deny)
  └── Identity Providers → External identity sources (SAML, OIDC, Cognito)
```

### How Authentication and Authorization Work

```
1. Principal (user/role/app) makes an AWS API request
2. AWS authenticates the principal (access key, session token, console login)
3. AWS gathers ALL policies attached to the principal
4. AWS evaluates the policies against the request (action + resource + conditions)
5. Result: Allow or Deny (default is Deny)

Request context:
  - Principal (who)
  - Action (what API call — e.g., s3:GetObject)
  - Resource (which resource — e.g., arn:aws:s3:::my-bucket/*)
  - Conditions (when/how — e.g., source IP, MFA, time)
```

---

## 2. IAM Users

An IAM user represents a **person or application** that interacts with AWS. Each user has a unique name within the account and can have credentials (password for console, access keys for CLI/API).

### 2.1 Creating Users

```bash
# Create a new IAM user
aws iam create-user --user-name john.doe

# Output:
# {
#     "User": {
#         "Path": "/",
#         "UserName": "john.doe",
#         "UserId": "AIDAEXAMPLEID123456",
#         "Arn": "arn:aws:iam::123456789012:user/john.doe",
#         "CreateDate": "2024-01-15T10:30:00Z"
#     }
# }

# Create a user with a path (useful for organizing users)
aws iam create-user --user-name jane.smith --path /engineering/

# Enable console access (creates a login password)
aws iam create-login-profile \
  --user-name john.doe \
  --password "TempP@ssw0rd!" \
  --password-reset-required    # Force password change on first login

# List all IAM users
aws iam list-users

# Get details for a specific user
aws iam get-user --user-name john.doe

# Add user to a group
aws iam add-user-to-group --user-name john.doe --group-name developers

# Attach a policy directly to a user (prefer groups instead)
aws iam attach-user-policy \
  --user-name john.doe \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Delete a user (must remove all attached resources first)
aws iam delete-login-profile --user-name john.doe
aws iam delete-user --user-name john.doe
```

### 2.2 Access Keys vs Console Password

IAM users can have two types of credentials, each for a different access method.

```
Console Password:
  - Used for AWS Management Console (browser)
  - Username + password + optional MFA
  - Can enforce password policy (length, complexity, rotation)
  - One password per user

Access Keys:
  - Used for AWS CLI, SDKs, and API calls
  - Consists of Access Key ID + Secret Access Key
  - Maximum 2 access keys per user (for rotation)
  - Secret key shown ONLY at creation time — cannot be retrieved later
  - Should be rotated regularly
```

```bash
# Create access keys for a user
aws iam create-access-key --user-name john.doe

# Output:
# {
#     "AccessKey": {
#         "UserName": "john.doe",
#         "AccessKeyId": "AKIAIOSFODNN7EXAMPLE",     <-- public identifier
#         "Status": "Active",
#         "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",  <-- secret (shown ONCE)
#         "CreateDate": "2024-01-15T10:35:00Z"
#     }
# }

# List access keys for a user
aws iam list-access-keys --user-name john.doe

# Deactivate an access key (don't delete immediately — monitor first)
aws iam update-access-key \
  --user-name john.doe \
  --access-key-id AKIAIOSFODNN7EXAMPLE \
  --status Inactive

# Delete an access key
aws iam delete-access-key \
  --user-name john.doe \
  --access-key-id AKIAIOSFODNN7EXAMPLE

# Check when an access key was last used
aws iam get-access-key-last-used --access-key-id AKIAIOSFODNN7EXAMPLE
```

### 2.3 User Best Practices

```
1. Use IAM roles instead of users wherever possible
   - EC2 instances → use instance profiles (roles)
   - Lambda functions → use execution roles
   - CI/CD pipelines → use OIDC federation or roles

2. If you must use IAM users:
   - One user per person (never share credentials)
   - Assign permissions via groups (not directly to users)
   - Enable MFA for all human users
   - Rotate access keys every 90 days
   - Delete unused credentials (check last-used dates)
   - Use least privilege — start with no permissions, add as needed

3. Naming conventions:
   - Human users: firstname.lastname (e.g., john.doe)
   - Service accounts: svc-appname (e.g., svc-deploy-pipeline)
   - Path-based organization: /engineering/, /finance/, /service-accounts/
```

```bash
# Audit: find users with no MFA enabled
aws iam generate-credential-report
aws iam get-credential-report --output text --query Content | base64 --decode | \
  grep -E "^[^,]+,[^,]+,[^,]+,[^,]+,[^,]+,false"
# The 6th field is "mfa_active" — false means no MFA

# Audit: find access keys older than 90 days
aws iam list-users --query 'Users[].UserName' --output text | while read user; do
  aws iam list-access-keys --user-name "$user" --query \
    "AccessKeyMetadata[?Status=='Active'].[UserName,AccessKeyId,CreateDate]" --output text
done
```

---

## 3. IAM Groups

An IAM group is a **collection of IAM users**. Groups let you assign permissions to multiple users at once instead of attaching policies to each user individually. A user can belong to multiple groups (max 10).

### 3.1 Creating Groups

```bash
# Create a group
aws iam create-group --group-name developers

# Create groups for common roles in an organization
aws iam create-group --group-name admins
aws iam create-group --group-name developers
aws iam create-group --group-name readonly-users
aws iam create-group --group-name billing-team

# Add users to groups
aws iam add-user-to-group --user-name john.doe --group-name developers
aws iam add-user-to-group --user-name jane.smith --group-name developers
aws iam add-user-to-group --user-name jane.smith --group-name admins  # user in multiple groups

# List groups
aws iam list-groups

# List users in a group
aws iam get-group --group-name developers

# List groups a user belongs to
aws iam list-groups-for-user --user-name john.doe

# Remove user from a group
aws iam remove-user-from-group --user-name john.doe --group-name developers

# Delete a group (must remove all users and detach policies first)
aws iam delete-group --group-name old-team
```

### 3.2 Group Policies

Policies attached to a group are inherited by **all users** in that group. This is the recommended way to manage permissions.

```bash
# Attach an AWS managed policy to a group
aws iam attach-group-policy \
  --group-name developers \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess

# Attach multiple policies to a group
aws iam attach-group-policy \
  --group-name developers \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-group-policy \
  --group-name developers \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# List policies attached to a group
aws iam list-attached-group-policies --group-name developers

# Detach a policy from a group
aws iam detach-group-policy \
  --group-name developers \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess
```

```
Typical group structure for a startup:

  admins          → AdministratorAccess (full AWS access)
  developers      → EC2, S3, DynamoDB, Lambda, CloudWatch, etc.
  devops          → EC2, ECS, ECR, CodePipeline, CloudFormation, etc.
  readonly-users  → ViewOnlyAccess or ReadOnlyAccess
  billing-team    → Billing, Cost Explorer, Budgets
  security-team   → IAM, CloudTrail, GuardDuty, SecurityHub

Important:
  - Groups CANNOT be nested (no group inside a group)
  - Groups are for IAM users ONLY (cannot add roles to groups)
  - A user can be in max 10 groups
  - Max 300 groups per account (can request increase)
```

---

## 4. IAM Roles

An IAM role is an **identity with permissions** that can be **assumed** by trusted entities (AWS services, users, applications, or accounts). Unlike users, roles do not have permanent credentials — they provide **temporary security credentials** via STS.

```
When to use roles:
  - AWS services need permissions (EC2, Lambda, ECS tasks)
  - Cross-account access (account A needs to access account B)
  - Federated users (SAML, OIDC) need AWS access
  - Applications running on EC2 instances
  - Temporary elevated permissions (break-glass scenarios)
```

### 4.1 Role Trust Policy

Every role has a **trust policy** that defines **who can assume the role**. This is separate from the permissions policy (which defines what the role can do).

```json
// Trust policy — WHO can assume this role
// This example allows EC2 instances to assume the role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"     // EC2 service can assume this role
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```json
// Trust policy — allow a specific IAM user to assume the role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:user/john.doe"  // specific user
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"  // require MFA to assume role
        }
      }
    }
  ]
}
```

```json
// Trust policy — allow an entire AWS account to assume the role (cross-account)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::987654321098:root"  // all identities in account 987654321098
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "UniqueExternalId123"  // prevents confused deputy problem
        }
      }
    }
  ]
}
```

### 4.2 Service Roles (EC2, Lambda, etc.)

Service roles allow AWS services to perform actions on your behalf. The most common are EC2 instance profiles and Lambda execution roles.

```bash
# Create a role for EC2 instances
aws iam create-role \
  --role-name EC2-S3-Access-Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": { "Service": "ec2.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach a permissions policy to the role
aws iam attach-role-policy \
  --role-name EC2-S3-Access-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Create an instance profile (required to attach a role to EC2)
aws iam create-instance-profile --instance-profile-name EC2-S3-Access-Profile

# Add the role to the instance profile
aws iam add-role-to-instance-profile \
  --instance-profile-name EC2-S3-Access-Profile \
  --role-name EC2-S3-Access-Role

# Launch an EC2 instance with the role
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro \
  --iam-instance-profile Name=EC2-S3-Access-Profile
# The EC2 instance can now call S3 without any access keys —
# credentials are provided automatically via the instance metadata service
```

```bash
# Create a Lambda execution role
aws iam create-role \
  --role-name Lambda-DynamoDB-Role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": { "Service": "lambda.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach basic Lambda logging permissions
aws iam attach-role-policy \
  --role-name Lambda-DynamoDB-Role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach DynamoDB permissions
aws iam attach-role-policy \
  --role-name Lambda-DynamoDB-Role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

```
Common service principals:
  ec2.amazonaws.com           → EC2 instances
  lambda.amazonaws.com        → Lambda functions
  ecs-tasks.amazonaws.com     → ECS tasks (Fargate/EC2)
  codepipeline.amazonaws.com  → CodePipeline
  cloudformation.amazonaws.com → CloudFormation stacks
  apigateway.amazonaws.com    → API Gateway
  s3.amazonaws.com            → S3 (for replication, etc.)
  events.amazonaws.com        → EventBridge rules
  states.amazonaws.com        → Step Functions
```

### 4.3 Cross-Account Roles

Cross-account roles allow users or services in one AWS account to access resources in another account securely.

```
Scenario: Account A (123456789012) needs to read S3 buckets in Account B (987654321098)

Step 1: Account B creates a role that trusts Account A
Step 2: Account B attaches S3 read permissions to the role
Step 3: Account A's users/roles assume the cross-account role
Step 4: STS returns temporary credentials for Account B's role
```

```bash
# ACCOUNT B (987654321098) — Create the cross-account role
aws iam create-role \
  --role-name CrossAccount-S3-Reader \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": "arn:aws:iam::123456789012:root"
        },
        "Action": "sts:AssumeRole",
        "Condition": {
          "StringEquals": {
            "sts:ExternalId": "cross-acct-s3-2024"
          }
        }
      }
    ]
  }'

# ACCOUNT B — Attach S3 read permissions
aws iam attach-role-policy \
  --role-name CrossAccount-S3-Reader \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# ACCOUNT A (123456789012) — Grant users permission to assume the role in Account B
# Create an inline policy for the user/group:
aws iam put-user-policy \
  --user-name john.doe \
  --policy-name AllowAssumeS3ReaderInAccountB \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "sts:AssumeRole",
        "Resource": "arn:aws:iam::987654321098:role/CrossAccount-S3-Reader"
      }
    ]
  }'

# ACCOUNT A — User assumes the role to get temporary credentials
aws sts assume-role \
  --role-arn arn:aws:iam::987654321098:role/CrossAccount-S3-Reader \
  --role-session-name john-s3-session \
  --external-id cross-acct-s3-2024
```

### 4.4 AssumeRole

AssumeRole is the mechanism by which a principal obtains temporary credentials for a role. The caller must have permission to call `sts:AssumeRole`, and the role's trust policy must allow the caller.

```bash
# Assume a role and get temporary credentials
CREDS=$(aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/AdminRole \
  --role-session-name my-session \
  --duration-seconds 3600 \
  --query 'Credentials' \
  --output json)

# Extract the temporary credentials
export AWS_ACCESS_KEY_ID=$(echo $CREDS | jq -r '.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | jq -r '.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $CREDS | jq -r '.SessionToken')

# Now all AWS CLI commands use the assumed role's permissions
aws s3 ls  # Uses AdminRole permissions

# Verify your current identity
aws sts get-caller-identity
# {
#     "UserId": "AROA3XFRBF23EXAMPLE:my-session",
#     "Account": "123456789012",
#     "Arn": "arn:aws:sts::123456789012:assumed-role/AdminRole/my-session"
# }

# Unset the credentials to revert to your original identity
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
```

```
AssumeRole flow:
  1. Caller sends sts:AssumeRole request with role ARN
  2. STS checks:
     a. Does the role's trust policy allow this principal?
     b. Does the caller have sts:AssumeRole permission?
     c. Are all conditions met (MFA, ExternalId, etc.)?
  3. If allowed, STS returns temporary credentials:
     - AccessKeyId (starts with ASIA)
     - SecretAccessKey
     - SessionToken (required for all API calls)
     - Expiration (default 1 hour, max depends on role config)
  4. Caller uses temporary credentials to make AWS API calls
```

---

## 5. IAM Policies

IAM policies are **JSON documents** that define permissions. They specify which actions are allowed or denied on which resources under what conditions.

### 5.1 Policy Structure (JSON)

Every IAM policy follows this structure.

```json
{
  "Version": "2012-10-17",              // Policy language version (always use this date)
  "Id": "optional-policy-identifier",   // Optional identifier for the policy
  "Statement": [                         // Array of individual permission statements
    {
      "Sid": "AllowS3Read",              // Statement ID (optional, for readability)
      "Effect": "Allow",                 // "Allow" or "Deny"
      "Action": [                        // API actions (service:action format)
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [                      // ARNs of resources this applies to
        "arn:aws:s3:::my-bucket",        // The bucket itself (for ListBucket)
        "arn:aws:s3:::my-bucket/*"       // Objects in the bucket (for GetObject)
      ],
      "Condition": {                     // Optional conditions
        "IpAddress": {
          "aws:SourceIp": "10.0.0.0/8"  // Only allow from this IP range
        }
      }
    }
  ]
}
```

```json
// Real-world example: Developer policy for a project
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEC2Describe",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",                // All EC2 Describe actions (read-only)
        "ec2:StartInstances",
        "ec2:StopInstances"
      ],
      "Resource": "*",                   // EC2 Describe actions don't support resource-level perms
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"  // Only in us-east-1
        }
      }
    },
    {
      "Sid": "AllowS3ProjectBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::project-x-bucket",
        "arn:aws:s3:::project-x-bucket/*"
      ]
    },
    {
      "Sid": "AllowDynamoDBProjectTable",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/project-x-*"
    },
    {
      "Sid": "DenyDeleteProtectedResources",
      "Effect": "Deny",                 // Explicit deny — overrides any Allow
      "Action": [
        "s3:DeleteBucket",
        "dynamodb:DeleteTable",
        "rds:DeleteDBInstance"
      ],
      "Resource": "*"
    }
  ]
}
```

### 5.2 AWS Managed vs Customer Managed vs Inline

IAM supports three types of policies, each with different use cases.

```
AWS Managed Policies:
  - Created and maintained by AWS
  - Prefixed with "arn:aws:iam::aws:policy/"
  - Examples: AmazonS3ReadOnlyAccess, AdministratorAccess
  - Pros: Easy to use, updated by AWS when services change
  - Cons: Often too broad (not least-privilege), cannot modify

Customer Managed Policies:
  - Created and maintained by you
  - Prefixed with "arn:aws:iam::<account-id>:policy/"
  - Reusable — attach to multiple users, groups, or roles
  - Supports versioning (up to 5 versions, can set a default)
  - Pros: Tailored to your needs, reusable, auditable
  - Cons: You must maintain them

Inline Policies:
  - Embedded directly in a single user, group, or role
  - Deleted when the identity is deleted
  - Not reusable across identities
  - Pros: Strict 1:1 relationship (policy deleted with identity)
  - Cons: Hard to manage at scale, no versioning, not reusable
  - Use case: When you need a policy that MUST NOT be attached to anything else
```

```bash
# Create a customer managed policy
aws iam create-policy \
  --policy-name ProjectX-S3-Access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject"],
        "Resource": "arn:aws:s3:::project-x-bucket/*"
      }
    ]
  }'
# Returns: arn:aws:iam::123456789012:policy/ProjectX-S3-Access

# Create a new version of the policy (for updates)
aws iam create-policy-version \
  --policy-arn arn:aws:iam::123456789012:policy/ProjectX-S3-Access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
        "Resource": [
          "arn:aws:s3:::project-x-bucket",
          "arn:aws:s3:::project-x-bucket/*"
        ]
      }
    ]
  }' \
  --set-as-default  # Make this the active version

# List all versions of a policy
aws iam list-policy-versions \
  --policy-arn arn:aws:iam::123456789012:policy/ProjectX-S3-Access

# Create an inline policy on a role
aws iam put-role-policy \
  --role-name MyLambdaRole \
  --policy-name InlineS3Policy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::config-bucket/app-config.json"
      }
    ]
  }'
```

### 5.3 Policy Evaluation Logic

When a principal makes an AWS API request, IAM evaluates all applicable policies in a specific order. Understanding this is critical for troubleshooting access issues.

```
Policy Evaluation Order:

1. Explicit Deny     → If ANY policy says Deny → DENIED (final, cannot be overridden)
2. SCP (Org level)   → Service Control Policies must Allow (if using AWS Organizations)
3. Resource Policy   → Resource-based policies (e.g., S3 bucket policy) evaluated
4. Permission Boundary → If set, must Allow
5. Session Policy    → If using assumed role with session policy, must Allow
6. Identity Policy   → User/group/role policies must Allow
7. Default Deny      → If nothing explicitly Allows → DENIED

Simplified flow:
  Request → Explicit Deny? → DENIED
         → No deny → Any Allow? → ALLOWED
                   → No allow → DENIED (default)
```

```
Evaluation across policy types:

                        ┌─────────────────────────────────────┐
                        │ Is there an explicit Deny?          │
                        │   YES → DENY (always wins)          │
                        │   NO  ↓                             │
                        │ Is there an SCP Allow?              │
                        │   NO  → DENY                        │
                        │   YES ↓                             │
                        │ Is there a resource-based Allow?    │
                        │   YES → ALLOW (for same account)    │
                        │   NO  ↓                             │
                        │ Is there a permission boundary?     │
                        │   YES → Does it Allow? If not, DENY │
                        │   NO  ↓                             │
                        │ Is there an identity-based Allow?   │
                        │   YES → ALLOW                       │
                        │   NO  → DENY (default deny)         │
                        └─────────────────────────────────────┘
```

```json
// Example: Explicit Deny always wins
// Even if the user has AdministratorAccess, this deny blocks S3 delete
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEverything",
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    },
    {
      "Sid": "DenyS3Delete",
      "Effect": "Deny",              // This WINS over the Allow above
      "Action": "s3:DeleteObject",
      "Resource": "arn:aws:s3:::production-bucket/*"
    }
  ]
}
```

### 5.4 Conditions

Conditions add fine-grained control to policies by evaluating request context such as IP address, time, MFA status, tags, and more.

```json
// Condition operators and examples
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowOnlyFromCorporateIP",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["10.0.0.0/8", "172.16.0.0/12"]  // Corporate IP ranges
        }
      }
    },
    {
      "Sid": "AllowOnlyWithMFA",
      "Effect": "Allow",
      "Action": "iam:*",
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"  // Must have MFA active
        }
      }
    },
    {
      "Sid": "AllowOnlyInRegion",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": ["us-east-1", "eu-west-1"]  // Only these regions
        }
      }
    },
    {
      "Sid": "AllowOnlyTaggedResources",
      "Effect": "Allow",
      "Action": "ec2:StartInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "development"  // Only dev instances
        }
      }
    },
    {
      "Sid": "AllowDuringBusinessHours",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*",
      "Condition": {
        "DateGreaterThan": { "aws:CurrentTime": "2024-01-01T09:00:00Z" },
        "DateLessThan": { "aws:CurrentTime": "2024-01-01T17:00:00Z" }
      }
    },
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::secure-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"  // Must use KMS encryption
        }
      }
    }
  ]
}
```

```
Common condition keys:
  aws:SourceIp              → Requester's IP address
  aws:MultiFactorAuthPresent → MFA used for the request
  aws:RequestedRegion       → Target AWS region
  aws:CurrentTime           → Current date/time
  aws:PrincipalTag/key      → Tags on the calling principal
  aws:ResourceTag/key       → Tags on the target resource
  aws:PrincipalOrgID        → AWS Organization ID
  aws:SecureTransport       → Was the request made over HTTPS
  s3:x-amz-server-side-encryption → S3 encryption header
  ec2:ResourceTag/key       → Tags on EC2 resources
  iam:PassedToService       → Which service a role is being passed to

Condition operators:
  StringEquals / StringNotEquals       → Exact string match
  StringLike / StringNotLike           → Wildcard match (* and ?)
  IpAddress / NotIpAddress             → CIDR range match
  DateEquals / DateGreaterThan / etc.  → Date comparison
  NumericEquals / NumericGreaterThan   → Number comparison
  Bool                                 → Boolean (true/false)
  ArnLike / ArnEquals                  → ARN pattern matching
  Null                                 → Check if a key exists
```

### 5.5 Resource-Based Policies vs Identity-Based

AWS supports two fundamental types of policies that work together but attach to different things.

```
Identity-Based Policies:
  - Attached to IAM users, groups, or roles
  - Defines what that identity CAN DO
  - "I (the user/role) can do X on resource Y"
  - Required for almost all access control

Resource-Based Policies:
  - Attached to AWS resources (S3 buckets, SQS queues, Lambda, KMS, etc.)
  - Defines WHO can access the resource
  - "Resource Y can be accessed by principal Z"
  - Has a "Principal" field (identity-based policies do NOT)
  - Key advantage: enables CROSS-ACCOUNT access without assuming a role
  - Not all services support resource-based policies
```

```json
// Identity-based policy (attached to user/group/role)
// Note: NO "Principal" field — the principal is the entity the policy is attached to
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

```json
// Resource-based policy (attached to an S3 bucket)
// Note: HAS a "Principal" field — defines who can access this bucket
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCrossAccountRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::987654321098:root"  // Another account
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*"
    },
    {
      "Sid": "AllowCloudFrontOAC",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"     // CloudFront service
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1EXAMPLE"
        }
      }
    }
  ]
}
```

```json
// Resource-based policy on Lambda (allow API Gateway to invoke)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAPIGatewayInvoke",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:my-function",
      "Condition": {
        "ArnLike": {
          "AWS:SourceArn": "arn:aws:execute-api:us-east-1:123456789012:abc123/*/GET/users"
        }
      }
    }
  ]
}
```

```
Services that support resource-based policies:
  - S3 (bucket policies)
  - SQS (queue policies)
  - SNS (topic policies)
  - Lambda (function policies)
  - KMS (key policies)
  - ECR (repository policies)
  - API Gateway (resource policies)
  - Secrets Manager
  - EventBridge (event bus policies)
  - CloudWatch Logs (resource policies)

Cross-account access comparison:
  With roles: Principal in Account A assumes role in Account B
    → Gives up Account A permissions, gets Account B role permissions
  With resource-based policy: Account B's resource allows Account A directly
    → Principal keeps Account A permissions AND gets access to Account B resource
    → Simpler, but only works for services that support resource-based policies
```

---

## 6. Security Best Practices

### 6.1 Root Account Protection

The root account has **unrestricted access** to everything in the AWS account. It should almost never be used after initial setup.

```
Root account best practices:
  1. Enable MFA immediately after creating the account
  2. Do NOT create access keys for root (delete them if they exist)
  3. Use root ONLY for tasks that require it:
     - Changing account settings (account name, email, root password)
     - Restoring IAM user permissions (if locked out)
     - Activating IAM access to the Billing console
     - Closing the AWS account
     - Changing or canceling the AWS Support plan
     - Registering as a seller in the Reserved Instance Marketplace
  4. Create an IAM user/role with AdministratorAccess for daily admin work
  5. Set up CloudTrail to monitor root account usage
  6. Use AWS Organizations SCPs to restrict root in member accounts
```

```bash
# Check if root account has access keys (they should not exist)
aws iam get-account-summary --query 'SummaryMap.AccountAccessKeysPresent'
# Should return: 0

# Enable virtual MFA for root (do this from the console)
# Console → IAM → Security credentials → MFA → Assign MFA device

# Create an alert for root account usage
# CloudWatch alarm for root login:
aws cloudwatch put-metric-alarm \
  --alarm-name RootAccountUsage \
  --metric-name RootAccountUsageCount \
  --namespace CloudTrailMetrics \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:SecurityAlerts
```

### 6.2 Least Privilege Principle

Grant only the **minimum permissions** required for a task. Start with zero permissions and add as needed, rather than starting broad and restricting.

```json
// BAD: Overly permissive — gives full S3 access to everything
{
  "Effect": "Allow",
  "Action": "s3:*",
  "Resource": "*"
}

// GOOD: Specific actions on specific resources
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject"
  ],
  "Resource": "arn:aws:s3:::my-app-uploads/*"
}
```

```bash
# Use IAM Access Advisor to find unused permissions
aws iam generate-service-last-accessed-details \
  --arn arn:aws:iam::123456789012:user/john.doe

# Then check results:
aws iam get-service-last-accessed-details \
  --job-id <job-id-from-above>
# Shows which services were last accessed and when
# Remove permissions for services not accessed in 90+ days

# Use IAM Access Analyzer to generate least-privilege policies
# (covered in section 9)
```

```
Implementing least privilege:
  1. Start with NO permissions
  2. Use AWS managed policies for evaluation/testing
  3. Review CloudTrail logs to see what actions are actually used
  4. Use IAM Access Analyzer to generate a policy from actual usage
  5. Replace broad policies with precise, scoped policies
  6. Review and audit regularly (quarterly)
  7. Use permission boundaries for delegated administration
```

### 6.3 MFA

Multi-Factor Authentication adds a second layer of security beyond passwords. IAM supports virtual MFA (app), hardware tokens, and FIDO2 security keys.

```bash
# List MFA devices for a user
aws iam list-mfa-devices --user-name john.doe

# Enable virtual MFA device
# Step 1: Create the virtual MFA device
aws iam create-virtual-mfa-device \
  --virtual-mfa-device-name john-doe-mfa \
  --outfile /tmp/QRCode.png \
  --bootstrap-method QRCodePNG

# Step 2: Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
# Step 3: Enable MFA with two consecutive codes from the app
aws iam enable-mfa-device \
  --user-name john.doe \
  --serial-number arn:aws:iam::123456789012:mfa/john-doe-mfa \
  --authentication-code1 123456 \
  --authentication-code2 789012

# Deactivate MFA (admin action)
aws iam deactivate-mfa-device \
  --user-name john.doe \
  --serial-number arn:aws:iam::123456789012:mfa/john-doe-mfa
```

```json
// Policy: require MFA for all actions except managing own MFA
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowViewAccountInfo",
      "Effect": "Allow",
      "Action": [
        "iam:GetAccountPasswordPolicy",
        "iam:ListVirtualMFADevices"
      ],
      "Resource": "*"
    },
    {
      "Sid": "AllowManageOwnMFA",
      "Effect": "Allow",
      "Action": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:ResyncMFADevice",
        "iam:ListMFADevices"
      ],
      "Resource": [
        "arn:aws:iam::*:mfa/${aws:username}",
        "arn:aws:iam::*:user/${aws:username}"
      ]
    },
    {
      "Sid": "DenyAllExceptMFASetupWithoutMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "iam:ListVirtualMFADevices",
        "iam:ResyncMFADevice",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"    // No MFA → deny everything else
        }
      }
    }
  ]
}
```

### 6.4 Password Policies

Account-level password policies enforce complexity, rotation, and reuse rules for all IAM user passwords.

```bash
# Set a strong password policy
aws iam update-account-password-policy \
  --minimum-password-length 14 \
  --require-symbols \
  --require-numbers \
  --require-uppercase-characters \
  --require-lowercase-characters \
  --allow-users-to-change-password \
  --max-password-age 90 \
  --password-reuse-prevention 12 \
  --hard-expiry    # Prevent expired passwords from being used (must contact admin)

# View current password policy
aws iam get-account-password-policy

# Output:
# {
#     "PasswordPolicy": {
#         "MinimumPasswordLength": 14,
#         "RequireSymbols": true,
#         "RequireNumbers": true,
#         "RequireUppercaseCharacters": true,
#         "RequireLowercaseCharacters": true,
#         "AllowUsersToChangePassword": true,
#         "ExpirePasswords": true,
#         "MaxPasswordAge": 90,
#         "PasswordReusePrevention": 12,
#         "HardExpiry": true
#     }
# }

# Delete the password policy (revert to AWS defaults)
aws iam delete-account-password-policy
```

### 6.5 Access Key Rotation

Access keys should be rotated regularly (every 90 days) to limit the impact of compromised credentials.

```bash
# Access key rotation process (zero-downtime):

# Step 1: Create a second access key (users can have max 2)
aws iam create-access-key --user-name svc-deploy-pipeline
# Save the new key securely

# Step 2: Update applications/configs to use the new key
# Update in: CI/CD secrets, .aws/credentials, environment variables, etc.

# Step 3: Verify the new key works
AWS_ACCESS_KEY_ID=AKIANEWKEY... AWS_SECRET_ACCESS_KEY=newsecret... \
  aws sts get-caller-identity

# Step 4: Deactivate the OLD key (don't delete yet — monitor for errors)
aws iam update-access-key \
  --user-name svc-deploy-pipeline \
  --access-key-id AKIAOLDKEY... \
  --status Inactive

# Step 5: Wait 1-2 weeks, check CloudTrail for any usage of the old key
# If no issues, delete the old key
aws iam delete-access-key \
  --user-name svc-deploy-pipeline \
  --access-key-id AKIAOLDKEY...
```

```json
// Policy to enforce access key rotation (deny if key is older than 90 days)
// Note: This is typically enforced via AWS Config rules, not IAM policies
// AWS Config rule:
{
  "ConfigRuleName": "access-keys-rotated",
  "Source": {
    "Owner": "AWS",
    "SourceIdentifier": "ACCESS_KEYS_ROTATED"
  },
  "InputParameters": {
    "maxAccessKeyAge": "90"
  }
}
```

```bash
# Script: Find and report access keys older than 90 days
aws iam generate-credential-report
sleep 5
aws iam get-credential-report --output text --query Content | base64 --decode > /tmp/cred-report.csv

# The CSV contains columns:
# user, arn, user_creation_time, password_enabled, password_last_used,
# password_last_changed, password_next_rotation, mfa_active,
# access_key_1_active, access_key_1_last_rotated, access_key_1_last_used_date, ...
```

---

## 7. Identity Federation

Identity federation allows external identities (corporate directory, Google, Facebook, etc.) to access AWS resources **without creating IAM users**. This is the recommended approach for organizations with existing identity systems.

### 7.1 SAML 2.0

SAML 2.0 federation integrates corporate identity providers (Active Directory, Okta, Azure AD) with AWS. Users authenticate against their corporate IdP and receive temporary AWS credentials.

```
SAML 2.0 Federation flow:

  1. User logs in to corporate IdP (e.g., Active Directory via ADFS)
  2. IdP authenticates user and returns a SAML assertion
  3. User/browser sends SAML assertion to AWS STS (AssumeRoleWithSAML)
  4. STS validates the assertion against the configured SAML provider
  5. STS returns temporary credentials (AccessKeyId, SecretAccessKey, SessionToken)
  6. User accesses AWS resources with temporary credentials

  User → Corporate IdP → SAML Assertion → AWS STS → Temporary Credentials → AWS
```

```bash
# Step 1: Create a SAML identity provider in IAM
aws iam create-saml-provider \
  --saml-metadata-document file://metadata.xml \
  --name CorporateADFS

# Step 2: Create a role that trusts the SAML provider
aws iam create-role \
  --role-name SAML-DeveloperRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Federated": "arn:aws:iam::123456789012:saml-provider/CorporateADFS"
        },
        "Action": "sts:AssumeRoleWithSAML",
        "Condition": {
          "StringEquals": {
            "SAML:aud": "https://signin.aws.amazon.com/saml"
          }
        }
      }
    ]
  }'

# Step 3: Attach permissions to the role
aws iam attach-role-policy \
  --role-name SAML-DeveloperRole \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# Step 4: Users can now sign in via:
# https://signin.aws.amazon.com/saml
# (redirected through their corporate IdP)
```

### 7.2 Web Identity Federation (Cognito)

Web identity federation allows users authenticated by web identity providers (Google, Facebook, Amazon, Apple, or any OIDC provider) to access AWS resources. Amazon Cognito is the recommended way to implement this.

```
Cognito federation flow:

  1. User signs in with Google/Facebook/custom auth
  2. App sends the identity token to Cognito Identity Pool
  3. Cognito validates the token with the IdP
  4. Cognito calls STS to get temporary AWS credentials
  5. Cognito returns credentials to the app
  6. App uses credentials to access AWS services (S3, DynamoDB, etc.)

  Mobile/Web App → Login (Google) → Token → Cognito Identity Pool → STS → AWS
```

```bash
# Create a Cognito Identity Pool
aws cognito-identity create-identity-pool \
  --identity-pool-name MyAppUsers \
  --allow-unauthenticated-identities false \
  --supported-login-providers '{
    "accounts.google.com": "GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "graph.facebook.com": "FACEBOOK_APP_ID"
  }'

# Create IAM roles for authenticated and unauthenticated users
# Authenticated role:
aws iam create-role \
  --role-name Cognito-AuthRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": { "Federated": "cognito-identity.amazonaws.com" },
        "Action": "sts:AssumeRoleWithWebIdentity",
        "Condition": {
          "StringEquals": {
            "cognito-identity.amazonaws.com:aud": "us-east-1:IDENTITY_POOL_ID"
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated"
          }
        }
      }
    ]
  }'
```

```json
// Policy for Cognito authenticated users — scoped to their own data
// Uses ${cognito-identity.amazonaws.com:sub} for per-user access
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowUserOwnS3Folder",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::my-app-user-data/${cognito-identity.amazonaws.com:sub}/*"
    },
    {
      "Sid": "AllowUserOwnDynamoDBItems",
      "Effect": "Allow",
      "Action": ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Query"],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/UserData",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${cognito-identity.amazonaws.com:sub}"]
        }
      }
    }
  ]
}
```

### 7.3 SSO / IAM Identity Center

AWS IAM Identity Center (formerly AWS SSO) is the **recommended** way to manage workforce access across multiple AWS accounts in an AWS Organization. It provides a single sign-on portal for all your AWS accounts and applications.

```
IAM Identity Center overview:

  ┌────────────────────────────────┐
  │  Identity Source               │
  │  (Identity Center dir,        │
  │   Active Directory, or        │
  │   external IdP like Okta)     │
  └──────────┬─────────────────────┘
             │ authenticate
             ▼
  ┌────────────────────────────────┐
  │  IAM Identity Center           │
  │  - SSO Portal                  │
  │  - Permission Sets             │
  │  - Account Assignments         │
  └──────────┬─────────────────────┘
             │ creates temporary roles
             ▼
  ┌────────────────────────────────┐
  │  AWS Accounts                  │
  │  Account A (Dev)               │
  │  Account B (Staging)           │
  │  Account C (Production)        │
  └────────────────────────────────┘

Key concepts:
  - Permission Sets: Templates that define permissions (map to IAM roles in each account)
  - Account Assignments: Link users/groups to accounts with permission sets
  - SSO Portal: Single URL (e.g., https://mycompany.awsapps.com/start)
  - Supports: AWS Console, CLI (aws sso login), and SDK access
```

```bash
# Configure AWS CLI for IAM Identity Center (SSO)
# In ~/.aws/config:
# [profile dev-admin]
# sso_start_url = https://mycompany.awsapps.com/start
# sso_region = us-east-1
# sso_account_id = 123456789012
# sso_role_name = AdministratorAccess
# region = us-east-1

# Login via SSO
aws sso login --profile dev-admin

# Use the SSO profile
aws s3 ls --profile dev-admin

# Or set as default
export AWS_PROFILE=dev-admin
aws s3 ls
```

```
IAM Identity Center vs IAM Users:

| Feature               | IAM Identity Center        | IAM Users              |
|-----------------------|---------------------------|------------------------|
| Multi-account         | Built-in                  | Must create per account|
| SSO portal            | Yes                       | No                     |
| Central management    | Yes (one place)           | Per-account management |
| Credential type       | Temporary (STS)           | Long-term (access keys)|
| External IdP support  | Built-in                  | Manual SAML setup      |
| CLI access            | aws sso login             | Static keys in config  |
| Recommended for       | Organizations with 2+ accounts | Single account, legacy|
```

---

## 8. STS (Security Token Service)

AWS Security Token Service (STS) is a global service that provides **temporary, limited-privilege credentials** for IAM users, federated users, and roles. It is the backbone of IAM roles and federation.

### 8.1 Temporary Credentials

Temporary credentials consist of three parts and expire automatically.

```
Temporary credential components:
  1. AccessKeyId      → Starts with "ASIA" (vs "AKIA" for permanent keys)
  2. SecretAccessKey   → Used to sign requests
  3. SessionToken      → MUST be included in every API request
  4. Expiration        → Timestamp when credentials expire

Key differences from permanent credentials:
  - Auto-expire (no need to rotate)
  - Not stored with any user (generated on demand)
  - Can be scoped down (session policies)
  - Safer for cross-account and temporary access
```

```
STS API actions:
  AssumeRole             → Get creds by assuming an IAM role (most common)
  AssumeRoleWithSAML     → Get creds using a SAML assertion
  AssumeRoleWithWebIdentity → Get creds using an OIDC/web identity token
  GetSessionToken        → Get temp creds for an IAM user (with MFA)
  GetFederationToken     → Get temp creds for federated users
  GetCallerIdentity      → Returns identity of the caller (no permissions needed)
  DecodeAuthorizationMessage → Decode encoded authorization failure messages
```

### 8.2 AssumeRole API

AssumeRole is the most commonly used STS action. It returns temporary credentials for a specified role.

```bash
# Basic AssumeRole
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeployRole \
  --role-session-name deploy-session-2024

# Output:
# {
#     "Credentials": {
#         "AccessKeyId": "ASIAIOSFODNN7EXAMPLE",
#         "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
#         "SessionToken": "FwoGZXIvYXdzEB...(very long string)",
#         "Expiration": "2024-01-15T12:00:00Z"
#     },
#     "AssumedRoleUser": {
#         "AssumedRoleId": "AROA3XFRBF23:deploy-session-2024",
#         "Arn": "arn:aws:sts::123456789012:assumed-role/DeployRole/deploy-session-2024"
#     }
# }

# AssumeRole with custom duration (default 1 hour, max 12 hours)
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/LongRunningRole \
  --role-session-name long-session \
  --duration-seconds 43200  # 12 hours (role must have MaxSessionDuration >= 43200)

# AssumeRole with MFA
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/AdminRole \
  --role-session-name admin-session \
  --serial-number arn:aws:iam::123456789012:mfa/john.doe \
  --token-code 123456  # 6-digit code from MFA device

# AssumeRole with session policy (further restrict the role's permissions)
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeployRole \
  --role-session-name restricted-session \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::deploy-bucket/*"
      }
    ]
  }'
# Effective permissions = intersection of role policy AND session policy

# AssumeRole with external ID (for third-party access)
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/ThirdPartyAuditRole \
  --role-session-name audit-session \
  --external-id "UniqueId-provided-by-third-party"
```

### 8.3 Session Tokens

GetSessionToken provides temporary credentials for IAM users, typically used to enable MFA-protected API calls.

```bash
# GetSessionToken — for IAM user with MFA
aws sts get-session-token \
  --serial-number arn:aws:iam::123456789012:mfa/john.doe \
  --token-code 123456 \
  --duration-seconds 3600

# Output:
# {
#     "Credentials": {
#         "AccessKeyId": "ASIAIOSFODNN7EXAMPLE",
#         "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
#         "SessionToken": "FwoGZXIvYXdzEB...",
#         "Expiration": "2024-01-15T11:30:00Z"
#     }
# }

# Use the session token for MFA-protected actions
export AWS_ACCESS_KEY_ID=ASIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_SESSION_TOKEN=FwoGZXIvYXdzEB...

# Now MFA-protected actions will work
aws iam delete-user --user-name temp-user  # If this action requires MFA
```

```
STS credential durations:

| API                       | Default Duration | Max Duration         |
|---------------------------|-----------------|----------------------|
| AssumeRole                | 1 hour          | 12 hours (role config)|
| AssumeRoleWithSAML        | 1 hour          | 12 hours             |
| AssumeRoleWithWebIdentity | 1 hour          | 12 hours             |
| GetSessionToken           | 12 hours        | 36 hours             |
| GetFederationToken        | 12 hours        | 36 hours             |

Note: For AssumeRole, the max duration is set on the role:
  aws iam update-role --role-name MyRole --max-session-duration 43200
```

```
Role chaining:
  - When Role A assumes Role B, and Role B assumes Role C
  - Maximum session duration is limited to 1 HOUR (cannot be increased)
  - Role chaining depth is not limited but each hop resets the 1-hour max
  - Use case: Account A → Hub Account → Account B (common in large orgs)
  - Each step requires trust policies to be configured correctly

  User → AssumeRole(RoleA) → AssumeRole(RoleB) → AssumeRole(RoleC)
                          each hop: max 1 hour
```

---

## 9. IAM Access Analyzer

IAM Access Analyzer helps you identify resources in your account that are **shared with external entities** and validates policies for security and best practices. It uses automated reasoning (formal logic) to analyze policies.

```
Access Analyzer capabilities:

1. External Access Findings:
   - Identifies resources shared outside your account/organization
   - S3 buckets, IAM roles, KMS keys, Lambda functions, SQS queues
   - Generates findings with details on who has access and how

2. Unused Access Findings:
   - Identifies unused IAM roles, access keys, passwords
   - Shows unused permissions (actions never called)
   - Helps achieve least privilege

3. Policy Validation:
   - Checks policies for errors, warnings, and suggestions
   - Grammar checks, security warnings, best practice recommendations

4. Policy Generation:
   - Analyzes CloudTrail logs to generate least-privilege policies
   - Creates policies based on actual API usage (past 90 days)
```

```bash
# Create an Access Analyzer (one per region)
aws accessanalyzer create-analyzer \
  --analyzer-name MyAccountAnalyzer \
  --type ACCOUNT  # or ORGANIZATION for org-wide analysis

# List findings (resources shared externally)
aws accessanalyzer list-findings \
  --analyzer-arn arn:aws:access-analyzer:us-east-1:123456789012:analyzer/MyAccountAnalyzer

# Example finding:
# {
#     "id": "finding-id-123",
#     "principal": { "AWS": "987654321098" },
#     "action": ["s3:GetObject"],
#     "resource": "arn:aws:s3:::my-bucket",
#     "isPublic": false,
#     "resourceType": "AWS::S3::Bucket",
#     "condition": {},
#     "status": "ACTIVE"
# }

# Validate a policy before applying it
aws accessanalyzer validate-policy \
  --policy-type IDENTITY_POLICY \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "s3:*",
        "Resource": "*"
      }
    ]
  }'
# Returns warnings like:
# "findingType": "SUGGESTION",
# "message": "Using wildcards in the action and resource is overly permissive"

# Generate a policy from CloudTrail activity (least privilege)
aws accessanalyzer start-policy-generation \
  --policy-generation-details '{
    "principalArn": "arn:aws:iam::123456789012:role/MyLambdaRole",
    "cloudTrailDetails": {
      "trails": [
        {
          "cloudTrailArn": "arn:aws:cloudtrail:us-east-1:123456789012:trail/my-trail",
          "allRegions": true
        }
      ],
      "accessRole": "arn:aws:iam::123456789012:role/AccessAnalyzerRole",
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-03-31T23:59:59Z"
    }
  }'

# Retrieve the generated policy
aws accessanalyzer get-generated-policy --job-id <job-id>
# Returns a policy with ONLY the actions the role actually used in that period
```

```
Access Analyzer real-world workflow:

  1. Enable Access Analyzer in every region
  2. Review external access findings weekly
     - Archive expected findings (known cross-account sharing)
     - Remediate unexpected findings immediately
  3. Run unused access analysis monthly
     - Remove unused roles older than 90 days
     - Revoke unused permissions
  4. Use policy generation when creating new roles
     - Deploy role with broad permissions (in dev)
     - After 30+ days, generate policy from actual usage
     - Replace broad policy with generated least-privilege policy
  5. Validate all policies in CI/CD pipeline before deployment
```

---

## 10. Interview Questions & Answers

### Beginner

---

**Q1: What is IAM and why is it important?**

IAM (Identity and Access Management) is a global AWS service that manages authentication (who can sign in) and authorization (what they can do). It is important because:

1. **Security**: Controls access to all AWS resources at a granular level
2. **No cost**: IAM itself is free
3. **Global**: Works across all AWS regions
4. **Compliance**: Enables audit trails and access reviews
5. **Least privilege**: Allows granting only the exact permissions needed

Without IAM, everyone would have root access to everything, which is a massive security risk.

---

**Q2: What is the difference between IAM Users, Groups, and Roles?**

| Entity | Purpose | Credentials | Use Case |
|--------|---------|-------------|----------|
| **User** | Represents a person or application | Long-term (password, access keys) | Individual developer, service account |
| **Group** | Collection of users | None (inherits from policies) | Team-based permissions (developers, admins) |
| **Role** | Assumable identity | Temporary (STS) | EC2 instances, Lambda, cross-account, federation |

Key distinctions:
- Users have permanent credentials; Roles have temporary credentials
- Groups cannot be nested and cannot contain roles
- Roles can be assumed by users, services, or other accounts
- Best practice: Prefer roles over users wherever possible

---

**Q3: What is the difference between Authentication and Authorization in IAM?**

**Authentication** = "Who are you?" — Proving identity

- Username + password (console)
- Access key + secret key (CLI/API)
- Session token (temporary credentials)
- MFA code (second factor)

**Authorization** = "What can you do?" — Checking permissions

- Evaluated by IAM policies (JSON documents)
- Every API call is checked against applicable policies
- Default behavior is DENY (must be explicitly allowed)
- Explicit DENY always overrides any ALLOW

Example: John authenticates with his access keys, then when he tries `s3:PutObject`, IAM checks all his policies to determine if that action is authorized.

---

**Q4: What is an IAM Policy and what does it look like?**

An IAM policy is a JSON document that defines permissions. It specifies which actions are allowed or denied on which resources.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"]
    }
  ]
}
```

Key elements:
- **Version**: Always "2012-10-17" (the current policy language version)
- **Statement**: Array of permission rules
- **Effect**: "Allow" or "Deny"
- **Action**: AWS API actions (service:action format)
- **Resource**: ARNs of the resources the policy applies to
- **Condition** (optional): Additional constraints (IP, MFA, time, etc.)

---

**Q5: What are the types of IAM Policies?**

1. **AWS Managed Policies**: Pre-built by AWS (e.g., `AmazonS3ReadOnlyAccess`). Convenient but often too broad.
2. **Customer Managed Policies**: Created by you, reusable across users/groups/roles. Supports versioning (up to 5 versions).
3. **Inline Policies**: Embedded directly in a single user, group, or role. Deleted when the entity is deleted. Use when you need a strict 1:1 relationship.

Best practice: Use customer managed policies for reusability and auditability. Use inline policies only for special cases where the policy must not be reattached to other entities.

---

### Intermediate

---

**Q6: Explain the IAM policy evaluation logic. What happens when there are conflicting Allow and Deny statements?**

IAM evaluates policies in this order:

1. **Explicit Deny** — If any policy explicitly denies the action, it is DENIED immediately. An explicit deny always wins, regardless of any allows.
2. **Organization SCPs** — If using AWS Organizations, Service Control Policies must allow the action.
3. **Resource-based policies** — If the resource has a resource-based policy that allows the action (same-account), it may be allowed.
4. **Permission boundaries** — If set, the action must be within the boundary.
5. **Session policies** — If using assumed role with session policy, it must allow.
6. **Identity-based policies** — The user/role policies must explicitly allow the action.
7. **Default Deny** — If nothing explicitly allows the action, it is DENIED.

The key rule: **Explicit Deny > Everything > Default Deny**. You cannot override an explicit deny with any number of allows.

---

**Q7: What is the difference between Resource-Based Policies and Identity-Based Policies?**

**Identity-Based Policies**: Attached to IAM users, groups, or roles. They define what that identity can do. They do NOT have a "Principal" field because the principal is the entity the policy is attached to.

**Resource-Based Policies**: Attached to AWS resources (S3 buckets, SQS queues, Lambda functions, KMS keys). They define who can access the resource. They HAVE a "Principal" field that specifies who is allowed or denied.

Critical cross-account difference:
- **Same account**: Either an identity-based OR resource-based policy can grant access (they are additive).
- **Cross-account**: BOTH the identity-based policy in the source account AND the resource-based policy on the target resource must allow the action (with one exception: resource-based policies with a direct principal grant can work alone).

Not all services support resource-based policies. Common ones: S3, SQS, SNS, Lambda, KMS, ECR.

---

**Q8: What is the confused deputy problem and how does ExternalId solve it?**

The confused deputy problem occurs in cross-account access when a third-party service (like a monitoring vendor) is tricked into accessing the wrong customer's AWS account.

Scenario:
1. Company A creates a role for Vendor X with trust policy allowing Vendor X's account
2. Attacker knows Company A's role ARN
3. Attacker tells Vendor X to assume Company A's role (by giving the ARN)
4. Vendor X (the "confused deputy") unknowingly assumes the role on behalf of the attacker

Solution — `ExternalId`:
```json
{
  "Condition": {
    "StringEquals": {
      "sts:ExternalId": "UniqueId-from-vendor"
    }
  }
}
```
The ExternalId is a secret shared between Company A and Vendor X. The attacker does not know the ExternalId, so even if they provide the role ARN, the AssumeRole call fails because the condition is not met.

---

**Q9: How do you implement cross-account access? Compare the role-based and resource-based approaches.**

**Approach 1: Cross-Account Roles (AssumeRole)**
- Account B creates a role trusting Account A
- Account A grants its users permission to assume the role
- User in Account A calls `sts:AssumeRole` to get temporary credentials
- User temporarily **gives up Account A permissions** and gets Account B role permissions
- Works for ALL AWS services
- Auditable in both accounts via CloudTrail

**Approach 2: Resource-Based Policies**
- Account B's resource (e.g., S3 bucket) directly allows Account A's principal
- No role assumption needed — Account A user accesses directly
- User **keeps Account A permissions** AND gets access to Account B's resource
- Only works for services that support resource-based policies
- Simpler but less flexible

Use cross-account roles when: accessing multiple services, need clear audit separation, need to restrict source account permissions during access. Use resource-based policies when: accessing a single resource (e.g., S3 bucket), need to retain source account permissions simultaneously.

---

**Q10: What are Permission Boundaries and when would you use them?**

A permission boundary is an advanced IAM feature that sets the **maximum permissions** an IAM entity (user or role) can have. The effective permissions are the intersection of the identity-based policy AND the permission boundary.

```
Effective permissions = Identity Policy ∩ Permission Boundary
```

Use case — **Delegated administration**: You want to let developers create IAM roles for their Lambda functions, but you do not want them to create roles with more permissions than they have.

```json
// Permission boundary: max permissions any developer-created role can have
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:*", "dynamodb:*", "logs:*", "lambda:*"],
      "Resource": "*"
    }
  ]
}
```

```json
// Policy allowing developers to create roles (but only with the boundary attached)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iam:CreateRole", "iam:AttachRolePolicy", "iam:PutRolePolicy"],
      "Resource": "arn:aws:iam::123456789012:role/dev-*",
      "Condition": {
        "StringEquals": {
          "iam:PermissionsBoundary": "arn:aws:iam::123456789012:policy/DeveloperBoundary"
        }
      }
    }
  ]
}
```

Even if a developer attaches `AdministratorAccess` to a role they create, the effective permissions are limited to what the boundary allows (S3, DynamoDB, Logs, Lambda).

---

### Advanced

---

**Q11: Explain the full IAM policy evaluation flow for a cross-account request when both SCPs, permission boundaries, and session policies are involved.**

For a cross-account request where User A in Account 1 assumes a role in Account 2, the full evaluation is:

**Account 1 (source) evaluation:**
1. Account 1 SCPs must allow `sts:AssumeRole`
2. User A's identity-based policies must allow `sts:AssumeRole` on the target role ARN
3. If User A has a permission boundary, it must allow `sts:AssumeRole`

**STS evaluation:**
4. The target role's trust policy must allow User A (or Account 1) as a principal
5. Conditions on the trust policy must be met (MFA, ExternalId, etc.)

**Account 2 (target) — when using the assumed role's credentials:**
6. Account 2 SCPs must allow the requested action
7. The role's identity-based policies must allow the action
8. If the role has a permission boundary, it must allow the action
9. If a session policy was passed during AssumeRole, the action must be within the session policy
10. If the target resource has a resource-based policy with an explicit deny, it takes precedence

Effective permissions = SCP ∩ Permission Boundary ∩ Session Policy ∩ Identity Policy

Any explicit deny at any level results in DENY. A missing allow at any level results in DENY (default deny).

---

**Q12: How would you design an IAM strategy for a multi-account AWS Organization with 50+ accounts?**

```
Architecture:

  Management Account (root)
    ├── SCP: DenyLeaveOrg, DenyDisableCloudTrail, DenyRootUsage
    │
    ├── Security OU
    │   ├── Audit Account (CloudTrail, Config, GuardDuty aggregation)
    │   └── Log Archive Account (centralized logs, write-once S3)
    │
    ├── Infrastructure OU
    │   ├── Shared Services Account (AD, DNS, CI/CD)
    │   └── Network Account (Transit Gateway, VPCs)
    │
    ├── Workload OU
    │   ├── Dev OU     → SCP: DenyProdRegions, AllowOnlyDevResources
    │   ├── Staging OU → SCP: LimitInstanceTypes
    │   └── Prod OU    → SCP: EnforceEncryption, EnforceMFA
    │
    └── Sandbox OU → SCP: DenyExpensiveServices, BudgetLimit
```

Strategy:
1. **IAM Identity Center** for all human access — SSO portal with permission sets
2. **SCPs** at OU level to set guardrails (not for granting permissions — only for restricting)
3. **Permission Sets** mapped to job functions: Admin, Developer, ReadOnly, DataEngineer
4. **Centralized audit** in Security account — CloudTrail, Access Analyzer, Config rules
5. **Cross-account roles** for CI/CD pipelines (GitHub Actions OIDC → Hub Account → Target Account)
6. **Permission boundaries** for developer self-service (create roles within limits)
7. **Tag-based policies** for resource-level access control (Environment=dev, Team=backend)
8. **Automated cleanup** of unused roles and stale access keys via Lambda + Access Analyzer

---

**Q13: How does OIDC federation work with GitHub Actions for CI/CD, and why is it preferred over storing access keys?**

OIDC (OpenID Connect) federation allows GitHub Actions to assume an IAM role without storing any AWS credentials as secrets.

```
Flow:
  1. GitHub Actions workflow runs and requests an OIDC token from GitHub's IdP
  2. The token contains claims: repository, branch, environment, actor, etc.
  3. Workflow calls sts:AssumeRoleWithWebIdentity with the GitHub OIDC token
  4. AWS validates the token against the configured OIDC provider
  5. Trust policy conditions check the token claims (repo, branch, etc.)
  6. STS returns temporary credentials (valid for the session only)
```

```bash
# Step 1: Create the OIDC provider in IAM
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
```

```json
// Step 2: Role trust policy — only allow specific repo and branch
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:myorg/myrepo:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Why preferred over access keys:
- **No secrets to manage or rotate**: Credentials are generated per-run and expire automatically
- **No risk of key leakage**: No long-term credentials stored in GitHub Secrets
- **Granular trust**: Restrict access to specific repositories, branches, and environments
- **Auditability**: Each assume-role call is logged in CloudTrail with full GitHub context
- **Least privilege per-workflow**: Different workflows can assume different roles

---

**Q14: How would you troubleshoot an "Access Denied" error in AWS? Walk through your debugging process.**

Systematic troubleshooting approach:

```
Step 1: Identify the caller
  aws sts get-caller-identity
  → Confirm you are who you think you are (check account, ARN, user/role)

Step 2: Decode the authorization error message (if available)
  aws sts decode-authorization-message --encoded-message <message>
  → Shows the exact action, resource, and conditions that failed

Step 3: Check identity-based policies
  aws iam list-attached-user-policies --user-name john.doe
  aws iam list-user-policies --user-name john.doe  # inline policies
  aws iam list-groups-for-user --user-name john.doe  # then check each group
  → Verify the required action and resource are allowed

Step 4: Check for explicit denies
  → Look for Deny statements in ALL policies (user, group, role, SCP, boundary)
  → An explicit deny on ANY policy overrides all allows

Step 5: Check resource-based policies (if applicable)
  aws s3api get-bucket-policy --bucket my-bucket
  aws sqs get-queue-attributes --queue-url <url> --attribute-names Policy
  → Verify the resource policy allows the caller

Step 6: Check SCPs (if using AWS Organizations)
  → SCPs on the account's OU may be restricting the action
  → SCPs only restrict — they don't grant permissions

Step 7: Check permission boundaries (if set)
  aws iam get-user --user-name john.doe  # look for PermissionsBoundary
  → Effective perms = Identity Policy ∩ Permission Boundary

Step 8: Check conditions
  → MFA required but not present?
  → IP restriction not matching?
  → Wrong region?
  → Tag conditions not met?
  → Time-based conditions outside window?

Step 9: Use IAM Policy Simulator
  aws iam simulate-principal-policy \
    --policy-source-arn arn:aws:iam::123456789012:user/john.doe \
    --action-names s3:GetObject \
    --resource-arns arn:aws:s3:::my-bucket/file.txt
  → Shows whether the action is allowed, denied, and which policy caused it

Step 10: Check CloudTrail
  → Look for the denied API call in CloudTrail logs
  → errorCode: "AccessDenied" or "UnauthorizedAccess"
  → Shows the full request context (principal, action, resource, IP, time)
```

---

**Q15: Explain how tag-based access control (ABAC) works in IAM and compare it with traditional RBAC. When would you choose one over the other?**

**RBAC (Role-Based Access Control)**: Permissions are assigned based on the role a user occupies. Different roles get different policies. When a new resource is created, you must update policies to include it.

**ABAC (Attribute-Based Access Control)**: Permissions are granted based on tags (attributes) on the principal and the resource. When a new resource is created with the right tags, existing policies automatically grant the correct access.

```json
// ABAC policy: Users can only manage resources with matching Project and Team tags
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowActionsOnMatchingTags",
      "Effect": "Allow",
      "Action": [
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:TerminateInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Project": "${aws:PrincipalTag/Project}",
          "ec2:ResourceTag/Team": "${aws:PrincipalTag/Team}"
        }
      }
    },
    {
      "Sid": "AllowCreateWithCorrectTags",
      "Effect": "Allow",
      "Action": "ec2:RunInstances",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestTag/Project": "${aws:PrincipalTag/Project}",
          "aws:RequestTag/Team": "${aws:PrincipalTag/Team}"
        },
        "ForAllValues:StringEquals": {
          "aws:TagKeys": ["Project", "Team", "Name"]
        }
      }
    }
  ]
}
```

```
Comparison:

| Aspect              | RBAC                           | ABAC                          |
|---------------------|-------------------------------|-------------------------------|
| Policy count        | Many (one per role/resource)  | Few (tag-based conditions)    |
| New resource        | Must update policies          | Auto-covered if tagged right  |
| New team/project    | Create new policies and roles | Just tag the user and resources|
| Complexity          | Simple to understand          | More complex conditions       |
| Auditability        | Clear role-to-permission map  | Must audit tags on resources  |
| Granularity         | Role-level                    | Attribute-level (very fine)   |
| Scale               | Harder at scale (policy limit)| Scales better (fewer policies)|

When to use ABAC:
  - Fast-growing orgs with many teams and projects
  - Dynamic environments where resources are created/destroyed frequently
  - When you want to avoid updating policies every time a resource is added
  - When teams should only access their own resources

When to use RBAC:
  - Smaller organizations with stable team structures
  - When permissions map cleanly to job functions
  - When audit requirements demand clear role-to-permission mapping
  - Simpler to implement initially

Best practice: Use a HYBRID approach — RBAC for broad permission categories (admin, developer, readonly) and ABAC for resource-level isolation (team, project, environment tags).
```

---

**Q16: You need to grant a third-party SaaS vendor read-only access to your S3 bucket and DynamoDB table. Design the IAM configuration and explain every security measure you would implement.**

```json
// Step 1: Create a customer managed policy with minimal permissions
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3ReadSpecificBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::analytics-export-bucket",
        "arn:aws:s3:::analytics-export-bucket/vendor-accessible/*"
      ]
    },
    {
      "Sid": "AllowDynamoDBReadSpecificTable",
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:123456789012:table/analytics-data",
        "arn:aws:dynamodb:us-east-1:123456789012:table/analytics-data/index/*"
      ]
    }
  ]
}
```

```json
// Step 2: Create a cross-account role with External ID (prevents confused deputy)
// Trust policy:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::VENDOR_ACCOUNT_ID:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "vendor-unique-id-abc123"
        },
        "IpAddress": {
          "aws:SourceIp": ["203.0.113.0/24"]
        },
        "NumericLessThan": {
          "aws:MultiFactorAuthAge": "3600"
        }
      }
    }
  ]
}
```

```
Security measures:

1. External ID             → Prevents confused deputy attack
2. Source IP restriction    → Only vendor's known IP range
3. MFA age condition       → Vendor must use MFA within the last hour
4. Max session duration    → Set to 1 hour (minimum practical)
5. Least privilege         → Only GetObject, ListBucket, GetItem, Query, Scan
6. Resource scoping        → Only specific bucket prefix and table
7. No write permissions    → Read-only, cannot modify or delete
8. CloudTrail logging      → All API calls by the role are logged
9. Access Analyzer         → Monitor for policy drift or unexpected access
10. Regular review         → Quarterly review of vendor access, revoke if unused
11. Tagging                → Tag the role: Vendor=AnalyticsCo, ReviewDate=2024-06-01
12. Notification           → SNS alert when the role is assumed (via CloudTrail + EventBridge)
```

```bash
# Set max session duration to 1 hour
aws iam update-role --role-name VendorReadOnlyRole --max-session-duration 3600

# Create EventBridge rule to alert on role assumption
aws events put-rule \
  --name VendorRoleAssumed \
  --event-pattern '{
    "source": ["aws.sts"],
    "detail-type": ["AWS API Call via CloudTrail"],
    "detail": {
      "eventName": ["AssumeRole"],
      "requestParameters": {
        "roleArn": ["arn:aws:iam::123456789012:role/VendorReadOnlyRole"]
      }
    }
  }'

aws events put-targets \
  --rule VendorRoleAssumed \
  --targets '[{"Id":"1","Arn":"arn:aws:sns:us-east-1:123456789012:SecurityAlerts"}]'
```

---

**Q17: What are Service Control Policies (SCPs) and how do they interact with IAM policies?**

SCPs are policies attached to AWS Organizations OUs or accounts that define the **maximum permissions** available. They do NOT grant permissions — they only restrict what identity-based and resource-based policies can grant.

```
SCP evaluation:

  SCP says Allow + IAM policy says Allow → ALLOWED
  SCP says Allow + IAM policy says nothing → DENIED (no IAM grant)
  SCP says nothing (implicit deny) + IAM policy says Allow → DENIED (SCP blocks)
  SCP says Deny + anything → DENIED (explicit deny)

  SCPs are like a ceiling — they limit the maximum possible permissions.
  IAM policies are like a floor — they grant the actual permissions.
  Effective = what IAM grants INTERSECTED with what SCPs allow.
```

```json
// SCP: Prevent disabling CloudTrail, GuardDuty, and Config
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyDisablingSecurity",
      "Effect": "Deny",
      "Action": [
        "cloudtrail:StopLogging",
        "cloudtrail:DeleteTrail",
        "guardduty:DeleteDetector",
        "guardduty:DisassociateFromMasterAccount",
        "config:StopConfigurationRecorder",
        "config:DeleteConfigurationRecorder"
      ],
      "Resource": "*"
    }
  ]
}
```

```json
// SCP: Restrict regions to us-east-1 and eu-west-1 only
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonApprovedRegions",
      "Effect": "Deny",
      "NotAction": [
        "iam:*",
        "organizations:*",
        "support:*",
        "sts:*",
        "budgets:*"
      ],
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["us-east-1", "eu-west-1"]
        }
      }
    }
  ]
}
```

Important SCP details:
- SCPs do NOT affect the management account (only member accounts)
- SCPs do NOT affect service-linked roles
- The default SCP is `FullAWSAccess` (allows everything — removing it blocks all access)
- SCPs affect all users and roles in the account, including the root user of member accounts
- Max 5 SCPs per OU or account

---

**Q18: How do you implement break-glass (emergency access) in an IAM-controlled environment?**

Break-glass access provides emergency elevated permissions when normal access channels are unavailable (e.g., IAM Identity Center is down, primary admin is unavailable).

```
Break-glass architecture:

  Normal access: IAM Identity Center → Permission Sets → AWS Accounts

  Emergency access:
    1. Break-glass IAM user (1 per critical account)
       - MFA-protected (hardware token stored in safe)
       - Password in sealed envelope or secrets manager
       - No access keys (console-only)
       - AdministratorAccess policy
       - NOT used day-to-day

    2. Break-glass role (assumable with MFA + approval)
       - Trust policy requires specific break-glass user
       - Requires MFA
       - Maximum session duration: 1 hour
       - CloudTrail + real-time alerting on any usage
```

```json
// Break-glass role trust policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:user/break-glass-admin"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        },
        "NumericLessThan": {
          "aws:MultiFactorAuthAge": "300"
        }
      }
    }
  ]
}
```

```
Break-glass procedures:
  1. Two-person rule: Requires two authorized individuals to access credentials
  2. Hardware MFA token stored in a physical safe
  3. Password sealed and signed — opening triggers an incident review
  4. Immediate alert to security team when break-glass user authenticates
  5. All actions logged and reviewed within 24 hours
  6. Credentials rotated after every use
  7. Quarterly test of break-glass process (ensure it works when needed)
  8. Document the incident and root cause (why was normal access insufficient?)
```

---

## References

- [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide) — Official IAM documentation
- [IAM Policy Reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html) — Policy elements and examples
- [AWS STS API Reference](https://docs.aws.amazon.com/STS/latest/APIReference) — Security Token Service API
