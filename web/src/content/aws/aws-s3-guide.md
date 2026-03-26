# Amazon S3 — Complete Guide

## Table of Contents

- [1. What is S3?](#1-what-is-s3)
- [2. Buckets and Objects](#2-buckets-and-objects)
- [3. Storage Classes](#3-storage-classes)
- [4. Bucket Policies and ACLs](#4-bucket-policies-and-acls)
- [5. Versioning](#5-versioning)
- [6. Lifecycle Rules](#6-lifecycle-rules)
- [7. Encryption](#7-encryption)
- [8. Replication](#8-replication)
- [9. Pre-signed URLs](#9-pre-signed-urls)
- [10. S3 Event Notifications](#10-s3-event-notifications)
- [11. Performance Optimization](#11-performance-optimization)
- [12. Static Website Hosting](#12-static-website-hosting)
- [13. S3 Access Points](#13-s3-access-points)
- [14. S3 Object Lock and Compliance](#14-s3-object-lock-and-compliance)
- [15. Interview Questions & Answers](#15-interview-questions--answers)

---

## 1. What is S3?

Amazon Simple Storage Service (S3) is an **object storage service** that offers virtually unlimited scalability, high availability (99.99%), and 11 9s (99.999999999%) of durability. It stores data as objects within buckets and is accessed via a REST API.

Key characteristics:
- **Object storage** — stores files (objects) up to 5 TB each, not block or file storage
- **Globally unique buckets** — bucket names are unique across ALL AWS accounts
- **Flat namespace** — no real directories; prefixes (folder/) simulate folder structure
- **Eventually consistent for overwrites/deletes** — strong read-after-write consistency (since Dec 2020)
- **Pay-per-use** — charged for storage, requests, and data transfer out
- **Region-scoped** — buckets are created in a specific AWS region (data stays in that region unless replicated)

### When to Use S3

| Good for | Not ideal for |
|----------|---------------|
| Static asset hosting (images, CSS, JS) | Frequently updated, small files (use EBS/EFS) |
| Backup and disaster recovery | POSIX filesystem access (use EFS) |
| Data lake / analytics storage | Database replacement (use DynamoDB/RDS) |
| Log aggregation | Low-latency block storage (use EBS) |
| Media storage and delivery | Real-time file locking (use EFS) |
| Archival (Glacier classes) | Temporary cache (use ElastiCache) |
| Software distribution | |

### Pricing Overview (us-east-1)

```
Storage:        $0.023 per GB/month (Standard)
PUT/POST:       $0.005 per 1,000 requests
GET:            $0.0004 per 1,000 requests
Data transfer:  $0.09 per GB (out to internet, first 10 TB)
Free tier:      5 GB storage, 20,000 GET, 2,000 PUT per month (12 months)

Example: 100 GB stored, 1M GETs, 50 GB transfer out per month
  = 100 * $0.023 + 1000 * $0.0004 + 50 * $0.09
  = $2.30 + $0.40 + $4.50 = $7.20/month
```

---

## 2. Buckets and Objects

S3 stores data as **objects** inside **buckets**. A bucket is a top-level container and an object is a file plus its metadata, identified by a unique key within the bucket.

### 2.1 Bucket Naming Rules

Bucket names must be globally unique across all AWS accounts and follow DNS naming conventions.

```
Rules:
  - 3 to 63 characters long
  - Lowercase letters, numbers, and hyphens only
  - Must start with a letter or number
  - Cannot end with a hyphen
  - Cannot contain consecutive periods (..)
  - Cannot be formatted as an IP address (e.g., 192.168.1.1)
  - Must be unique across ALL AWS accounts globally

Valid:     my-app-assets-2024, company-logs-us-east-1
Invalid:   My-Bucket (uppercase), -bucket (starts with hyphen),
           my..bucket (consecutive periods), 192.168.1.1 (IP format)
```

```bash
# Create a bucket
aws s3 mb s3://my-company-app-assets-prod

# Create a bucket in a specific region
aws s3 mb s3://my-company-app-assets-prod --region us-west-2

# List all buckets
aws s3 ls

# Delete an empty bucket
aws s3 rb s3://my-company-app-assets-prod

# Delete a bucket and ALL its contents (dangerous!)
aws s3 rb s3://my-company-app-assets-prod --force
```

### 2.2 Object Key Structure

An object key is the full path to the object within a bucket. S3 has a flat structure — there are no real directories. The `/` character in keys simulates a folder hierarchy.

```
Bucket:  my-app-assets
Key:     uploads/2024/photos/vacation.jpg

Full S3 URI:   s3://my-app-assets/uploads/2024/photos/vacation.jpg
Full ARN:      arn:aws:s3:::my-app-assets/uploads/2024/photos/vacation.jpg
HTTP URL:      https://my-app-assets.s3.amazonaws.com/uploads/2024/photos/vacation.jpg

Key components:
  - Prefix: uploads/2024/photos/    <-- simulates folder structure
  - Object name: vacation.jpg       <-- the "file name"
  - Full key: uploads/2024/photos/vacation.jpg

Key limits:
  - Max key length: 1,024 bytes (UTF-8 encoded)
  - Can contain any UTF-8 character
  - Safe characters: alphanumeric, !, -, _, ., *, ', (, )
```

```bash
# Upload a file
aws s3 cp ./photo.jpg s3://my-app-assets/uploads/2024/photos/photo.jpg

# Upload with a specific content type
aws s3 cp ./index.html s3://my-website/index.html --content-type "text/html"

# Download a file
aws s3 cp s3://my-app-assets/uploads/2024/photos/photo.jpg ./local-photo.jpg

# List objects with a prefix (simulated "folder listing")
aws s3 ls s3://my-app-assets/uploads/2024/

# Sync a local directory to S3 (like rsync)
aws s3 sync ./build/ s3://my-website/ --delete    # --delete removes files in S3 not in local

# Copy objects between buckets
aws s3 cp s3://source-bucket/file.txt s3://dest-bucket/file.txt

# Move (rename) an object
aws s3 mv s3://my-bucket/old-name.txt s3://my-bucket/new-name.txt
```

### 2.3 Object Metadata

Every S3 object has metadata — key-value pairs stored alongside the object. There are two types: system metadata (managed by S3) and user-defined metadata.

```
System metadata (set by S3 or at upload):
  - Content-Type:     MIME type (e.g., image/jpeg, application/json)
  - Content-Length:    Size in bytes
  - Last-Modified:    Timestamp of last modification
  - ETag:             Hash of the object (MD5 for non-multipart uploads)
  - x-amz-server-side-encryption:  Encryption algorithm used

User-defined metadata (custom, prefixed with x-amz-meta-):
  - x-amz-meta-author:     "john-doe"
  - x-amz-meta-project:    "website-v2"
  - x-amz-meta-environment: "production"

Important:
  - User metadata keys are stored in lowercase
  - Total user metadata size: max 2 KB
  - Metadata is immutable after upload — to change it, you must re-upload (copy) the object
```

```bash
# Upload with custom metadata
aws s3 cp ./report.pdf s3://my-bucket/report.pdf \
  --metadata '{"author":"john-doe","project":"q4-report"}'

# View object metadata (head-object shows metadata without downloading)
aws s3api head-object \
  --bucket my-bucket \
  --key report.pdf

# Copy object to itself to update metadata (the only way to modify metadata)
aws s3api copy-object \
  --bucket my-bucket \
  --key report.pdf \
  --copy-source my-bucket/report.pdf \
  --metadata '{"author":"jane-doe","project":"q4-report"}' \
  --metadata-directive REPLACE    # REPLACE = use new metadata; COPY = keep original
```

---

## 3. Storage Classes

S3 offers multiple storage classes designed for different access patterns and cost requirements. Each class varies in durability, availability, retrieval time, and cost.

```
All storage classes provide:
  - 11 9s (99.999999999%) durability — designed to sustain loss of 2 facilities simultaneously
  - Data stored across a minimum of 3 Availability Zones (except One Zone-IA)
```

### 3.1 S3 Standard

The default storage class for frequently accessed data. Offers high throughput, low latency, and no retrieval fees.

```
Availability:     99.99%
Min storage:      No minimum
Retrieval fee:    None
Use cases:        Active websites, content distribution, big data analytics, gaming
Cost:             ~$0.023/GB/month (us-east-1)
```

### 3.2 S3 Intelligent-Tiering

Automatically moves objects between access tiers based on usage patterns. Ideal when access patterns are unpredictable or changing.

```
How it works:
  1. Frequent Access tier     — accessed regularly (same cost as Standard)
  2. Infrequent Access tier   — not accessed for 30 days (40% cheaper)
  3. Archive Instant Access   — not accessed for 90 days (68% cheaper)
  4. Archive Access (opt-in)  — not accessed for 90-730 days
  5. Deep Archive (opt-in)    — not accessed for 180-730 days

Monitoring fee:  $0.0025 per 1,000 objects/month
Retrieval fee:   None for Frequent/Infrequent/Archive Instant tiers
No minimum size: Objects < 128 KB are always in Frequent Access (not monitored)

Best for:  Unknown or changing access patterns, data lakes with mixed access
```

```bash
# Upload with Intelligent-Tiering storage class
aws s3 cp ./data.csv s3://my-bucket/data.csv --storage-class INTELLIGENT_TIERING

# Configure optional archive tiers
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket my-bucket \
  --id my-config \
  --intelligent-tiering-configuration '{
    "Id": "my-config",
    "Status": "Enabled",
    "Tierings": [
      { "AccessTier": "ARCHIVE_ACCESS", "Days": 90 },
      { "AccessTier": "DEEP_ARCHIVE_ACCESS", "Days": 180 }
    ]
  }'
```

### 3.3 S3 Standard-IA (Infrequent Access)

For data accessed less frequently but requiring rapid access when needed. Lower storage cost but charges a retrieval fee per GB.

```
Availability:     99.9%
Min storage:      128 KB per object (billed minimum)
Min duration:     30 days (billed minimum)
Retrieval fee:    $0.01 per GB
Cost:             ~$0.0125/GB/month (46% cheaper than Standard)
Use cases:        Backups, disaster recovery, long-term storage that needs quick access
```

### 3.4 S3 One Zone-IA

Same as Standard-IA but stored in only ONE Availability Zone. 20% cheaper but data is lost if that AZ is destroyed.

```
Availability:     99.5%
Durability:       99.999999999% (within the single AZ)
Min storage:      128 KB per object
Min duration:     30 days
Cost:             ~$0.01/GB/month (20% cheaper than Standard-IA)
Use cases:        Secondary backup copies, easily re-creatable data, thumbnails
Risk:             Data lost if AZ is destroyed (unlike other classes that span 3+ AZs)
```

### 3.5 S3 Glacier (Instant, Flexible, Deep Archive)

Glacier classes are designed for archival storage with varying retrieval speeds and costs.

```
┌──────────────────────────┬──────────────┬──────────────────────────┬────────────────────┐
│ Class                    │ Cost/GB/mo   │ Retrieval Time           │ Min Duration       │
├──────────────────────────┼──────────────┼──────────────────────────┼────────────────────┤
│ Glacier Instant Retrieval│ ~$0.004      │ Milliseconds (same as   │ 90 days            │
│                          │              │ Standard)                │                    │
├──────────────────────────┼──────────────┼──────────────────────────┼────────────────────┤
│ Glacier Flexible         │ ~$0.0036     │ Expedited: 1-5 min      │ 90 days            │
│ Retrieval                │              │ Standard: 3-5 hours     │                    │
│                          │              │ Bulk: 5-12 hours        │                    │
├──────────────────────────┼──────────────┼──────────────────────────┼────────────────────┤
│ Glacier Deep Archive     │ ~$0.00099    │ Standard: 12 hours      │ 180 days           │
│                          │              │ Bulk: 48 hours          │                    │
└──────────────────────────┴──────────────┴──────────────────────────┴────────────────────┘

Glacier Instant Retrieval:
  - Same speed as Standard — milliseconds latency
  - 68% cheaper than Standard
  - Use case: medical images, news archives, quarterly accessed data

Glacier Flexible Retrieval (formerly "Glacier"):
  - Minutes to hours retrieval
  - Use case: backups, disaster recovery, compliance archives

Glacier Deep Archive:
  - Lowest cost storage in AWS
  - 12-48 hour retrieval
  - Use case: regulatory archives (7-10 year retention), tape replacement
```

```bash
# Upload directly to Glacier Flexible Retrieval
aws s3 cp ./archive.tar.gz s3://my-bucket/archives/2024.tar.gz \
  --storage-class GLACIER

# Upload to Deep Archive
aws s3 cp ./compliance-data.zip s3://my-bucket/compliance/2020.zip \
  --storage-class DEEP_ARCHIVE

# Initiate a restore from Glacier Flexible Retrieval
aws s3api restore-object \
  --bucket my-bucket \
  --key archives/2024.tar.gz \
  --restore-request '{"Days": 7, "GlacierJobParameters": {"Tier": "Standard"}}'
#                     ^^ number of days      ^^ Expedited | Standard | Bulk
#                        the restored copy
#                        remains available

# Check restore status
aws s3api head-object --bucket my-bucket --key archives/2024.tar.gz
# Look for: "Restore": "ongoing-request=\"false\", expiry-date=\"...\""
```

### 3.6 Choosing the Right Class

```
Decision tree:

Access frequency?
├── Accessed frequently (daily/weekly)
│   └── S3 Standard
├── Unpredictable access pattern
│   └── S3 Intelligent-Tiering
├── Accessed monthly/quarterly
│   ├── Need millisecond access?
│   │   ├── Yes → Glacier Instant Retrieval
│   │   └── No, minutes OK → Standard-IA
│   └── Can it be re-created if lost?
│       └── Yes → One Zone-IA
├── Accessed 1-2 times per year
│   └── Glacier Flexible Retrieval
└── Regulatory archive (rarely/never accessed)
    └── Glacier Deep Archive

Real-world example (media company):
  - Current articles + images → S3 Standard
  - Articles > 30 days old → Standard-IA (via lifecycle)
  - Articles > 1 year → Glacier Instant Retrieval
  - Raw footage archive → Glacier Deep Archive
```

---

## 4. Bucket Policies and ACLs

S3 provides multiple mechanisms to control access: bucket policies (recommended), ACLs (legacy), and public access block settings. IAM policies can also grant S3 access to users and roles.

```
Access control evaluation order:
  1. Is there an explicit DENY? → DENIED
  2. Is there an explicit ALLOW? → Check next
  3. S3 Block Public Access settings → Can override ALLOW
  4. Bucket policy → Evaluated
  5. ACL → Evaluated (if not disabled)
  6. IAM policy → Evaluated for IAM principals
  If no explicit ALLOW found → DENIED (default deny)
```

### 4.1 Bucket Policy (JSON)

Bucket policies are JSON-based access control policies attached directly to a bucket. They can grant or deny access to the bucket and its objects for any principal (IAM users, roles, other AWS accounts, or anonymous users).

```json
// Allow public read access to all objects (use with caution!)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",                          // * = anyone (public)
      "Action": "s3:GetObject",                  // only allow reading objects
      "Resource": "arn:aws:s3:::my-website/*"    // all objects in bucket
    }
  ]
}
```

```json
// Restrict access to specific IP range (office network only)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowOfficeOnly",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-private-bucket",        // bucket itself
        "arn:aws:s3:::my-private-bucket/*"        // all objects
      ],
      "Condition": {
        "NotIpAddress": {
          "aws:SourceIp": "203.0.113.0/24"       // deny if NOT from this CIDR
        }
      }
    }
  ]
}
```

```json
// Enforce HTTPS only (deny unencrypted HTTP requests)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyHTTP",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::my-secure-bucket/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"          // deny if not using HTTPS
        }
      }
    }
  ]
}
```

```bash
# Apply a bucket policy from a JSON file
aws s3api put-bucket-policy \
  --bucket my-bucket \
  --policy file://bucket-policy.json

# View the current bucket policy
aws s3api get-bucket-policy --bucket my-bucket

# Delete a bucket policy
aws s3api delete-bucket-policy --bucket my-bucket
```

### 4.2 ACLs (Legacy)

Access Control Lists (ACLs) are a legacy access control mechanism. AWS recommends disabling ACLs and using bucket policies + IAM policies instead. Most new buckets have ACLs disabled by default.

```
Predefined ACL groups ("canned ACLs"):
  - private            — owner gets FULL_CONTROL (default)
  - public-read        — owner gets FULL_CONTROL, everyone gets READ
  - public-read-write  — owner gets FULL_CONTROL, everyone gets READ + WRITE
  - authenticated-read — owner gets FULL_CONTROL, authenticated AWS users get READ

ACL permissions:
  - READ           — list objects in bucket / read object
  - WRITE          — create/overwrite/delete objects in bucket
  - READ_ACP       — read the ACL
  - WRITE_ACP      — modify the ACL
  - FULL_CONTROL   — all of the above
```

```bash
# Disable ACLs (recommended — enforce bucket owner for all objects)
aws s3api put-bucket-ownership-controls \
  --bucket my-bucket \
  --ownership-controls '{
    "Rules": [{"ObjectOwnership": "BucketOwnerEnforced"}]
  }'

# If ACLs are enabled: set an object ACL to public-read
aws s3api put-object-acl \
  --bucket my-bucket \
  --key photo.jpg \
  --acl public-read

# View object ACL
aws s3api get-object-acl --bucket my-bucket --key photo.jpg
```

### 4.3 Public Access Settings

S3 Block Public Access is an account-level and bucket-level safety mechanism that prevents accidental public exposure. It overrides bucket policies and ACLs.

```
Four independent settings:
  1. BlockPublicAcls        — blocks PUT requests with public ACLs
  2. IgnorePublicAcls       — ignores existing public ACLs
  3. BlockPublicPolicy      — blocks PUT of bucket policies that grant public access
  4. RestrictPublicBuckets  — restricts access to bucket with public policies
                               (only accessible by AWS services and authorized users)

Best practice: Enable ALL four at the account level, then selectively disable
               per-bucket only when public access is genuinely needed (e.g., static site)
```

```bash
# Block ALL public access on a bucket (recommended default)
aws s3api put-public-access-block \
  --bucket my-bucket \
  --public-access-block-configuration \
    'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

# Block public access at the ACCOUNT level (applies to all buckets)
aws s3control put-public-access-block \
  --account-id 123456789012 \
  --public-access-block-configuration \
    'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true'

# Check public access settings
aws s3api get-public-access-block --bucket my-bucket
```

### 4.4 Cross-Account Access

Grant another AWS account access to your S3 bucket using bucket policies or IAM roles.

```json
// Bucket policy: allow another AWS account to read objects
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CrossAccountRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:root"     // other account's ID
      },
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-shared-bucket",
        "arn:aws:s3:::my-shared-bucket/*"
      ]
    }
  ]
}
```

```json
// Better approach: use an IAM role in the target account
// Step 1: Create role in Account A (bucket owner) with trust policy
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111122223333:root"     // Account B can assume this role
      },
      "Action": "sts:AssumeRole"
    }
  ]
}

// Step 2: Attach S3 access policy to the role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject"],
      "Resource": "arn:aws:s3:::my-shared-bucket/*"
    }
  ]
}

// Step 3: Account B assumes the role to access the bucket
```

```bash
# Account B assumes the cross-account role
aws sts assume-role \
  --role-arn arn:aws:iam::999888777666:role/CrossAccountS3Access \
  --role-session-name s3-access-session

# Use the returned credentials to access the bucket
export AWS_ACCESS_KEY_ID=<returned-access-key>
export AWS_SECRET_ACCESS_KEY=<returned-secret-key>
export AWS_SESSION_TOKEN=<returned-session-token>

aws s3 ls s3://their-shared-bucket/
```

---

## 5. Versioning

S3 versioning keeps multiple variants of an object in the same bucket. When enabled, S3 assigns a unique version ID to every object stored. This protects against accidental deletions and overwrites.

```
Versioning states:
  1. Unversioned (default)  — no version tracking
  2. Enabled                — all objects get version IDs
  3. Suspended              — existing versions retained, new uploads get null version ID

Important:
  - Once enabled, versioning CANNOT be disabled — only suspended
  - Each version is a full copy (not a diff) — doubles/triples storage cost
  - Delete on a versioned object creates a "delete marker" (soft delete)
  - To truly delete, you must delete a specific version ID
```

### 5.1 Enabling Versioning

```bash
# Enable versioning on a bucket
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled

# Check versioning status
aws s3api get-bucket-versioning --bucket my-bucket
# Returns: { "Status": "Enabled" }

# Suspend versioning (does NOT delete existing versions)
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Suspended
```

### 5.2 Working with Versions

```bash
# Upload a file (first version)
aws s3 cp ./config.json s3://my-bucket/config.json
# Version ID: v1abc123

# Upload again (second version — previous version is preserved)
aws s3 cp ./config-v2.json s3://my-bucket/config.json
# Version ID: v2def456

# List all versions of an object
aws s3api list-object-versions \
  --bucket my-bucket \
  --prefix config.json
# Returns all versions with their IDs and timestamps

# Download a specific version
aws s3api get-object \
  --bucket my-bucket \
  --key config.json \
  --version-id v1abc123 \
  ./config-old.json

# "Delete" an object (creates a delete marker — object appears deleted)
aws s3 rm s3://my-bucket/config.json
# A delete marker is placed; GET requests now return 404

# Restore a "deleted" object by removing the delete marker
aws s3api delete-object \
  --bucket my-bucket \
  --key config.json \
  --version-id <delete-marker-version-id>

# Permanently delete a specific version (irreversible)
aws s3api delete-object \
  --bucket my-bucket \
  --key config.json \
  --version-id v1abc123
```

### 5.3 MFA Delete

MFA Delete adds an extra layer of protection by requiring multi-factor authentication to delete object versions or change the versioning state of a bucket. Only the **root account** can enable MFA Delete.

```
MFA Delete protects against:
  - Permanently deleting an object version
  - Changing the versioning state of the bucket (Enabled ↔ Suspended)

Does NOT protect against:
  - Creating delete markers (soft delete)
  - Uploading new versions

Requirements:
  - Must be enabled by the root account (not IAM users)
  - Must use the AWS CLI or API (not the console)
  - Versioning must be enabled
```

```bash
# Enable MFA Delete (must be run as root account)
aws s3api put-bucket-versioning \
  --bucket my-bucket \
  --versioning-configuration Status=Enabled,MFADelete=Enabled \
  --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device 123456"
#        ^^ MFA device ARN                                      ^^ current TOTP code

# Delete a version with MFA
aws s3api delete-object \
  --bucket my-bucket \
  --key config.json \
  --version-id v1abc123 \
  --mfa "arn:aws:iam::123456789012:mfa/root-account-mfa-device 654321"
```

---

## 6. Lifecycle Rules

Lifecycle rules automate transitioning objects between storage classes and expiring (deleting) objects after a defined period. This is essential for cost optimization.

```
Lifecycle rules can:
  1. Transition objects to a cheaper storage class after N days
  2. Expire (delete) objects after N days
  3. Expire incomplete multipart uploads
  4. Expire previous versions (versioned buckets)
  5. Apply to the entire bucket or filtered by prefix/tag

Transition constraints (can only go "down"):
  Standard → Standard-IA → Intelligent-Tiering → One Zone-IA → Glacier Instant
  → Glacier Flexible → Glacier Deep Archive

  Min 30 days before transitioning from Standard to IA classes
  Min 30 days in each class before transitioning to the next
```

### 6.1 Transition Rules

```json
// Lifecycle configuration: transition objects to cheaper tiers over time
{
  "Rules": [
    {
      "ID": "TransitionToIA",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "logs/"                     // only apply to objects under logs/
      },
      "Transitions": [
        {
          "Days": 30,                         // 30 days after creation
          "StorageClass": "STANDARD_IA"       // move to Standard-IA
        },
        {
          "Days": 90,                         // 90 days after creation
          "StorageClass": "GLACIER"           // move to Glacier Flexible
        },
        {
          "Days": 365,                        // 1 year after creation
          "StorageClass": "DEEP_ARCHIVE"      // move to Deep Archive
        }
      ]
    }
  ]
}
```

### 6.2 Expiration Rules

```json
// Delete objects and clean up old versions automatically
{
  "Rules": [
    {
      "ID": "ExpireTempFiles",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "tmp/"                      // only temp files
      },
      "Expiration": {
        "Days": 7                             // delete after 7 days
      }
    },
    {
      "ID": "CleanOldVersions",
      "Status": "Enabled",
      "Filter": {},                           // apply to all objects
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30,                 // delete old versions after 30 days
        "NewerNoncurrentVersions": 3          // keep at least 3 recent versions
      }
    },
    {
      "ID": "CleanUpIncompleteUploads",
      "Status": "Enabled",
      "Filter": {},
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 7              // abort incomplete multipart uploads after 7 days
      }
    }
  ]
}
```

### 6.3 Common Lifecycle Patterns

```bash
# Apply lifecycle configuration from a JSON file
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-bucket \
  --lifecycle-configuration file://lifecycle.json

# View current lifecycle rules
aws s3api get-bucket-lifecycle-configuration --bucket my-bucket

# Delete all lifecycle rules
aws s3api delete-bucket-lifecycle --bucket my-bucket
```

```
Pattern 1: Log Retention (cost-optimized)
  Day 0-30:    S3 Standard (frequent analysis)
  Day 30-90:   Standard-IA (occasional queries)
  Day 90-365:  Glacier Flexible Retrieval (rare access)
  Day 365+:    Delete

Pattern 2: Compliance Archive
  Day 0-90:    S3 Standard
  Day 90-365:  Standard-IA
  Day 365+:    Glacier Deep Archive (keep for 7 years, then delete at day 2555)

Pattern 3: User Uploads with Versioning
  Current version:          S3 Standard
  Previous versions (30d):  Standard-IA
  Previous versions (90d):  Delete
  Incomplete uploads (1d):  Abort

Pattern 4: Data Lake
  Hot data (0-30d):    S3 Standard
  Warm data (30-90d):  Intelligent-Tiering
  Cold data (90d+):    Glacier Instant Retrieval
```

---

## 7. Encryption

S3 supports multiple encryption methods to protect data at rest and in transit. As of January 2023, all new objects are encrypted by default with SSE-S3.

```
Encryption types:
  Server-Side Encryption (data encrypted at rest by AWS):
    - SSE-S3   — S3 manages keys (AES-256) — DEFAULT since Jan 2023
    - SSE-KMS  — AWS KMS manages keys (more control, audit trail)
    - SSE-C    — Customer provides the key (you manage keys entirely)

  Client-Side Encryption:
    - You encrypt before uploading, decrypt after downloading

  In-Transit Encryption:
    - HTTPS/TLS — enforce with bucket policy (aws:SecureTransport)
```

### 7.1 SSE-S3 (Server-Side with S3 Keys)

The simplest option. S3 manages the encryption keys. Each object is encrypted with a unique key, and that key is encrypted with a master key that S3 regularly rotates.

```bash
# Upload with SSE-S3 (this is the default, but you can be explicit)
aws s3 cp ./file.txt s3://my-bucket/file.txt \
  --sse AES256

# Verify encryption on an object
aws s3api head-object --bucket my-bucket --key file.txt
# Response includes: "ServerSideEncryption": "AES256"
```

### 7.2 SSE-KMS (Server-Side with KMS)

Uses AWS Key Management Service for key management. Provides an audit trail via CloudTrail, fine-grained key permissions, and the option to use customer-managed keys (CMKs).

```bash
# Upload with SSE-KMS using the default aws/s3 KMS key
aws s3 cp ./file.txt s3://my-bucket/file.txt \
  --sse aws:kms

# Upload with SSE-KMS using a specific customer-managed key (CMK)
aws s3 cp ./file.txt s3://my-bucket/file.txt \
  --sse aws:kms \
  --sse-kms-key-id arn:aws:kms:us-east-1:123456789012:key/abcd-1234-efgh-5678

# Verify encryption
aws s3api head-object --bucket my-bucket --key file.txt
# Response includes:
#   "ServerSideEncryption": "aws:kms"
#   "SSEKMSKeyId": "arn:aws:kms:..."
```

```
SSE-KMS considerations:
  - KMS API calls count toward your KMS request quota (5,500-30,000 req/sec per region)
  - High-throughput buckets may hit KMS throttling limits
  - Solution: use S3 Bucket Keys (reduces KMS calls by up to 99%)
  - CloudTrail logs every KMS Decrypt/Encrypt call (audit trail)
  - Key policies control who can use the key (separate from S3 permissions)
```

### 7.3 SSE-C (Server-Side with Customer Keys)

You provide the encryption key with every request. S3 performs the encryption/decryption but does not store the key — you must manage key storage yourself.

```bash
# Generate a 256-bit (32-byte) encryption key
ENCRYPTION_KEY=$(openssl rand -base64 32)
KEY_MD5=$(echo -n "$ENCRYPTION_KEY" | base64 -d | openssl dgst -md5 -binary | base64)

# Upload with SSE-C
aws s3api put-object \
  --bucket my-bucket \
  --key secret-file.txt \
  --body ./secret-file.txt \
  --sse-customer-algorithm AES256 \
  --sse-customer-key "$ENCRYPTION_KEY" \
  --sse-customer-key-md5 "$KEY_MD5"

# Download with SSE-C (must provide the SAME key)
aws s3api get-object \
  --bucket my-bucket \
  --key secret-file.txt \
  --sse-customer-algorithm AES256 \
  --sse-customer-key "$ENCRYPTION_KEY" \
  --sse-customer-key-md5 "$KEY_MD5" \
  ./downloaded-file.txt

# IMPORTANT: If you lose the key, the data is IRRECOVERABLE
# HTTPS is REQUIRED for SSE-C (S3 rejects HTTP requests)
```

### 7.4 Client-Side Encryption

You encrypt data before sending it to S3 and decrypt after downloading. S3 never sees the unencrypted data.

```javascript
// Node.js example: client-side encryption with AWS Encryption SDK
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');

const s3 = new S3Client({ region: 'us-east-1' });

// Encrypt before upload
const key = crypto.randomBytes(32);               // 256-bit key
const iv = crypto.randomBytes(16);                 // initialization vector
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

let encrypted = cipher.update(plaintext, 'utf8');
encrypted = Buffer.concat([encrypted, cipher.final()]);

await s3.send(new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: 'encrypted-file.dat',
  Body: encrypted,
  Metadata: {
    'x-amz-meta-iv': iv.toString('base64'),        // store IV in metadata
    // store key in a secure key management system — NOT in S3!
  }
}));

// Decrypt after download
const response = await s3.send(new GetObjectCommand({
  Bucket: 'my-bucket',
  Key: 'encrypted-file.dat'
}));

const storedIv = Buffer.from(response.Metadata['x-amz-meta-iv'], 'base64');
const decipher = crypto.createDecipheriv('aes-256-cbc', key, storedIv);
let decrypted = decipher.update(await response.Body.transformToByteArray());
decrypted = Buffer.concat([decrypted, decipher.final()]);
```

### 7.5 Bucket Default Encryption

Set a default encryption configuration so all new objects are automatically encrypted without specifying it in every upload.

```bash
# Set default encryption to SSE-S3
aws s3api put-bucket-encryption \
  --bucket my-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Set default encryption to SSE-KMS with a specific key
aws s3api put-bucket-encryption \
  --bucket my-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "aws:kms",
        "KMSMasterKeyID": "arn:aws:kms:us-east-1:123456789012:key/abcd-1234"
      },
      "BucketKeyEnabled": true
    }]
  }'
# BucketKeyEnabled reduces KMS API calls by generating a bucket-level key

# View default encryption configuration
aws s3api get-bucket-encryption --bucket my-bucket
```

```json
// Bucket policy to DENY uploads without encryption
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyUnencryptedUploads",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-bucket/*",
      "Condition": {
        "StringNotEquals": {
          "s3:x-amz-server-side-encryption": "aws:kms"    // require KMS encryption
        }
      }
    }
  ]
}
```

---

## 8. Replication

S3 Replication copies objects asynchronously between buckets. It requires versioning enabled on both source and destination buckets. Replication is used for compliance, latency reduction, disaster recovery, and data sovereignty.

```
Requirements:
  - Versioning must be enabled on BOTH source and destination
  - S3 must have IAM permissions to replicate (via a replication role)
  - Objects uploaded BEFORE enabling replication are NOT replicated
    (use S3 Batch Replication to copy existing objects)
  - Delete markers are NOT replicated by default (can be enabled)
  - Permanent deletes (specific version ID) are NEVER replicated (safety)
```

### 8.1 Cross-Region Replication (CRR)

Replicates objects between buckets in different AWS regions. Used for compliance (data in multiple regions), lower latency for global users, or disaster recovery.

```bash
# Step 1: Create replication IAM role
# The role needs s3:GetReplicationConfiguration, s3:ListBucket on source
# and s3:ReplicateObject, s3:ReplicateDelete, s3:ReplicateTags on destination
```

```json
// IAM policy for the replication role
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetReplicationConfiguration",
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::source-bucket"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObjectVersionForReplication",
        "s3:GetObjectVersionAcl",
        "s3:GetObjectVersionTagging"
      ],
      "Resource": "arn:aws:s3:::source-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ReplicateObject",
        "s3:ReplicateDelete",
        "s3:ReplicateTags"
      ],
      "Resource": "arn:aws:s3:::dest-bucket-us-west-2/*"
    }
  ]
}
```

### 8.2 Same-Region Replication (SRR)

Replicates objects between buckets in the same AWS region. Used for log aggregation, data sovereignty with separate accounts, or maintaining a test environment.

```
Use cases for SRR:
  - Aggregate logs from multiple buckets into one
  - Replicate between production and test accounts (same region)
  - Data sovereignty — keep a copy under a different account/ownership
  - Maintain real-time backup in the same region
```

### 8.3 Replication Rules

```json
// Replication configuration with multiple rules
{
  "Role": "arn:aws:iam::123456789012:role/S3ReplicationRole",
  "Rules": [
    {
      "ID": "ReplicateAllToUSWest",
      "Status": "Enabled",
      "Priority": 1,
      "Filter": {},                                      // all objects
      "Destination": {
        "Bucket": "arn:aws:s3:::dest-bucket-us-west-2",
        "StorageClass": "STANDARD_IA",                   // change class at destination
        "ReplicationTime": {
          "Status": "Enabled",                           // S3 Replication Time Control (RTC)
          "Time": { "Minutes": 15 }                      // 99.99% of objects within 15 min
        },
        "Metrics": {
          "Status": "Enabled",                           // enable replication metrics
          "EventThreshold": { "Minutes": 15 }
        }
      },
      "DeleteMarkerReplication": {
        "Status": "Enabled"                              // replicate delete markers too
      }
    },
    {
      "ID": "ArchiveLogsToGlacier",
      "Status": "Enabled",
      "Priority": 2,
      "Filter": {
        "Prefix": "logs/"                                // only replicate logs/
      },
      "Destination": {
        "Bucket": "arn:aws:s3:::archive-bucket",
        "StorageClass": "GLACIER"                        // store as Glacier at destination
      }
    }
  ]
}
```

```bash
# Apply replication configuration
aws s3api put-bucket-replication \
  --bucket source-bucket \
  --replication-configuration file://replication.json

# View replication configuration
aws s3api get-bucket-replication --bucket source-bucket

# Batch replicate existing objects (objects uploaded before replication was enabled)
aws s3control create-job \
  --account-id 123456789012 \
  --operation '{"S3ReplicateObject":{}}' \
  --manifest-generator '{
    "S3JobManifestGenerator": {
      "SourceS3BucketArn": "arn:aws:s3:::source-bucket",
      "EnableManifestOutput": true,
      "ManifestOutputLocation": {
        "Bucket": "arn:aws:s3:::manifest-bucket",
        "ManifestPrefix": "batch-replication"
      },
      "Filter": {
        "EligibleForReplication": true,
        "ObjectReplicationStatuses": ["NONE", "FAILED"]
      }
    }
  }' \
  --report '{"Bucket":"arn:aws:s3:::report-bucket","Prefix":"reports","Format":"Report_CSV_20180820","Enabled":true,"ReportScope":"AllTasks"}' \
  --priority 1 \
  --role-arn arn:aws:iam::123456789012:role/BatchReplicationRole \
  --no-confirmation-required
```

---

## 9. Pre-signed URLs

Pre-signed URLs grant temporary access to private S3 objects without requiring AWS credentials. The URL includes an authentication signature and an expiration time. Commonly used for allowing users to upload or download files directly to/from S3.

```
How it works:
  1. Your server generates a pre-signed URL using its AWS credentials
  2. The URL contains: bucket, key, HTTP method, expiration, signature
  3. Anyone with the URL can perform the specified action until it expires
  4. URL inherits the permissions of the IAM user/role that created it

Use cases:
  - Allow users to download private files (GET)
  - Allow users to upload files directly to S3 (PUT)
  - Temporary access to shared resources
  - CDN origin authentication
```

```bash
# Generate a pre-signed URL for downloading (GET) — expires in 1 hour
aws s3 presign s3://my-bucket/private-file.pdf --expires-in 3600
# Returns: https://my-bucket.s3.amazonaws.com/private-file.pdf?X-Amz-Algorithm=...&X-Amz-Expires=3600&...

# Generate a pre-signed URL for uploading (PUT)
aws s3 presign s3://my-bucket/uploads/user-photo.jpg \
  --expires-in 300
# Client uses this URL with a PUT request to upload directly to S3
```

```javascript
// Node.js: generate pre-signed URLs with AWS SDK v3
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({ region: 'us-east-1' });

// Pre-signed URL for DOWNLOAD (GET)
const downloadUrl = await getSignedUrl(s3, new GetObjectCommand({
  Bucket: 'my-bucket',
  Key: 'private-file.pdf',
}), { expiresIn: 3600 });                   // 1 hour
// → Give this URL to the client to download the file

// Pre-signed URL for UPLOAD (PUT)
const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({
  Bucket: 'my-bucket',
  Key: `uploads/${userId}/${filename}`,
  ContentType: 'image/jpeg',                 // restrict content type
}), { expiresIn: 300 });                     // 5 minutes
// → Client uses: fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': 'image/jpeg' } })
```

```
Pre-signed URL security considerations:
  - Max expiration: 7 days (when using IAM user credentials)
  - For temporary credentials (IAM role/STS): expiration <= token lifetime
  - Anyone with the URL can use it — treat it like a password
  - Cannot be revoked once generated (but you can delete the object or change permissions)
  - Recommend short expiration times (minutes, not days)
  - Use conditions (Content-Type, Content-Length) to restrict uploads
```

---

## 10. S3 Event Notifications

S3 can publish events when objects are created, deleted, or modified. Events can trigger Lambda functions, send messages to SQS queues, or publish to SNS topics. EventBridge integration enables even more flexible event routing.

```
Supported events:
  - s3:ObjectCreated:*          — PUT, POST, COPY, CompleteMultipartUpload
  - s3:ObjectCreated:Put        — only PUT operations
  - s3:ObjectRemoved:*          — Delete, DeleteMarkerCreated
  - s3:ObjectRestore:*          — Glacier restore initiated/completed
  - s3:LifecycleTransition      — object transitioned to another class
  - s3:Replication:*            — replication events
  - s3:ObjectTagging:*          — tag added/deleted
  - s3:LifecycleExpiration:*    — object expired by lifecycle rule
```

### 10.1 Lambda Triggers

The most common pattern — trigger a Lambda function when an object is uploaded to S3.

```json
// S3 event notification configuration: trigger Lambda on upload
{
  "LambdaFunctionConfigurations": [
    {
      "Id": "ProcessImageUpload",
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:123456789012:function:processImage",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            { "Name": "prefix", "Value": "uploads/" },
            { "Name": "suffix", "Value": ".jpg" }         // only JPG files in uploads/
          ]
        }
      }
    }
  ]
}
```

```javascript
// Lambda function triggered by S3 event
exports.handler = async (event) => {
  // event.Records contains the S3 event details
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;              // "my-bucket"
    const key = decodeURIComponent(                    // URL-encoded key
      record.s3.object.key.replace(/\+/g, ' ')
    );
    const size = record.s3.object.size;                // bytes
    const eventName = record.eventName;                // "ObjectCreated:Put"

    console.log(`New object: s3://${bucket}/${key} (${size} bytes)`);

    // Example: generate a thumbnail
    // 1. Download the image from S3
    // 2. Resize with sharp/jimp
    // 3. Upload thumbnail to s3://my-bucket/thumbnails/
  }
};
```

```bash
# Apply notification configuration
aws s3api put-bucket-notification-configuration \
  --bucket my-bucket \
  --notification-configuration file://notification.json

# IMPORTANT: Lambda needs a resource-based policy to allow S3 to invoke it
aws lambda add-permission \
  --function-name processImage \
  --statement-id s3-trigger \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::my-bucket \
  --source-account 123456789012
```

### 10.2 SQS/SNS Notifications

Send events to SQS for asynchronous processing or SNS for fan-out to multiple subscribers.

```json
// Send events to SQS queue and SNS topic
{
  "QueueConfigurations": [
    {
      "Id": "QueueNewUploads",
      "QueueArn": "arn:aws:sqs:us-east-1:123456789012:s3-upload-queue",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            { "Name": "prefix", "Value": "data/" }
          ]
        }
      }
    }
  ],
  "TopicConfigurations": [
    {
      "Id": "NotifyOnDelete",
      "TopicArn": "arn:aws:sns:us-east-1:123456789012:s3-delete-topic",
      "Events": ["s3:ObjectRemoved:*"]
    }
  ]
}
```

```json
// SQS queue policy to allow S3 to send messages
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "s3.amazonaws.com" },
      "Action": "SQS:SendMessage",
      "Resource": "arn:aws:sqs:us-east-1:123456789012:s3-upload-queue",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "arn:aws:s3:::my-bucket"
        }
      }
    }
  ]
}
```

### 10.3 EventBridge Integration

Amazon EventBridge provides advanced event filtering, routing to 18+ AWS service targets, archive/replay, and schema discovery. S3 events sent to EventBridge enable more complex event-driven architectures.

```bash
# Enable EventBridge notifications for a bucket
aws s3api put-bucket-notification-configuration \
  --bucket my-bucket \
  --notification-configuration '{
    "EventBridgeConfiguration": {}
  }'
```

```json
// EventBridge rule: match S3 object-created events for specific prefixes
{
  "source": ["aws.s3"],
  "detail-type": ["Object Created"],
  "detail": {
    "bucket": { "name": ["my-bucket"] },
    "object": {
      "key": [{ "prefix": "uploads/" }],
      "size": [{ "numeric": [">", 0] }]       // ignore zero-byte objects
    }
  }
}
```

```
EventBridge advantages over S3 native notifications:
  - Route to 18+ targets (Lambda, SQS, SNS, Step Functions, ECS, etc.)
  - Advanced filtering (content-based, prefix, suffix, numeric comparisons)
  - Archive events and replay them later
  - Multiple rules per event (fan-out without SNS)
  - Cross-account event delivery
  - Schema registry for event discovery

When to use what:
  - Simple Lambda/SQS/SNS trigger → S3 native notification (simpler setup)
  - Complex routing, filtering, multiple targets → EventBridge
```

---

## 11. Performance Optimization

S3 automatically scales to high request rates: 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix. For extreme workloads, there are several optimization techniques.

```
S3 performance baseline (per prefix):
  - 3,500 PUT/COPY/POST/DELETE requests per second
  - 5,500 GET/HEAD requests per second
  - No limit on the number of prefixes in a bucket

Tip: Distribute objects across prefixes to multiply throughput
  Instead of: s3://bucket/files/file1, s3://bucket/files/file2
  Use:        s3://bucket/a1b2/file1, s3://bucket/c3d4/file2
  (S3 partitions by prefix, so different prefixes = parallel I/O)
```

### 11.1 Multipart Upload

For files larger than 100 MB (required for files >5 GB), multipart upload breaks the file into parts, uploads them in parallel, and assembles them on S3. This improves throughput and allows resumable uploads.

```
Multipart upload details:
  - Required for objects > 5 GB
  - Recommended for objects > 100 MB
  - Each part: 5 MB to 5 GB
  - Max parts: 10,000
  - Max object size: 5 TB (10,000 parts * 5 GB)
  - Parts upload in parallel for better throughput
  - Failed parts can be retried independently
```

```bash
# AWS CLI automatically uses multipart upload for large files
# Configure the multipart threshold and chunk size
aws configure set s3.multipart_threshold 100MB
aws configure set s3.multipart_chunksize 50MB

# Upload a large file (CLI handles multipart automatically)
aws s3 cp ./large-file.zip s3://my-bucket/large-file.zip

# Manual multipart upload with the API
# Step 1: Initiate multipart upload
aws s3api create-multipart-upload \
  --bucket my-bucket \
  --key large-file.zip
# Returns: { "UploadId": "abc123..." }

# Step 2: Upload parts (can be done in parallel)
aws s3api upload-part \
  --bucket my-bucket \
  --key large-file.zip \
  --upload-id abc123 \
  --part-number 1 \
  --body ./part1

aws s3api upload-part \
  --bucket my-bucket \
  --key large-file.zip \
  --upload-id abc123 \
  --part-number 2 \
  --body ./part2

# Step 3: Complete multipart upload
aws s3api complete-multipart-upload \
  --bucket my-bucket \
  --key large-file.zip \
  --upload-id abc123 \
  --multipart-upload '{
    "Parts": [
      { "PartNumber": 1, "ETag": "\"etag1\"" },
      { "PartNumber": 2, "ETag": "\"etag2\"" }
    ]
  }'

# Abort an incomplete multipart upload (reclaim storage)
aws s3api abort-multipart-upload \
  --bucket my-bucket \
  --key large-file.zip \
  --upload-id abc123

# List all incomplete multipart uploads (to find orphaned uploads)
aws s3api list-multipart-uploads --bucket my-bucket
```

### 11.2 S3 Transfer Acceleration

Uses CloudFront's globally distributed edge locations to accelerate uploads and downloads over long distances. Data is routed from the nearest edge location to S3 via AWS's optimized internal network.

```
How it works:
  Client → Nearest CloudFront Edge Location → AWS backbone → S3 bucket

  Normal upload:   Client in Tokyo → Internet → S3 in us-east-1
  Accelerated:     Client in Tokyo → Edge in Tokyo → AWS backbone → S3 in us-east-1

When to use:
  - Users uploading from geographically distant locations
  - Large file uploads over long distances
  - Consistent, fast transfers needed

Cost:  $0.04-0.08/GB on top of regular transfer costs
```

```bash
# Enable Transfer Acceleration on a bucket
aws s3api put-bucket-accelerate-configuration \
  --bucket my-bucket \
  --accelerate-configuration Status=Enabled

# Use the accelerated endpoint for uploads
aws s3 cp ./large-file.zip s3://my-bucket/large-file.zip \
  --endpoint-url https://my-bucket.s3-accelerate.amazonaws.com

# Speed comparison tool (check if acceleration helps for your location)
# https://s3-accelerate-speedtest.s3-accelerate.amazonaws.com/en/accelerate-speed-comparsion.html
```

### 11.3 Byte-Range Fetches

Download only a portion of an object by specifying a byte range. Useful for large files where you only need specific parts, or for parallel downloads.

```bash
# Download only the first 1 MB of a file
aws s3api get-object \
  --bucket my-bucket \
  --key large-file.zip \
  --range "bytes=0-1048575" \
  ./first-1mb.part

# Download bytes 1MB to 2MB
aws s3api get-object \
  --bucket my-bucket \
  --key large-file.zip \
  --range "bytes=1048576-2097151" \
  ./second-1mb.part
```

```javascript
// Node.js: parallel byte-range downloads for faster retrieval
const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({ region: 'us-east-1' });

async function parallelDownload(bucket, key, partSize = 10 * 1024 * 1024) {
  // Get total file size
  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  const totalSize = head.ContentLength;

  // Create byte-range requests
  const parts = [];
  for (let start = 0; start < totalSize; start += partSize) {
    const end = Math.min(start + partSize - 1, totalSize - 1);
    parts.push(
      s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: `bytes=${start}-${end}`,          // fetch this range only
      }))
    );
  }

  // Download all parts in parallel
  const results = await Promise.all(parts);      // parallel network I/O
  // Concatenate parts in order to reconstruct the file
}
```

### 11.4 S3 Select

Run SQL-like queries directly on S3 objects (CSV, JSON, Parquet) to retrieve only the data you need. This reduces data transfer and processing time by up to 400%.

```bash
# Query a CSV file stored in S3 using SQL
aws s3api select-object-content \
  --bucket my-bucket \
  --key sales/2024/data.csv \
  --expression "SELECT s.product, s.amount FROM s3object s WHERE s.amount > '1000'" \
  --expression-type SQL \
  --input-serialization '{"CSV": {"FileHeaderInfo": "USE", "FieldDelimiter": ","}}' \
  --output-serialization '{"CSV": {}}' \
  output.csv

