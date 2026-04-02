# Deploying a Frontend (React SPA) on AWS — Complete Guide

## Table of Contents

- [1. Overview](#1-overview)
- [2. Architecture Options](#2-architecture-options)
- [3. S3 + CloudFront (Recommended)](#3-s3--cloudfront-recommended)
- [4. Step-by-Step Deployment](#4-step-by-step-deployment)
- [5. Custom Domain with Route 53](#5-custom-domain-with-route-53)
- [6. SSL/TLS with ACM](#6-ssltls-with-acm)
- [7. CI/CD Pipeline](#7-cicd-pipeline)
- [8. Environment Variables and Config](#8-environment-variables-and-config)
- [9. Caching Strategy](#9-caching-strategy)
- [10. Security](#10-security)
- [11. Performance Optimization](#11-performance-optimization)
- [12. Monitoring](#12-monitoring)
- [13. Multi-Environment Setup](#13-multi-environment-setup)
- [14. AWS Amplify (Alternative)](#14-aws-amplify-alternative)
- [15. Cost Breakdown](#15-cost-breakdown)
- [16. Interview Questions & Answers](#16-interview-questions--answers)

---

## 1. Overview

A React SPA (like this project) builds to static files (HTML, CSS, JS, images). These files need to be:
1. **Stored** somewhere (S3)
2. **Served** to users globally (CloudFront CDN)
3. **Routed** correctly (SPA fallback to `index.html`)
4. **Secured** with HTTPS (ACM certificate)
5. **Deployed** automatically (CI/CD pipeline)

### AWS Services Used

```
S3           → Static file storage (origin)
CloudFront   → CDN (global edge caching, HTTPS)
Route 53     → DNS (custom domain)
ACM          → SSL/TLS certificate (free)
CodePipeline → CI/CD (optional)
CloudWatch   → Monitoring and alerts
WAF          → Web Application Firewall (optional)
```

---

## 2. Architecture Options

### Option 1: S3 + CloudFront (Recommended)

```
User → CloudFront (CDN, 400+ edge locations)
         → S3 (origin, stores static files)
         → ACM (HTTPS)
         → Route 53 (DNS)
```

- Best for: production SPAs, global users
- Cost: ~$1-5/month for moderate traffic
- Pros: Fast, global, cheap, fully managed, HTTPS
- Cons: Manual setup (or IaC)

### Option 2: AWS Amplify

```
User → Amplify Hosting (CDN + CI/CD built-in)
         → GitHub/GitLab (auto-deploy on push)
```

- Best for: quick setup, small projects, prototypes
- Cost: Free tier, then ~$0.15/GB served
- Pros: Zero config CI/CD, branch previews, PR previews
- Cons: Less control, slightly higher cost at scale

### Option 3: S3 Static Website Hosting (No CloudFront)

```
User → S3 Website Endpoint (HTTP only)
```

- Best for: internal tools, development
- Cost: Cheapest
- Cons: No HTTPS, no CDN, no custom domain easily, single region

### Comparison

| Feature | S3 + CloudFront | Amplify | S3 Only |
|---------|----------------|---------|---------|
| CDN | Yes (global) | Yes | No |
| HTTPS | Yes (ACM) | Yes (auto) | No |
| Custom domain | Yes (Route 53) | Yes (built-in) | Limited |
| CI/CD | Manual (CodePipeline) | Built-in | Manual |
| Cost | Lowest at scale | Moderate | Lowest |
| Control | Full | Limited | Full |
| SPA routing | CloudFront config | Automatic | S3 redirect rules |
| Setup effort | Medium | Low | Low |

---

## 3. S3 + CloudFront (Recommended)

### 3.1 How It Works

```
1. Build your React app → generates static files in dist/
2. Upload files to S3 bucket
3. CloudFront serves files from edge locations globally
4. CloudFront handles:
   - HTTPS termination
   - Caching (files cached at edge locations)
   - SPA routing (404 → index.html)
   - Gzip/Brotli compression
5. Route 53 points your domain to CloudFront
```

### 3.2 S3 Bucket Configuration

```
Bucket: my-app-frontend
  - Block ALL public access (CloudFront uses OAC, not public URLs)
  - No static website hosting needed (CloudFront handles routing)
  - Versioning: optional (useful for rollback)
  - Encryption: SSE-S3 (default)
```

### 3.3 CloudFront Configuration

```
Origin:
  - S3 bucket (not the website endpoint)
  - Origin Access Control (OAC) — CloudFront-only access to S3

Default behavior:
  - Viewer protocol: Redirect HTTP to HTTPS
  - Allowed methods: GET, HEAD
  - Cache policy: CachingOptimized (for static assets)
  - Compress: Yes (gzip + brotli)

Error pages (SPA routing):
  - 403 → /index.html (200)
  - 404 → /index.html (200)

Price class:
  - All edge locations (global)
  - Or: US/Europe only (cheaper)

Alternate domain: app.example.com
SSL certificate: ACM certificate (us-east-1 only for CloudFront)
```

---

## 4. Step-by-Step Deployment

### Step 1: Build Your App

```bash
npm run build
# Output: dist/ directory with index.html, assets/, etc.
```

### Step 2: Create S3 Bucket

```bash
# Create bucket
aws s3 mb s3://my-app-frontend --region us-east-1

# Block public access (CloudFront will access via OAC)
aws s3api put-public-access-block \
  --bucket my-app-frontend \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### Step 3: Upload Build Files

```bash
# Upload all files
aws s3 sync dist/ s3://my-app-frontend --delete

# With cache headers (optimal)
# HTML files: no cache (always check for new version)
aws s3 sync dist/ s3://my-app-frontend \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --delete

# Hashed assets (JS, CSS): long cache (content-hash in filename)
aws s3 sync dist/ s3://my-app-frontend \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete
```

### Step 4: Create CloudFront Distribution

```bash
# Using AWS CLI (simplified — prefer CloudFormation/CDK for production)
aws cloudfront create-distribution \
  --origin-domain-name my-app-frontend.s3.us-east-1.amazonaws.com \
  --default-root-object index.html
```

Better: use CloudFormation/CDK (see Step 7).

### Step 5: Configure Origin Access Control (OAC)

```json
// S3 bucket policy (allow CloudFront to read)
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFront",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-frontend/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789:distribution/E1234567890"
        }
      }
    }
  ]
}
```

### Step 6: Configure SPA Routing

In CloudFront > Error Pages:

```
HTTP Error Code: 403  → Response Page: /index.html → Response Code: 200
HTTP Error Code: 404  → Response Page: /index.html → Response Code: 200
```

This ensures that deep links (e.g., `/dashboard`, `/jobs/123`) serve `index.html`, and React Router handles the routing client-side.

### Step 7: Infrastructure as Code (CDK)

```ts
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53targets from 'aws-cdk-lib/aws-route53-targets';

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket (private, no website hosting)
    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: 'my-app-frontend',
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ACM certificate (must be in us-east-1 for CloudFront)
    const certificate = acm.Certificate.fromCertificateArn(
      this, 'Certificate',
      'arn:aws:acm:us-east-1:123456789:certificate/abc-123'
    );

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      domainNames: ['app.example.com'],
      certificate,
      errorResponses: [
        {
          httpStatus: 403,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responsePagePath: '/index.html',
          responseHttpStatus: 200,
          ttl: cdk.Duration.seconds(0),
        },
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US/Europe
    });

    // Deploy build files to S3 + invalidate CloudFront
    new s3deploy.BucketDeployment(this, 'DeployFiles', {
      sources: [s3deploy.Source.asset('../dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],            // invalidate all paths
    });

    // Route 53 A record
    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName: 'example.com',
    });

    new route53.ARecord(this, 'ARecord', {
      zone: hostedZone,
      recordName: 'app',
      target: route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution)
      ),
    });

    // Outputs
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${distribution.distributionDomainName}`,
    });
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName,
    });
  }
}
```

```bash
cdk deploy
```

---

## 5. Custom Domain with Route 53

### 5.1 Register or Transfer Domain

```bash
# Register via AWS Console or CLI
aws route53domains register-domain \
  --domain-name example.com \
  --duration-in-years 1 \
  --admin-contact file://contact.json
```

### 5.2 Create Hosted Zone

```bash
# Hosted zone is created automatically when registering via Route 53
# For external domains, create manually:
aws route53 create-hosted-zone --name example.com --caller-reference $(date +%s)
# Then point your registrar's nameservers to the NS records
```

### 5.3 Create DNS Records

```bash
# A record (IPv4) → CloudFront
# AAAA record (IPv6) → CloudFront
# Both as ALIAS records pointing to the CloudFront distribution

# Via Console: Create Record → Alias → CloudFront distribution
# Via CLI:
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890 \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "app.example.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "d1234567890.cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

---

## 6. SSL/TLS with ACM

### 6.1 Request Certificate

```bash
# MUST be in us-east-1 for CloudFront
aws acm request-certificate \
  --domain-name "app.example.com" \
  --subject-alternative-names "*.example.com" \
  --validation-method DNS \
  --region us-east-1
```

### 6.2 Validate Certificate

```
1. ACM gives you a CNAME record to add to Route 53
2. Add the CNAME record (ACM can auto-create it if using Route 53)
3. Wait for validation (usually 5-30 minutes)
4. Certificate is automatically renewed by ACM
```

### 6.3 Attach to CloudFront

```
CloudFront distribution settings:
  → Alternate domain name (CNAME): app.example.com
  → Custom SSL certificate: select the ACM certificate
  → Security policy: TLSv1.2_2021 (recommended)
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions (Recommended)

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          # Upload HTML files (no cache)
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} \
            --exclude "*" \
            --include "*.html" \
            --cache-control "no-cache, no-store, must-revalidate" \
            --delete

          # Upload hashed assets (long cache)
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} \
            --exclude "*.html" \
            --cache-control "public, max-age=31536000, immutable" \
            --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### 7.2 AWS CodePipeline

```
Source (GitHub/CodeCommit)
  → Build (CodeBuild — npm ci && npm run build)
  → Deploy (S3 deploy + CloudFront invalidation)
```

```yaml
# buildspec.yml (CodeBuild)
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 20
    commands:
      - npm ci

  build:
    commands:
      - npm run build

  post_build:
    commands:
      - aws s3 sync dist/ s3://${S3_BUCKET} --delete
      - |
        aws s3 cp dist/index.html s3://${S3_BUCKET}/index.html \
          --cache-control "no-cache, no-store, must-revalidate"
      - |
        aws cloudfront create-invalidation \
          --distribution-id ${CLOUDFRONT_ID} \
          --paths "/*"

artifacts:
  files:
    - '**/*'
  base-directory: dist
```

### 7.3 Multi-Environment Deployment

```yaml
# GitHub Actions with environment-specific variables
name: Deploy

on:
  push:
    branches:
      - develop      # → dev environment
      - qa           # → QA environment
      - main         # → production

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name == 'main' && 'production' || github.ref_name == 'qa' && 'qa' || 'development' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci

      - name: Build with environment config
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ vars.API_BASE_URL }}
          VITE_CDN_BASE_URL: ${{ vars.CDN_BASE_URL }}

      - name: Deploy
        run: |
          aws s3 sync dist/ s3://${{ vars.S3_BUCKET }} --delete
          aws cloudfront create-invalidation \
            --distribution-id ${{ vars.CLOUDFRONT_ID }} \
            --paths "/*"
```

---

## 8. Environment Variables and Config

### 8.1 Build-Time Variables (Vite)

```bash
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_CDN_BASE_URL=https://cdn.example.com/data
VITE_GOOGLE_MAPS_API_KEY=AIza...

# Vite replaces these at BUILD time (embedded in JS bundle)
# They are NOT secret — anyone can see them in the browser
```

### 8.2 Per-Environment Builds

```bash
# Option 1: .env files per environment
.env.development        # VITE_API_BASE_URL=http://localhost:4000
.env.staging            # VITE_API_BASE_URL=https://staging-api.example.com
.env.production         # VITE_API_BASE_URL=https://api.example.com

# Build with specific mode
VITE_MODE=staging npm run build

# Option 2: CI/CD environment variables (preferred)
# Set VITE_API_BASE_URL in GitHub Secrets per environment
# Build reads from process.env during build
```

### 8.3 Runtime Config (No Rebuild)

```html
<!-- public/config.js (loaded before app) -->
<script>
  window.__APP_CONFIG__ = {
    API_BASE_URL: 'https://api.example.com',
    FEATURE_FLAGS: { newDashboard: true },
  };
</script>
```

```ts
// In app code
const config = window.__APP_CONFIG__;
```

This lets you change config without rebuilding — just update `config.js` in S3.

---

## 9. Caching Strategy

### 9.1 Two-Tier Caching

```
index.html             → no-cache (always fetch latest)
  ↓ loads
assets/index-abc123.js → cache forever (hash in filename, immutable)
assets/style-def456.css → cache forever
images/logo.png        → cache 1 day to 1 year (depends on change frequency)
```

### 9.2 S3 Cache Headers

```bash
# HTML files: never cache
aws s3 cp dist/index.html s3://bucket/index.html \
  --cache-control "no-cache, no-store, must-revalidate"

# Hashed JS/CSS (Vite adds content hash): cache forever
aws s3 sync dist/assets/ s3://bucket/assets/ \
  --cache-control "public, max-age=31536000, immutable"

# Images/fonts: cache for 1 year
aws s3 sync dist/images/ s3://bucket/images/ \
  --cache-control "public, max-age=31536000"
```

### 9.3 CloudFront Cache Policy

```
Default behavior:
  Cache Policy: CachingOptimized
    - TTL: 24 hours (but S3 Cache-Control headers override)
    - Compress: Yes (gzip + brotli)
    - Query strings: None (SPA doesn't use them for routing)

For API proxying (if applicable):
  Cache Policy: CachingDisabled
  Origin Request Policy: AllViewer (forward all headers)
```

### 9.4 CloudFront Invalidation

```bash
# After each deployment, invalidate index.html
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/index.html" "/config.js"

# Or invalidate everything (costs $0.005 per path after first 1000/month)
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/*"
```

Invalidation ensures users get the latest `index.html` immediately, which then loads the latest hashed assets.

---

## 10. Security

### 10.1 S3 Security

```
1. Block ALL public access on the bucket
2. Use Origin Access Control (OAC) — only CloudFront can read
3. Enable server-side encryption (SSE-S3 or SSE-KMS)
4. Enable access logging for audit
5. Use bucket policies with least privilege
```

### 10.2 CloudFront Security

```
1. Redirect HTTP to HTTPS (always)
2. Use TLSv1.2+ (security policy: TLSv1.2_2021)
3. Enable WAF for protection:
   - Rate limiting
   - SQL injection / XSS protection
   - Geo-blocking
   - Bot protection
4. Use security headers (via CloudFront Response Headers Policy):
   - Strict-Transport-Security: max-age=63072000
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Content-Security-Policy: default-src 'self'; ...
   - Referrer-Policy: strict-origin-when-cross-origin
```

### 10.3 CloudFront Response Headers Policy

```ts
// CDK
const headersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'SecurityHeaders', {
  securityHeadersBehavior: {
    strictTransportSecurity: {
      override: true,
      accessControlMaxAge: cdk.Duration.days(730),
      includeSubdomains: true,
      preload: true,
    },
    contentTypeOptions: { override: true },
    frameOptions: {
      override: true,
      frameOption: cloudfront.HeadersFrameOption.DENY,
    },
    xssProtection: {
      override: true,
      protection: true,
      modeBlock: true,
    },
    referrerPolicy: {
      override: true,
      referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
    },
  },
});
```

---

## 11. Performance Optimization

### 11.1 Build Optimization

```bash
# Vite already does:
# - Tree shaking (remove unused code)
# - Code splitting (lazy routes → separate chunks)
# - Minification (Terser/esbuild)
# - CSS minification
# - Asset hashing (cache busting)

# Check bundle size
npx vite-bundle-visualizer
```

### 11.2 CloudFront Optimization

```
1. Enable compression (gzip + brotli) — automatic with CachingOptimized
2. Use HTTP/2 and HTTP/3 (enabled by default)
3. Set appropriate cache TTLs
4. Use Price Class 100 if users are only in US/Europe (cheaper, lower latency)
5. Enable Origin Shield (additional caching layer, reduces origin requests)
```

### 11.3 S3 Transfer Acceleration

```bash
# For uploads (not needed for serving via CloudFront)
aws s3api put-bucket-accelerate-configuration \
  --bucket my-app-frontend \
  --accelerate-configuration Status=Enabled

# Upload via accelerated endpoint
aws s3 sync dist/ s3://my-app-frontend --endpoint-url https://s3-accelerate.amazonaws.com
```

---

## 12. Monitoring

### 12.1 CloudFront Metrics

```
Built-in (free):
  - Requests
  - Bytes downloaded
  - Error rate (4xx, 5xx)
  - Cache hit ratio

Additional ($):
  - Real-time logs (Kinesis)
  - Standard logs (S3)
```

### 12.2 CloudWatch Alarms

```ts
// CDK
new cloudwatch.Alarm(this, 'HighErrorRate', {
  metric: distribution.metricTotalErrorRate(),
  threshold: 5,                            // 5% error rate
  evaluationPeriods: 3,
  comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
  actionsEnabled: true,
  alarmActions: [snsTopic],
});
```

### 12.3 CloudFront Access Logs

```
Enable standard logging → S3 bucket
Each log line includes:
  - Date, time
  - Edge location
  - Client IP
  - URI
  - Status code
  - Bytes sent
  - Cache hit/miss
  - User-Agent
```

---

## 13. Multi-Environment Setup

### 13.1 Typical Setup

```
Environment   Branch    S3 Bucket              Domain              CloudFront
development   develop   my-app-dev             dev.example.com     E111...
qa            qa        my-app-qa              qa.example.com      E222...
production    main      my-app-prod            app.example.com     E333...
```

### 13.2 CDK Multi-Stack

```ts
const app = new cdk.App();

new FrontendStack(app, 'FrontendDev', {
  env: { account: '123456789', region: 'us-east-1' },
  stage: 'dev',
  domainName: 'dev.example.com',
  apiUrl: 'https://dev-api.example.com',
});

new FrontendStack(app, 'FrontendProd', {
  env: { account: '123456789', region: 'us-east-1' },
  stage: 'prod',
  domainName: 'app.example.com',
  apiUrl: 'https://api.example.com',
});
```

---

## 14. AWS Amplify (Alternative)

### 14.1 Setup

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli
amplify init

# Or connect via AWS Console:
# Amplify > New App > Host Web App > GitHub > Select repo
```

### 14.2 amplify.yml

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*

  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Strict-Transport-Security'
          value: 'max-age=31536000; includeSubDomains'
        - key: 'X-Content-Type-Options'
          value: 'nosniff'
        - key: 'X-Frame-Options'
          value: 'DENY'
```

### 14.3 Amplify Rewrites (SPA Routing)

```json
[
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>",
    "target": "/index.html",
    "status": "200"
  }
]
```

### 14.4 Amplify vs S3 + CloudFront

| Feature | Amplify | S3 + CloudFront |
|---------|---------|----------------|
| Setup time | 5 minutes | 30-60 minutes |
| CI/CD | Built-in (git push = deploy) | Manual (GitHub Actions / CodePipeline) |
| Branch previews | Yes | Manual |
| PR previews | Yes | No |
| Custom headers | Limited | Full control |
| WAF | No | Yes |
| Cost control | Less | More |
| IaC | Amplify CLI | CDK/CloudFormation/Terraform |

---

## 15. Cost Breakdown

### 15.1 Typical Monthly Cost (Moderate Traffic)

```
Assumptions: 100K unique visitors/month, 5 pages/visit, ~2MB per visit

S3:
  Storage: ~50 MB = ~$0.01
  Requests: 500K GET = ~$0.20

CloudFront:
  Data transfer: 200 GB = ~$17.00 (first 10TB at $0.085/GB)
  Requests: 500K HTTPS = ~$0.50
  Invalidations: ~50 = free (first 1000/month free)

Route 53:
  Hosted zone: $0.50
  Queries: 500K = ~$0.20

ACM:
  Certificate: FREE

Total: ~$18/month
```

### 15.2 Cost Optimization

```
1. Use CloudFront Price Class 100 (US/Europe only) — saves ~20%
2. Maximize cache hit ratio — reduce origin requests
3. Compress assets (gzip/brotli) — reduce data transfer
4. Use immutable cache headers on hashed assets — browser caches locally
5. Enable S3 Intelligent-Tiering for infrequently accessed assets
6. Only invalidate changed files, not "/*"
```

---

## 16. Interview Questions & Answers

### Beginner

---

**Q1: How do you deploy a React SPA on AWS?**

The standard approach: **S3 + CloudFront**.

1. Build the React app (`npm run build`) to generate static files
2. Upload files to an S3 bucket (private, no public access)
3. Create a CloudFront distribution pointing to the S3 bucket (as origin)
4. Configure CloudFront error pages: 403/404 → `/index.html` (for SPA routing)
5. Set up HTTPS with ACM certificate
6. Point your domain to CloudFront via Route 53

CloudFront serves as the CDN — caches files globally for fast delivery and handles HTTPS.

---

**Q2: Why do you need CloudFront? Can't you just use S3?**

S3 static website hosting works but has limitations:
- **No HTTPS** (HTTP only)
- **No CDN** — files served from a single region
- **No custom domain with HTTPS** easily
- **Higher latency** for global users
- **No compression** (gzip/brotli)

CloudFront adds: global CDN (400+ edge locations), HTTPS, compression, caching, security headers, WAF integration, and HTTP/2+3 support. It's practically required for production.

---

**Q3: How do you handle SPA routing on S3/CloudFront?**

SPAs use client-side routing (React Router). When a user navigates to `/dashboard/users` and refreshes, the browser requests that path from the server. Since there's no actual file at that path, you get a 403/404.

Solution: Configure CloudFront custom error responses to serve `/index.html` for 403 and 404 errors with a 200 status code. React Router then reads the URL and renders the correct page.

---

**Q4: What is Origin Access Control (OAC)?**

OAC is a CloudFront feature that restricts access to your S3 bucket — only CloudFront can read the files. Users can't bypass CloudFront by accessing S3 directly.

Without OAC: Anyone could access `my-bucket.s3.amazonaws.com/index.html` directly, bypassing your CDN, caching, and security.

With OAC: S3 bucket is fully private. Only the specific CloudFront distribution can read from it (enforced by S3 bucket policy).

---

**Q5: How does caching work for an SPA?**

Two-tier strategy:
- **index.html**: `no-cache` — always fetch the latest version from origin. This is the entry point that references hashed asset files.
- **JS/CSS assets** (e.g., `index-abc123.js`): `max-age=31536000, immutable` — cached for 1 year. The content hash in the filename ensures a new build produces a new filename, so old caches are irrelevant.

When you deploy: index.html changes → user gets new index.html → which loads new hashed assets → old assets are never requested again.

---

### Intermediate

---

**Q6: How would you set up CI/CD for frontend deployment?**

Using GitHub Actions:
1. **Trigger**: Push to `main` branch
2. **Build**: Install deps (`npm ci`), run build (`npm run build`)
3. **Deploy**: `aws s3 sync dist/ s3://bucket --delete`
4. **Invalidate**: `aws cloudfront create-invalidation --paths "/*"`
5. **Credentials**: Use OIDC or IAM access keys stored in GitHub Secrets

For multiple environments: Use GitHub Environments with branch protection rules — `develop` deploys to dev, `main` to production.

---

**Q7: How do you handle environment variables in a frontend deployment?**

Frontend env vars are embedded at **build time** (Vite's `VITE_*` variables). They're baked into the JavaScript bundle.

Options:
1. **Per-environment builds**: Different CI/CD pipelines set different env vars, producing different builds for dev/staging/prod
2. **Runtime config**: Load config from a `config.js` file that's separate from the build. Change the file in S3 without rebuilding.
3. **API-driven config**: Fetch config from an API on app startup

Option 1 is most common. Option 2 is useful when you need to change config without rebuilding.

---

**Q8: What is CloudFront invalidation and when do you need it?**

CloudFront caches files at edge locations. When you update files in S3, CloudFront still serves the old cached versions until the cache expires (TTL).

Invalidation forces CloudFront to fetch new versions from S3 immediately. You need it after every deployment for files without content hashes (mainly `index.html`).

```bash
aws cloudfront create-invalidation --distribution-id E123 --paths "/index.html"
```

Hashed assets (JS/CSS) don't need invalidation — new builds produce new filenames, so they're never cached under the old name.

---

**Q9: Compare S3+CloudFront vs AWS Amplify for frontend hosting.**

S3+CloudFront: More control, cheaper at scale, requires manual CI/CD setup, supports WAF and advanced CloudFront features, better for production enterprise apps.

Amplify: Zero-config CI/CD, branch/PR previews, faster setup, less control, slightly more expensive, better for prototypes and small-to-medium projects.

Choose S3+CloudFront when you need full control over caching, security headers, WAF, or have specific compliance requirements. Choose Amplify when speed of setup and developer experience matter more.

---

**Q10: How do you secure a frontend deployment on AWS?**

1. **S3**: Block all public access, use OAC (CloudFront-only access)
2. **HTTPS**: ACM certificate, redirect HTTP to HTTPS
3. **TLS 1.2+**: CloudFront security policy
4. **Security headers**: HSTS, X-Content-Type-Options, X-Frame-Options, CSP via CloudFront response headers policy
5. **WAF**: Rate limiting, geo-blocking, SQL injection / XSS protection
6. **Access control**: IAM roles with least privilege for deployment
7. **OIDC for CI/CD**: Use GitHub OIDC instead of long-lived IAM keys

---

### Advanced

---

**Q11: How would you implement blue-green deployment for a frontend?**

Two approaches:

**Approach 1: Two S3 buckets**
```
Blue bucket  (current production)  ← CloudFront points here
Green bucket (new version)         ← deployed and tested

Switch: Update CloudFront origin from blue to green
Rollback: Switch back to blue
```

**Approach 2: Versioned prefixes**
```
S3: /v1/index.html, /v1/assets/...  (current)
S3: /v2/index.html, /v2/assets/...  (new)

Switch: Update CloudFront origin path from /v1 to /v2
```

**Approach 3: CloudFront Functions for routing**
```ts
// CloudFront Function (viewer-request)
function handler(event) {
  const version = 'v2';  // change this to switch
  event.request.uri = `/${version}${event.request.uri}`;
  return event.request;
}
```

---

**Q12: How do you implement a multi-region frontend for disaster recovery?**

```
Route 53 (failover routing)
  ├→ Primary:   CloudFront (us-east-1) → S3 (us-east-1)
  └→ Secondary: CloudFront (eu-west-1) → S3 (eu-west-1)

Setup:
1. S3 cross-region replication (auto-sync buckets)
2. Two CloudFront distributions (one per region)
3. Route 53 health checks on primary
4. Failover routing policy: if primary is unhealthy, route to secondary
```

For most SPAs, a single CloudFront distribution is sufficient — CloudFront itself is globally distributed across 400+ edge locations. Multi-region setup is mainly for S3 origin redundancy.

---

**Q13: How would you handle A/B testing with CloudFront?**

```ts
// CloudFront Function (viewer-request)
function handler(event) {
  const request = event.request;
  const cookies = request.cookies;

  // Check for existing assignment
  if (cookies['ab-test']) {
    const variant = cookies['ab-test'].value;
    request.uri = `/${variant}${request.uri}`;
    return request;
  }

  // Assign variant (50/50)
  const variant = Math.random() < 0.5 ? 'a' : 'b';
  request.uri = `/${variant}${request.uri}`;

  // Set cookie via response header (in viewer-response function)
  request.headers['x-ab-variant'] = { value: variant };
  return request;
}
```

S3 structure:
```
/a/index.html, /a/assets/...   (variant A)
/b/index.html, /b/assets/...   (variant B)
```

---

**Q14: How do you optimize CloudFront cache hit ratio?**

1. **Normalize query strings**: Remove unnecessary query params or sort them consistently
2. **Minimize cache key**: Don't include headers or cookies in cache key unless necessary
3. **Set proper Cache-Control headers**: Long TTLs for static assets, short/none for dynamic
4. **Enable Origin Shield**: Additional caching layer between edge and origin, reduces cache misses
5. **Use consistent URLs**: Avoid URL variations for the same content
6. **Pre-warm cache**: Generate traffic to popular paths after deployment

Monitor cache hit ratio in CloudWatch — aim for 90%+ for static sites.

---

**Q15: How do you handle Content Security Policy (CSP) for an SPA?**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://*.amazonaws.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com https://*.amazonaws.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

Set via CloudFront Response Headers Policy. Challenges with SPAs:
- Vite injects inline scripts → need `'unsafe-inline'` or use nonces
- CSS-in-JS may need `'unsafe-inline'` for styles
- Google Maps, analytics, third-party scripts need explicit allow
- Test thoroughly — overly strict CSP breaks functionality

Start with `Content-Security-Policy-Report-Only` to monitor before enforcing.

---

## References

- [AWS CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide) — CDN documentation
- [AWS S3 Static Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) — S3 website hosting guide
- [AWS Amplify Documentation](https://docs.amplify.aws) — Full-stack deployment platform