# Query a JSON file
aws s3api select-object-content \
  --bucket my-bucket \
  --key logs/2024/events.json \
  --expression "SELECT s.eventName, s.userAgent FROM s3object s WHERE s.statusCode = 500" \
  --expression-type SQL \
  --input-serialization '{"JSON": {"Type": "LINES"}}' \
  --output-serialization '{"JSON": {}}' \
  output.json
```

```
S3 Select vs downloading the whole file:
  - 10 GB CSV, need 100 rows → S3 Select returns kilobytes, not 10 GB
  - Supported formats: CSV, JSON, Apache Parquet
  - Supports GZIP/BZIP2 compressed CSV and JSON
  - Max uncompressed row/record size: 1 MB
  - For complex queries, consider Amazon Athena (full SQL engine on S3)

S3 Select limitations:
  - No JOIN, GROUP BY, ORDER BY, or subqueries
  - Single object at a time (use Athena for multi-object queries)
  - Being phased out in favor of Athena for new use cases
```

---

## 12. Static Website Hosting

S3 can host static websites (HTML, CSS, JS, images) directly. Combined with CloudFront and Route 53, it provides a scalable, globally distributed website hosting solution.

```
How it works:
  1. Upload static files to an S3 bucket
  2. Enable static website hosting
  3. Set a bucket policy for public read access
  4. Access via the S3 website endpoint

S3 website endpoint formats:
  - http://<bucket>.s3-website-<region>.amazonaws.com    (dash style)
  - http://<bucket>.s3-website.<region>.amazonaws.com    (dot style)

Note: S3 website endpoint only supports HTTP, not HTTPS
      → Use CloudFront in front of S3 for HTTPS and caching
```

```bash
# Step 1: Create the bucket (name should match your domain for custom domains)
aws s3 mb s3://www.example.com

# Step 2: Disable Block Public Access (required for public website)
aws s3api put-public-access-block \
  --bucket www.example.com \
  --public-access-block-configuration \
    'BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false'

# Step 3: Apply public read bucket policy
aws s3api put-bucket-policy \
  --bucket www.example.com \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.example.com/*"
    }]
  }'

# Step 4: Enable static website hosting
aws s3 website s3://www.example.com/ \
  --index-document index.html \
  --error-document error.html

# Step 5: Upload website files
aws s3 sync ./build/ s3://www.example.com/ \
  --cache-control "max-age=86400" \
  --delete

# Upload with correct content types
aws s3 cp ./build/index.html s3://www.example.com/index.html \
  --content-type "text/html" \
  --cache-control "no-cache"    # don't cache index.html (SPA routing)

aws s3 sync ./build/static/ s3://www.example.com/static/ \
  --cache-control "max-age=31536000"    # cache static assets for 1 year
```

```
Production architecture for static website:

  Route 53 (DNS)
      |
      v
  CloudFront (CDN + HTTPS)
      |
      ├── Origin: S3 bucket (via Origin Access Control)
      ├── HTTPS certificate (ACM)
      ├── Custom domain (www.example.com)
      ├── Edge caching (200+ locations)
      └── Custom error responses (SPA: 404 → /index.html)

  Advantages over raw S3 hosting:
    - HTTPS support
    - Global edge caching (faster loads)
    - DDoS protection (AWS Shield)
    - Custom domain with SSL
    - No need for public bucket policy (use OAC)
```

```json
// CloudFront + S3 with Origin Access Control (OAC)
// Bucket policy: allow only CloudFront to access S3 (no public access needed)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::www.example.com/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/E1ABCDEF"
        }
      }
    }
  ]
}
```

---

## 13. S3 Access Points

S3 Access Points simplify managing access to shared data sets by creating named network endpoints with distinct permissions. Instead of one complex bucket policy, each access point has its own policy, network controls, and Block Public Access settings.

```
Why access points:
  - A single bucket policy can become huge and complex with many users/teams
  - Each access point has its OWN policy (easier to manage)
  - Each access point has its OWN Block Public Access settings
  - Access points can be restricted to a specific VPC (no internet access)
  - Each access point has a unique DNS name

Limits:
  - Up to 10,000 access points per account per region
  - Access points are associated with a single bucket
  - Each access point has a unique ARN
```

```bash
# Create an access point for the analytics team
aws s3control create-access-point \
  --account-id 123456789012 \
  --name analytics-ap \
  --bucket my-data-lake-bucket

# Create a VPC-restricted access point (only accessible from within the VPC)
aws s3control create-access-point \
  --account-id 123456789012 \
  --name internal-ap \
  --bucket my-data-lake-bucket \
  --vpc-configuration VpcId=vpc-1a2b3c4d

# Access objects through the access point
aws s3api get-object \
  --bucket arn:aws:s3:us-east-1:123456789012:accesspoint/analytics-ap \
  --key reports/q4-summary.csv \
  ./q4-summary.csv
```

```json
// Access point policy: analytics team can only read from analytics/ prefix
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AnalyticsTeamRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::123456789012:role/AnalyticsTeamRole"
      },
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:us-east-1:123456789012:accesspoint/analytics-ap",
        "arn:aws:s3:us-east-1:123456789012:accesspoint/analytics-ap/object/analytics/*"
      ]
    }
  ]
}
```

```json
// Bucket policy: delegate access control to access points
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DelegateToAccessPoints",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::my-data-lake-bucket",
        "arn:aws:s3:::my-data-lake-bucket/*"
      ],
      "Condition": {
        "StringEquals": {
          "s3:DataAccessPointAccount": "123456789012"    // only access points from this account
        }
      }
    }
  ]
}
```

---

## 14. S3 Object Lock and Compliance

S3 Object Lock prevents objects from being deleted or overwritten for a fixed period or indefinitely. It enforces a WORM (Write Once Read Many) model, which is essential for regulatory compliance.

```
Object Lock requires:
  - Versioning enabled on the bucket
  - Object Lock enabled at bucket creation (cannot be added later)

Two retention modes:
  1. Governance mode — users with special permissions (s3:BypassGovernanceRetention)
                       can override or delete the lock
  2. Compliance mode — NO ONE can delete or shorten the retention period,
                       not even the root account

Legal Hold:
  - Separate from retention — prevents deletion regardless of retention settings
  - Can be applied/removed by users with s3:PutObjectLegalHold permission
  - Has no expiration — remains until explicitly removed
```

```bash
# Create a bucket with Object Lock enabled (must be done at creation time)
aws s3api create-bucket \
  --bucket compliance-bucket \
  --object-lock-enabled-for-bucket

# Set default retention for the bucket (all new objects inherit this)
aws s3api put-object-lock-configuration \
  --bucket compliance-bucket \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": {
      "DefaultRetention": {
        "Mode": "COMPLIANCE",
        "Days": 2555
      }
    }
  }'
# 2555 days = ~7 years (common for financial regulatory requirements)

# Upload an object with a specific retention period
aws s3api put-object \
  --bucket compliance-bucket \
  --key financial-records/2024-q4.pdf \
  --body ./2024-q4.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "2031-12-31T00:00:00Z"

# Apply a Legal Hold to an object
aws s3api put-object-legal-hold \
  --bucket compliance-bucket \
  --key evidence/document.pdf \
  --legal-hold '{"Status": "ON"}'

# Check retention settings on an object
aws s3api get-object-retention \
  --bucket compliance-bucket \
  --key financial-records/2024-q4.pdf

# Check legal hold status
aws s3api get-object-legal-hold \
  --bucket compliance-bucket \
  --key evidence/document.pdf

# Remove legal hold (requires s3:PutObjectLegalHold permission)
aws s3api put-object-legal-hold \
  --bucket compliance-bucket \
  --key evidence/document.pdf \
  --legal-hold '{"Status": "OFF"}'
```

```
Real-world compliance scenarios:

Financial Services (SEC Rule 17a-4):
  - Mode: COMPLIANCE
  - Retention: 7 years
  - Cannot be overridden — even by root account
  - Auditable via CloudTrail

Healthcare (HIPAA):
  - Mode: GOVERNANCE (allows authorized deletion with approval)
  - Retention: 6 years after last access
  - Legal Hold for active investigations

Legal/eDiscovery:
  - Legal Hold: ON (during litigation — no expiration)
  - Remove only when litigation concludes
  - Combine with Compliance mode for baseline retention

Governance mode use case:
  - Testing retention policies before enforcing Compliance
  - Data that SHOULD be retained but MAY need deletion by admins
  - Add s3:BypassGovernanceRetention to break-glass IAM policies
```

---

## 15. Interview Questions & Answers

### Beginner

---

**Q1: What is Amazon S3 and what are its key features?**

Amazon S3 (Simple Storage Service) is an object storage service that provides:

1. **Virtually unlimited storage** — no limit on the number of objects or total storage
2. **11 9s durability** (99.999999999%) — designed to sustain loss of 2 facilities
3. **High availability** — 99.99% for S3 Standard
4. **Multiple storage classes** — optimize cost based on access patterns
5. **Built-in security** — encryption, bucket policies, ACLs, VPC endpoints
6. **Event-driven** — triggers Lambda, SQS, SNS on object operations
7. **Versioning** — keep multiple versions of objects for protection

S3 stores data as objects (up to 5 TB each) in buckets (globally unique containers). It is region-scoped, accessed via REST API, and supports strong read-after-write consistency.

---

**Q2: What is the difference between S3 and EBS and EFS?**

| Feature | S3 (Object) | EBS (Block) | EFS (File) |
|---------|-------------|-------------|------------|
| Type | Object storage | Block storage | File storage (NFS) |
| Access | REST API / HTTP | Mounted to one EC2 instance | Mounted to multiple EC2 instances |
| Max size | 5 TB per object, unlimited total | 64 TB per volume | Unlimited |
| Performance | High throughput | Low latency, high IOPS | Moderate latency |
| Durability | 11 9s (across 3+ AZs) | Replicated within single AZ | Across 3+ AZs |
| Use case | Static files, backups, data lakes | Databases, boot volumes | Shared file system, CMS |
| Pricing | Pay per GB stored + requests | Pay per GB provisioned | Pay per GB used |

Use S3 for objects accessed via API. Use EBS for a single EC2's disk. Use EFS for shared filesystem across multiple instances.

---

**Q3: What are S3 storage classes and when would you use each?**

S3 offers six main storage classes optimized for different access patterns:

1. **S3 Standard** — frequently accessed data (websites, active content) — $0.023/GB
2. **S3 Intelligent-Tiering** — unknown or changing patterns (auto-moves between tiers) — monitoring fee
3. **S3 Standard-IA** — infrequent but needs fast access (backups) — $0.0125/GB + retrieval fee
4. **S3 One Zone-IA** — infrequent, re-creatable data (thumbnails) — $0.01/GB, single AZ
5. **S3 Glacier (3 tiers)** — archival (minutes to hours retrieval) — $0.004-$0.00099/GB
6. **S3 Glacier Deep Archive** — regulatory archives (12-48 hour retrieval) — $0.00099/GB

Use lifecycle rules to automatically transition objects between classes as they age.

---

**Q4: How does S3 versioning work and why would you enable it?**

Versioning keeps multiple variants of an object. When enabled, every PUT creates a new version with a unique version ID. Deleting a versioned object places a "delete marker" instead of actually removing it, making recovery possible.

Key points:
- Once enabled, versioning can only be suspended (not disabled)
- Each version is a full copy, so storage costs increase
- To permanently delete, you must specify the version ID
- MFA Delete adds extra protection for permanent deletions
- Use lifecycle rules to expire old versions and control costs

Enable versioning for data protection, audit trails, and compliance. It is also required for S3 Replication.

---

**Q5: What is a pre-signed URL and when would you use it?**

A pre-signed URL grants temporary, time-limited access to a private S3 object. It includes the operation (GET/PUT), expiration time, and a cryptographic signature derived from the creator's AWS credentials.

Use cases:
1. **Download private files** — generate a GET pre-signed URL for authenticated users
2. **Direct browser uploads** — generate a PUT pre-signed URL so clients upload directly to S3 (bypassing your server)
3. **Temporary sharing** — share a file link that expires after a set time

Maximum expiration is 7 days (with IAM user credentials). The URL inherits the permissions of the creator — if their permissions are revoked, the URL stops working.

---

### Intermediate

---

**Q6: Explain S3 encryption options and when to use each.**

S3 offers four encryption approaches:

| Method | Key Management | Audit Trail | Use Case |
|--------|---------------|-------------|----------|
| **SSE-S3** | AWS manages everything | No per-object logging | Default, general purpose |
| **SSE-KMS** | AWS KMS manages keys | CloudTrail logs every use | Compliance, audit requirements |
| **SSE-C** | Customer provides key per request | None (you track) | Full key control, BYOK |
| **Client-side** | Customer encrypts before upload | None (you track) | Zero-trust, end-to-end encryption |

SSE-S3 is the default since January 2023. Use SSE-KMS when you need audit trails, key rotation control, or cross-account key sharing. Use SSE-C when regulation requires you to manage keys. Use client-side when S3 must never see unencrypted data.

For SSE-KMS at high throughput, enable **S3 Bucket Keys** to reduce KMS API calls by up to 99%.

---

**Q7: How would you set up S3 Cross-Region Replication (CRR)?**

Steps to set up CRR:

1. **Enable versioning** on both source and destination buckets
2. **Create an IAM role** with permissions to read from source and write to destination
3. **Configure replication rules** specifying which objects to replicate, the destination bucket, and the storage class
4. **Optional**: Enable Replication Time Control (RTC) for 99.99% SLA on 15-minute replication
5. **For existing objects**: Use S3 Batch Replication (replication only applies to new objects by default)

Important considerations:
- Delete markers are not replicated by default (can be enabled)
- Permanent deletes (specific version ID) are never replicated (to prevent cascading deletes)
- If both buckets have replication rules pointing to each other, you get bidirectional replication
- Cross-account CRR requires a bucket policy on the destination allowing the source account's replication role

---

**Q8: How do you secure an S3 bucket that stores sensitive data?**

A defense-in-depth approach for securing an S3 bucket:

1. **Block Public Access** — enable all four settings at the account and bucket level
2. **Bucket Policy** — restrict access by IP, VPC endpoint, or specific IAM principals; deny HTTP (enforce HTTPS)
3. **Encryption** — SSE-KMS with a customer-managed key for audit trail; enforce encryption via bucket policy
4. **Versioning + MFA Delete** — protect against accidental or malicious deletion
5. **Object Lock (Compliance)** — WORM protection for regulatory data
6. **Access logging** — enable S3 Server Access Logging or CloudTrail data events
7. **VPC Endpoint** — use a Gateway VPC endpoint so traffic never leaves the AWS network
8. **IAM least-privilege** — grant only the specific S3 actions needed (avoid `s3:*`)
9. **Disable ACLs** — use BucketOwnerEnforced to prevent ACL-based access grants
10. **Monitoring** — use Amazon Macie for PII detection, GuardDuty for threat detection

---

**Q9: Explain S3 lifecycle rules and design a cost-optimized strategy for a media company.**

Lifecycle rules automatically transition objects between storage classes and expire them based on age. You can filter by prefix, tags, or object size.

Media company strategy:

```
Content: Video files (avg 2 GB), images (avg 5 MB), thumbnails (avg 50 KB)

Video files (prefix: videos/):
  Day 0-30:    S3 Standard          (editors actively working)
  Day 30-90:   S3 Standard-IA       (occasional re-edits)
  Day 90-365:  Glacier Instant       (rare access, needs fast retrieval for re-publishing)
  Day 365+:    Glacier Deep Archive  (regulatory retention, 7-year hold)

Images (prefix: images/):
  Day 0-60:    S3 Standard           (actively served)
  Day 60+:     S3 Intelligent-Tiering (unpredictable access after initial period)

Thumbnails (prefix: thumbs/):
  Always:      S3 Standard           (tiny files, always accessed, IA minimum charge > storage cost)

Temp renders (prefix: tmp/):
  Day 7:       Delete                (no need to keep)

Incomplete multipart uploads:
  Day 1:       Abort                 (prevent storage waste)
```

This strategy can reduce storage costs by 60-80% compared to keeping everything in S3 Standard.

---

**Q10: What are S3 Access Points and how do they simplify access management?**

S3 Access Points are named network endpoints attached to a bucket, each with its own access policy and network controls. They solve the problem of managing one massive, complex bucket policy for a bucket shared by many teams.

Without access points: one bucket policy with dozens of statements for different teams and prefixes. Hard to read, easy to misconfigure, risky to update.

With access points:
- **analytics-ap** — analytics team reads only `analytics/*` prefix, VPC-restricted
- **ml-training-ap** — ML team reads `datasets/*`, restricted to specific IAM role
- **external-partner-ap** — external account reads `shared/*`, restricted by IP

Each access point:
- Has its own IAM-like policy (independently managed)
- Can be restricted to a specific VPC (no internet access)
- Has its own Block Public Access settings
- Has a unique DNS name and ARN
- Limit: 10,000 per account per region

The bucket policy is simplified to a single "delegate to access points" statement.

---

### Advanced

---

**Q11: How does S3 achieve 11 9s of durability and what are the failure scenarios?**

S3 achieves 99.999999999% durability by:

1. **Redundant storage** — objects are automatically stored across a minimum of 3 Availability Zones (except One Zone-IA)
2. **Checksums** — data integrity verified on upload and periodically using CRC checks
3. **Self-healing** — if a copy is detected as corrupt, S3 automatically restores it from a healthy copy
4. **Erasure coding** — data is split into fragments with redundancy, so it can be reconstructed even if multiple fragments are lost

11 9s means: if you store 10 million objects, you can statistically expect to lose one object every 10,000 years.

Failure scenarios that can still cause data loss:
- **User error** — accidental deletion (mitigate with versioning + MFA Delete)
- **Application bug** — overwriting with corrupt data (mitigate with versioning)
- **Account compromise** — malicious deletion (mitigate with Object Lock + MFA Delete)
- **Single AZ** — One Zone-IA objects are lost if the AZ is destroyed
- **Region destruction** — theoretically possible, mitigate with CRR to another region

S3 durability is NOT the same as availability. Durability = data not lost. Availability = data accessible when requested. Standard is 99.99% available (up to 53 minutes downtime per year).

---

**Q12: Design a high-performance S3 architecture for a data lake processing 10 TB/day.**

```
Architecture for 10 TB/day data lake:

Ingestion (10 TB/day = ~115 MB/sec sustained):
  ├── Use multipart upload with 100 MB parts for large files
  ├── Use S3 Transfer Acceleration if sources are globally distributed
  ├── Distribute writes across multiple prefixes:
  │     s3://data-lake/raw/year=2024/month=12/day=15/hour=08/source=api/
  │     (partitioned by time → different prefixes → parallel S3 partitions)
  └── Use S3 Batch Operations for bulk imports

Storage layout:
  ├── raw/       → S3 Standard (incoming data, Parquet/ORC format)
  ├── processed/ → S3 Standard (transformed, query-ready)
  ├── curated/   → S3 Intelligent-Tiering (final datasets, varying access)
  └── archive/   → Glacier (historical, rarely queried)

Query optimization:
  ├── Use columnar formats (Parquet/ORC) — S3 Select and Athena skip unneeded columns
  ├── Partition by date/source in the key structure
  ├── Use Athena/Glue for SQL queries across multiple objects
  ├── Enable S3 Inventory for tracking millions of objects
  └── Byte-range fetches for targeted column reads in Parquet

Performance tuning:
  ├── 3,500 PUT + 5,500 GET per second per prefix
  ├── Use random/hashed prefixes if hitting throughput limits on a single prefix
  ├── Enable S3 Request Metrics (CloudWatch) to monitor throttling
  ├── Use VPC Gateway Endpoint to avoid NAT Gateway costs and bottlenecks
  └── Parallelize multipart uploads: 100 concurrent parts × 100 MB = 10 GB/sec throughput

Cost optimization:
  ├── Lifecycle: raw/ → Standard-IA after 30 days → Glacier after 90 days
  ├── Lifecycle: abort incomplete multipart uploads after 1 day
  ├── Use S3 Storage Lens for cross-account cost visibility
  ├── Compress data (Snappy/ZSTD) before storage — reduces storage and transfer costs
  └── Use S3 Intelligent-Tiering for datasets with unpredictable query patterns
```

---

**Q13: Explain S3 consistency model and its implications for distributed systems.**

Since December 2020, S3 provides **strong read-after-write consistency** for all operations:

- **PUT (new object)** → immediately readable with latest data
- **PUT (overwrite)** → immediately returns the new version
- **DELETE** → immediately reflects the deletion
- **LIST** → immediately reflects the changes

This means:
- No stale reads after writes
- No need for workarounds like "wait and retry" or "use DynamoDB as consistency layer"
- List operations are also strongly consistent (if you PUT then LIST, the new object appears)

Implications for distributed systems:
1. **Simplifies architecture** — no need for eventual consistency workarounds
2. **Safe for configuration files** — write config, immediately read it from another service
3. **Atomic at the object level** — no partial reads (you get the old version or the new one, never a mix)
4. **NOT atomic across objects** — if you update two related objects, a reader might see one old and one new
5. **No locking** — concurrent writes to the same key = last writer wins (use DynamoDB for locking if needed)
6. **Metadata consistency** — tags and ACL updates are also strongly consistent

For multi-object transactions, use DynamoDB transactions or implement a manifest pattern (write data objects first, then atomically update a manifest/pointer object).

---

**Q14: How would you implement a secure, compliant document management system using S3?**

Architecture for a compliant document management system (e.g., financial services, HIPAA):

```
Security layers:
  1. Network:    VPC Gateway Endpoint (no internet exposure)
  2. Access:     S3 Access Points per team + IAM roles (least privilege)
  3. Encryption: SSE-KMS with CMK (audit via CloudTrail)
  4. Integrity:  S3 Object Lock (Compliance mode, 7-year retention)
  5. Versioning: Enabled + MFA Delete (root account only)
  6. Monitoring: CloudTrail data events + Macie PII scanning + GuardDuty

Bucket policy enforcements:
  - Deny HTTP (require HTTPS)
  - Deny uploads without SSE-KMS encryption
  - Deny uploads without Object Lock retention
  - Restrict to VPC endpoint only (deny all non-VPC traffic)
  - Require MFA for delete operations

Compliance features:
  - Object Lock (Compliance mode): immutable records for 7 years
  - Legal Hold: freeze specific documents during litigation
  - S3 Inventory: weekly inventory for audit (proves data exists)
  - CloudTrail: logs every API call (who accessed what, when)
  - Cross-Region Replication: DR copy in a second region
  - S3 Storage Lens: organizational view of storage and access patterns

Access pattern:
  - Upload: application role → Access Point → SSE-KMS → Object Lock applied
  - Read: user authenticates → assumes role → Access Point → CloudTrail logged
  - Delete: impossible during retention (Compliance mode)
  - Audit: CloudTrail → Athena queries for access reports
  - DR: automatic CRR to secondary region with same Object Lock rules
```

```json
// Bucket policy enforcing all security requirements
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyNonHTTPS",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::compliance-docs/*",
      "Condition": { "Bool": { "aws:SecureTransport": "false" } }
    },
    {
      "Sid": "DenyNonKMSEncryption",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::compliance-docs/*",
      "Condition": {
        "StringNotEquals": { "s3:x-amz-server-side-encryption": "aws:kms" }
      }
    },
    {
      "Sid": "DenyNonVPCAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": ["arn:aws:s3:::compliance-docs", "arn:aws:s3:::compliance-docs/*"],
      "Condition": {
        "StringNotEquals": { "aws:SourceVpce": "vpce-1a2b3c4d" }
      }
    }
  ]
}
```

---

**Q15: Compare S3 event notifications, EventBridge, and S3 Object Lambda. When would you use each?**

| Feature | S3 Event Notifications | EventBridge | S3 Object Lambda |
|---------|----------------------|-------------|-----------------|
| Targets | Lambda, SQS, SNS | 18+ AWS services | Transforms data on GET |
| Filtering | Prefix + suffix only | Rich content-based rules | Per-access-point |
| Fan-out | One destination per rule | Multiple rules per event | N/A |
| Retry | Built-in | Built-in + DLQ | N/A |
| Archive/Replay | No | Yes | No |
| Latency | Seconds | Seconds | On-demand (per request) |

**S3 Event Notifications**: Use for simple triggers — "when a file lands in `uploads/`, invoke this Lambda." Easy to set up, sufficient for most use cases. Limited to Lambda, SQS, or SNS as targets.

**EventBridge**: Use for complex event routing — "when a `.csv` file > 1 MB lands in `data/`, trigger a Step Function, log to CloudWatch, and notify Slack." Also use when you need event archive/replay for debugging, or cross-account event delivery.

**S3 Object Lambda**: Use when you need to transform data on read without modifying the stored object. For example:
- Redact PII from documents before returning to unauthorized users
- Resize images on-the-fly based on the requesting device
- Decompress or convert data formats during download
- Add watermarks to images per user

S3 Object Lambda sits between the client and S3 — the GET request goes through your Lambda, which fetches the original object, transforms it, and returns the modified version. The stored object remains unchanged.

---

**Q16: How does S3 handle throttling and what strategies prevent 503 Slow Down errors?**

S3 automatically scales to handle high request rates, but aggressive ramp-ups or hotspot prefixes can trigger 503 Slow Down errors. S3 supports 3,500 writes and 5,500 reads per second per prefix.

Prevention strategies:

1. **Distribute across prefixes** — instead of writing everything under one prefix, use hashed or partitioned prefixes:
   ```
   Bad:  s3://bucket/data/file-001 to file-999999 (1 prefix)
   Good: s3://bucket/a3f2/file-001, s3://bucket/b7c1/file-002 (many prefixes)
   ```

2. **Gradual ramp-up** — if you suddenly need 50,000 requests/sec, S3 may throttle while it scales. Ramp up gradually over 15-20 minutes.

3. **Retry with exponential backoff** — AWS SDKs handle this automatically, but verify your retry configuration:
   ```
   Attempt 1: immediate
   Attempt 2: wait 1s
   Attempt 3: wait 2s
   Attempt 4: wait 4s (with jitter)
   ```

4. **CloudFront caching** — for read-heavy workloads, put CloudFront in front to absorb GET traffic

5. **S3 request metrics** — enable CloudWatch metrics to detect throttling before users are impacted:
   ```
   Metrics: AllRequests, 4xxErrors, 5xxErrors, FirstByteLatency
   Alarm: 5xxErrors > 100 in 5 minutes
   ```

6. **Horizontal partitioning** — for extreme scale, split across multiple buckets

7. **SSE-KMS throttling** — if using SSE-KMS, KMS API rate limits (5,500-30,000/sec) may be the bottleneck. Enable S3 Bucket Keys to reduce KMS calls by 99%.

---

**Q17: What is S3 Object Lambda and how does it differ from a Lambda triggered by S3 events?**

They serve fundamentally different purposes:

**S3 Event Notification + Lambda**: Triggered **after** an object is created/deleted. The Lambda processes the event asynchronously (e.g., generate thumbnail after upload). The original object is unchanged; the Lambda may create new objects.

**S3 Object Lambda**: Intercepts **GET requests** in real-time and transforms the object **before** returning it to the requester. The stored object is never modified.

```
S3 Event + Lambda flow:
  PUT photo.jpg → S3 stores it → Event fires → Lambda creates thumbnail.jpg

S3 Object Lambda flow:
  GET photo.jpg → S3 Object Lambda Access Point → Lambda fetches original from S3
  → Lambda resizes to requester's device size → Returns resized image
  (Original photo.jpg is unchanged in S3)
```

S3 Object Lambda use cases:
- PII redaction per user role (full SSN for admin, masked for support)
- Dynamic image resizing per device (mobile vs desktop)
- Converting data formats on read (XML to JSON)
- Adding custom headers or watermarks
- Filtering rows from a CSV based on the requester's permissions

Configuration requires an S3 Object Lambda Access Point, which references a supporting Access Point and a Lambda function ARN. Clients use the Object Lambda Access Point ARN instead of the bucket name.

---

## References

- [AWS S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide) — Official S3 documentation
- [S3 API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API) — Complete S3 API reference
- [S3 Pricing](https://aws.amazon.com/s3/pricing) — Storage class pricing details
