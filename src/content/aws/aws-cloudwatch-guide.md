# AWS CloudWatch & Monitoring — Complete Guide

## Table of Contents

- [1. What is CloudWatch?](#1-what-is-cloudwatch)
- [2. CloudWatch Metrics](#2-cloudwatch-metrics)
  - [2.1 Default vs Custom Metrics](#21-default-vs-custom-metrics)
  - [2.2 Namespaces and Dimensions](#22-namespaces-and-dimensions)
  - [2.3 Metric Resolution (Standard vs High-Resolution)](#23-metric-resolution-standard-vs-high-resolution)
  - [2.4 Publishing Custom Metrics](#24-publishing-custom-metrics)
- [3. CloudWatch Alarms](#3-cloudwatch-alarms)
  - [3.1 Alarm States (OK, ALARM, INSUFFICIENT_DATA)](#31-alarm-states-ok-alarm-insufficient_data)
  - [3.2 Creating Alarms](#32-creating-alarms)
  - [3.3 Composite Alarms](#33-composite-alarms)
  - [3.4 Alarm Actions (SNS, Auto Scaling, EC2)](#34-alarm-actions-sns-auto-scaling-ec2)
- [4. CloudWatch Logs](#4-cloudwatch-logs)
  - [4.1 Log Groups, Log Streams, Log Events](#41-log-groups-log-streams-log-events)
  - [4.2 Log Retention](#42-log-retention)
  - [4.3 Metric Filters](#43-metric-filters)
  - [4.4 Log Insights (Query Language)](#44-log-insights-query-language)
  - [4.5 Subscription Filters](#45-subscription-filters)
  - [4.6 Cross-Account Log Sharing](#46-cross-account-log-sharing)
- [5. CloudWatch Dashboards](#5-cloudwatch-dashboards)
  - [5.1 Creating Dashboards](#51-creating-dashboards)
  - [5.2 Widget Types](#52-widget-types)
  - [5.3 Cross-Account and Cross-Region](#53-cross-account-and-cross-region)
- [6. CloudWatch Events / EventBridge](#6-cloudwatch-events--eventbridge)
  - [6.1 Rules and Targets](#61-rules-and-targets)
  - [6.2 Event Patterns](#62-event-patterns)
  - [6.3 Scheduled Events (Cron)](#63-scheduled-events-cron)
- [7. CloudWatch Agent](#7-cloudwatch-agent)
  - [7.1 Installing and Configuring](#71-installing-and-configuring)
  - [7.2 Collecting System Metrics](#72-collecting-system-metrics)
  - [7.3 Collecting Application Logs](#73-collecting-application-logs)
- [8. CloudTrail](#8-cloudtrail)
  - [8.1 What is CloudTrail?](#81-what-is-cloudtrail)
  - [8.2 Management Events vs Data Events](#82-management-events-vs-data-events)
  - [8.3 Trail Configuration](#83-trail-configuration)
  - [8.4 CloudTrail + CloudWatch Integration](#84-cloudtrail--cloudwatch-integration)
- [9. AWS X-Ray](#9-aws-x-ray)
  - [9.1 Distributed Tracing](#91-distributed-tracing)
  - [9.2 X-Ray SDK Integration](#92-x-ray-sdk-integration)
  - [9.3 Service Maps](#93-service-maps)
  - [9.4 Trace Analysis](#94-trace-analysis)
- [10. Monitoring Best Practices](#10-monitoring-best-practices)
  - [10.1 What to Monitor per Service](#101-what-to-monitor-per-service)
  - [10.2 Setting Meaningful Alarms](#102-setting-meaningful-alarms)
  - [10.3 Cost Optimization](#103-cost-optimization)
- [11. Interview Questions & Answers](#11-interview-questions--answers)

---

## 1. What is CloudWatch?

Amazon CloudWatch is AWS's **native monitoring and observability service**. It collects metrics, logs, and events from virtually every AWS resource. It provides a unified view of operational health, enabling you to detect anomalies, set alarms, visualize data, and take automated actions.

Key characteristics:
- **Unified monitoring** — single pane of glass for metrics, logs, alarms, and dashboards
- **Automatic integration** — most AWS services publish metrics to CloudWatch by default
- **Actionable** — trigger alarms, auto-scaling, Lambda functions, or SNS notifications
- **Extensible** — publish custom metrics and logs from your own applications
- **Pay-per-use** — free tier covers basic monitoring; detailed/custom monitoring costs extra

### How CloudWatch Fits Into the AWS Monitoring Ecosystem

```
                    +---------------------------+
                    |      CloudWatch            |
                    |  (Metrics, Logs, Alarms,  |
                    |   Dashboards, Events)      |
                    +---------------------------+
                         ^       ^       ^
                         |       |       |
              +----------+   +---+---+   +----------+
              |              |       |               |
         AWS Services   CloudWatch  CloudTrail    X-Ray
         (EC2, RDS,      Agent     (API audit    (Distributed
          Lambda...)    (OS-level   logging)      tracing)
                        metrics)
```

### Pricing Overview

```
Metrics:
  - Basic monitoring (5-min)     : Free (most AWS services)
  - Detailed monitoring (1-min)  : $0.30/metric/month
  - Custom metrics               : $0.30/metric/month
  - High-resolution (1-sec)      : $0.30/metric/month (same cost, more data points)

Alarms:
  - Standard resolution          : $0.10/alarm/month
  - High-resolution              : $0.30/alarm/month

Logs:
  - Ingestion                    : $0.50/GB
  - Storage (archival)           : $0.03/GB/month
  - Log Insights queries         : $0.005/GB scanned

Dashboards:
  - First 3 dashboards           : Free
  - Additional                   : $3.00/dashboard/month

Free tier (always free):
  - 10 custom metrics
  - 10 alarms
  - 1,000,000 API requests
  - 5 GB log ingestion
  - 5 GB log storage
  - 3 dashboards (up to 50 metrics each)
```

---

## 2. CloudWatch Metrics

CloudWatch metrics are time-ordered data points representing the behavior of your AWS resources. Every AWS service sends default metrics automatically — CPU utilization for EC2, invocation count for Lambda, request count for ALB, etc.

### 2.1 Default vs Custom Metrics

Default metrics are published automatically by AWS services at no extra cost. Custom metrics are metrics you define and publish from your own application code or infrastructure.

```
Default Metrics (free, automatic):
┌─────────────────────────────────────────────────────┐
│ Service       │ Metrics Published Automatically      │
├───────────────┼─────────────────────────────────────┤
│ EC2           │ CPUUtilization, NetworkIn/Out,       │
│               │ DiskReadOps, StatusCheckFailed       │
│               │ (NOT memory, NOT disk usage)         │
├───────────────┼─────────────────────────────────────┤
│ RDS           │ CPUUtilization, FreeableMemory,      │
│               │ ReadIOPS, DatabaseConnections         │
├───────────────┼─────────────────────────────────────┤
│ Lambda        │ Invocations, Duration, Errors,       │
│               │ Throttles, ConcurrentExecutions       │
├───────────────┼─────────────────────────────────────┤
│ ALB           │ RequestCount, TargetResponseTime,    │
│               │ HTTPCode_Target_5XX_Count             │
├───────────────┼─────────────────────────────────────┤
│ DynamoDB      │ ConsumedReadCapacity,                │
│               │ ConsumedWriteCapacity, Throttles      │
├───────────────┼─────────────────────────────────────┤
│ S3            │ BucketSizeBytes, NumberOfObjects      │
│               │ (requires enabling request metrics)   │
└───────────────┴─────────────────────────────────────┘

Custom Metrics (you publish):
  - Memory utilization (EC2)        ← NOT a default metric!
  - Disk space usage (EC2)          ← NOT a default metric!
  - Application-level metrics (orders/sec, queue depth, login failures)
  - Business KPIs (revenue, signups)
```

**Important interview fact:** EC2 does **not** send memory or disk usage metrics by default. You need the CloudWatch Agent or a custom script to publish those.

### 2.2 Namespaces and Dimensions

Namespaces are containers that isolate metrics from different sources. Dimensions are key-value pairs that identify a specific metric within a namespace — think of them as filters.

```
Namespace:  A category for grouping metrics
            AWS services use the format: AWS/<ServiceName>
            Custom metrics use any string:  MyApp/Production

Dimension:  A name/value pair that uniquely identifies a metric
            Example: InstanceId=i-1234567890abcdef0

Together they form the "address" of a metric:
  Namespace:  AWS/EC2
  MetricName: CPUUtilization
  Dimensions: InstanceId=i-abc123
              → This uniquely identifies CPU utilization for one specific EC2 instance
```

```bash
# List all available metrics in a namespace
aws cloudwatch list-metrics \
  --namespace "AWS/EC2"

# List metrics with a specific dimension (filter to one instance)
aws cloudwatch list-metrics \
  --namespace "AWS/EC2" \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0

# Get metric data for a specific EC2 instance
aws cloudwatch get-metric-statistics \
  --namespace "AWS/EC2" \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-01T01:00:00Z \
  --period 300 \                  # 300 seconds = 5 minutes
  --statistics Average Maximum    # can also use: Sum, Minimum, SampleCount
```

### 2.3 Metric Resolution (Standard vs High-Resolution)

Standard resolution metrics have a minimum period of 60 seconds. High-resolution metrics can go down to 1-second granularity — useful for fast-changing workloads.

```
Standard Resolution (default):
  - Data published at 1-minute or 5-minute intervals
  - 5-minute: basic monitoring (free for EC2)
  - 1-minute: detailed monitoring ($0.30/metric/month for EC2)
  - Minimum alarm period: 60 seconds

High-Resolution:
  - Data published at 1-second intervals
  - Minimum alarm period: 10 seconds
  - Same cost per metric ($0.30/metric/month) — just more data points
  - Set StorageResolution=1 when publishing

Data Retention:
  - 1-second data points → retained for 3 hours
  - 60-second data points → retained for 15 days
  - 5-minute data points → retained for 63 days
  - 1-hour data points → retained for 455 days (15 months)
  → CloudWatch automatically aggregates old data into coarser resolution
```

```bash
# Enable detailed monitoring on an EC2 instance (1-minute intervals)
aws ec2 monitor-instances --instance-ids i-1234567890abcdef0

# Disable detailed monitoring (back to basic 5-minute)
aws ec2 unmonitor-instances --instance-ids i-1234567890abcdef0
```

### 2.4 Publishing Custom Metrics

You publish custom metrics using the `put-metric-data` API. Custom metrics support dimensions, timestamps, and optional units.

```bash
# Publish a single custom metric data point
aws cloudwatch put-metric-data \
  --namespace "MyApp/Production" \
  --metric-name "OrdersProcessed" \
  --value 125 \
  --unit Count \
  --dimensions Environment=Production,Service=OrderService

# Publish a high-resolution custom metric (1-second resolution)
aws cloudwatch put-metric-data \
  --namespace "MyApp/Production" \
  --metric-name "ApiLatency" \
  --value 45.2 \
  --unit Milliseconds \
  --storage-resolution 1 \            # 1 = high-resolution, 60 = standard (default)
  --dimensions Endpoint=/api/orders

# Publish metric with statistic values (aggregated data — more efficient)
aws cloudwatch put-metric-data \
  --namespace "MyApp/Production" \
  --metric-name "RequestLatency" \
  --statistic-values Sum=1500,Minimum=10,Maximum=450,SampleCount=20 \
  --unit Milliseconds

# Publish multiple metrics at once (batch, up to 1000 values)
aws cloudwatch put-metric-data \
  --namespace "MyApp/Production" \
  --metric-data '[
    {
      "MetricName": "ActiveUsers",
      "Value": 350,
      "Unit": "Count",
      "Dimensions": [
        { "Name": "Environment", "Value": "Production" }
      ]
    },
    {
      "MetricName": "ErrorRate",
      "Value": 2.5,
      "Unit": "Percent",
      "Dimensions": [
        { "Name": "Environment", "Value": "Production" },
        { "Name": "Service", "Value": "AuthService" }
      ]
    }
  ]'
```

Publishing from Node.js application code:

```javascript
// publish-custom-metric.js
const { CloudWatchClient, PutMetricDataCommand } = require("@aws-sdk/client-cloudwatch");

const client = new CloudWatchClient({ region: "us-east-1" });

async function publishMetric(metricName, value, unit, dimensions) {
  const command = new PutMetricDataCommand({
    Namespace: "MyApp/Production",          // your custom namespace
    MetricData: [
      {
        MetricName: metricName,
        Value: value,
        Unit: unit,                          // Count, Seconds, Milliseconds, Percent, etc.
        Timestamp: new Date(),
        Dimensions: dimensions.map(([name, val]) => ({
          Name: name,
          Value: val,
        })),
      },
    ],
  });

  await client.send(command);
}

// Usage: track order processing time
await publishMetric(
  "OrderProcessingTime",                    // metric name
  234,                                       // value
  "Milliseconds",                            // unit
  [["Service", "OrderService"], ["Environment", "Production"]]  // dimensions
);

// Usage: track business KPI
await publishMetric(
  "RevenueUSD",
  49.99,
  "None",                                    // "None" for dimensionless values
  [["Product", "Premium"], ["Region", "US"]]
);
```

---

## 3. CloudWatch Alarms

CloudWatch Alarms watch a single metric (or a math expression) and perform actions when the metric crosses a threshold. They are the primary mechanism for automated alerting and response in AWS.

### 3.1 Alarm States (OK, ALARM, INSUFFICIENT_DATA)

Every alarm is always in one of three states. State transitions trigger actions.

```
+--------------------+     threshold breached     +--------------------+
|        OK          | ───────────────────────► |      ALARM          |
| (metric is within  |                          | (metric crossed     |
|  acceptable range) | ◄─────────────────────── |  the threshold)     |
+--------------------+     metric recovered       +--------------------+
         ▲                                                  │
         │                                                  │
         │            +--------------------+                │
         └────────────|  INSUFFICIENT_DATA |────────────────┘
                      | (not enough data   |
                      |  points to decide) |
                      +--------------------+

State Details:
  OK                 → Metric is within the defined threshold
  ALARM              → Metric has breached the threshold for the evaluation period
  INSUFFICIENT_DATA  → Alarm just started, metric not reporting, or not enough data points
                       (Common reason: new alarm, or CloudWatch Agent stopped sending data)
```

### 3.2 Creating Alarms

Alarms evaluate a metric against a threshold over a number of consecutive periods. You define: which metric, what threshold, how many periods must breach, and what actions to take.

```bash
# Create an alarm: notify when EC2 CPU > 80% for 3 consecutive 5-minute periods
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPU-WebServer" \
  --alarm-description "CPU utilization exceeds 80% for 15 minutes" \
  --namespace "AWS/EC2" \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --statistic Average \
  --period 300 \                          # 300 seconds = 5 minutes
  --evaluation-periods 3 \               # 3 consecutive periods must breach
  --threshold 80 \                        # 80 percent
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data missing \          # options: missing, notBreaching, breaching, ignore
  --actions-enabled \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertsTopic" \
  --ok-actions "arn:aws:sns:us-east-1:123456789012:RecoveryTopic"

# Create alarm on a custom metric
aws cloudwatch put-metric-alarm \
  --alarm-name "HighErrorRate-OrderService" \
  --namespace "MyApp/Production" \
  --metric-name "ErrorRate" \
  --dimensions Name=Service,Value=OrderService \
  --statistic Average \
  --period 60 \
  --evaluation-periods 5 \               # 5 consecutive 1-minute periods
  --threshold 5 \                         # error rate > 5%
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertsTopic"

# Create alarm using metric math (e.g., error rate = errors / total * 100)
aws cloudwatch put-metric-alarm \
  --alarm-name "CalculatedErrorRate-API" \
  --metrics '[
    {
      "Id": "errors",
      "MetricStat": {
        "Metric": {
          "Namespace": "AWS/ApplicationELB",
          "MetricName": "HTTPCode_Target_5XX_Count",
          "Dimensions": [
            { "Name": "LoadBalancer", "Value": "app/my-alb/1234567890" }
          ]
        },
        "Period": 300,
        "Stat": "Sum"
      },
      "ReturnData": false
    },
    {
      "Id": "total",
      "MetricStat": {
        "Metric": {
          "Namespace": "AWS/ApplicationELB",
          "MetricName": "RequestCount",
          "Dimensions": [
            { "Name": "LoadBalancer", "Value": "app/my-alb/1234567890" }
          ]
        },
        "Period": 300,
        "Stat": "Sum"
      },
      "ReturnData": false
    },
    {
      "Id": "error_rate",
      "Expression": "(errors / total) * 100",
      "Label": "Error Rate %",
      "ReturnData": true
    }
  ]' \
  --evaluation-periods 3 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertsTopic"
```

**treat-missing-data options explained:**

```
missing       → Alarm stays in its current state (default)
notBreaching  → Treats missing data as "within threshold" — good for low-traffic metrics
breaching     → Treats missing data as "over threshold" — good when absence = problem
ignore        → Current alarm state maintained until enough data returns
```

### 3.3 Composite Alarms

Composite alarms combine multiple alarms using Boolean logic (AND, OR, NOT). This prevents alarm fatigue by only triggering when multiple conditions are met simultaneously.

```bash
# First create individual child alarms (see 3.2 above)
# Then create a composite alarm that only fires when BOTH alarms are in ALARM state

aws cloudwatch put-composite-alarm \
  --alarm-name "CriticalWebServer-Composite" \
  --alarm-description "Both CPU and memory are critically high" \
  --alarm-rule 'ALARM("HighCPU-WebServer") AND ALARM("HighMemory-WebServer")' \
  --actions-enabled \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:CriticalAlertsTopic"

# Composite alarm with OR logic — alert if ANY backend is unhealthy
aws cloudwatch put-composite-alarm \
  --alarm-name "AnyBackendUnhealthy" \
  --alarm-rule 'ALARM("Backend1-Health") OR ALARM("Backend2-Health") OR ALARM("Backend3-Health")' \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:OnCallTopic"

# Composite with NOT — suppress if maintenance mode is active
aws cloudwatch put-composite-alarm \
  --alarm-name "ProductionAlert-NotInMaintenance" \
  --alarm-rule 'ALARM("HighErrorRate") AND NOT ALARM("MaintenanceMode")' \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:PagerDutyTopic"
```

**Real-world scenario:** You have an e-commerce app. CPU spikes during Black Friday are expected. A composite alarm fires only when CPU is high AND error rate is high AND latency is high — indicating a real problem, not just high traffic.

### 3.4 Alarm Actions (SNS, Auto Scaling, EC2)

Alarms can trigger three types of actions: SNS notifications, Auto Scaling policies, and EC2 instance actions.

```bash
# Action 1: SNS Notification (most common — email, SMS, Slack, PagerDuty, Lambda)
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPU" \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertsTopic" \
  --ok-actions "arn:aws:sns:us-east-1:123456789012:RecoveryTopic" \
  # ... (metric config omitted for brevity)

# SNS topic → can fan out to:
#   - Email subscriptions
#   - SMS (phone numbers)
#   - Lambda (trigger automated remediation)
#   - HTTPS endpoint (PagerDuty, Slack webhook)
#   - SQS (queue for processing)

# Action 2: Auto Scaling Policy (scale in/out based on metric)
aws cloudwatch put-metric-alarm \
  --alarm-name "ScaleOut-HighCPU" \
  --namespace "AWS/EC2" \
  --metric-name CPUUtilization \
  --dimensions Name=AutoScalingGroupName,Value=my-asg \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 70 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:autoscaling:us-east-1:123456789012:scalingPolicy:policy-id:autoScalingGroupName/my-asg:policyName/ScaleOutPolicy"

# Action 3: EC2 Instance Actions (stop, terminate, reboot, recover)
aws cloudwatch put-metric-alarm \
  --alarm-name "RecoverInstance-StatusCheckFailed" \
  --namespace "AWS/EC2" \
  --metric-name StatusCheckFailed_System \
  --dimensions Name=InstanceId,Value=i-1234567890abcdef0 \
  --statistic Maximum \
  --period 60 \
  --evaluation-periods 2 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions "arn:aws:automate:us-east-1:ec2:recover"
  # Other EC2 actions:
  #   arn:aws:automate:REGION:ec2:stop
  #   arn:aws:automate:REGION:ec2:terminate
  #   arn:aws:automate:REGION:ec2:reboot
```

---

## 4. CloudWatch Logs

CloudWatch Logs is a centralized log management service. Applications, AWS services, and on-premises servers can all stream logs to CloudWatch Logs for storage, searching, and analysis.

### 4.1 Log Groups, Log Streams, Log Events

CloudWatch Logs is organized in a three-level hierarchy: Log Groups contain Log Streams, which contain Log Events.

```
Log Group:  /aws/lambda/my-function        ← container for related log streams
  │                                           (usually one per application/service)
  ├── Log Stream: 2025/01/15/[$LATEST]abc123  ← sequence of events from one source
  │     ├── Log Event: "START RequestId: ..."    ← single log entry with timestamp
  │     ├── Log Event: "Processing order #123"
  │     └── Log Event: "END RequestId: ..."
  │
  └── Log Stream: 2025/01/15/[$LATEST]def456  ← another Lambda execution environment
        ├── Log Event: "START RequestId: ..."
        └── Log Event: "END RequestId: ..."

Common Log Group naming patterns:
  /aws/lambda/<function-name>            ← Lambda functions (auto-created)
  /aws/rds/instance/<db-id>/error        ← RDS error logs
  /aws/ecs/<cluster>/<service>           ← ECS container logs
  /aws/apigateway/<api-id>               ← API Gateway access logs
  /myapp/production/web-server           ← custom application logs
```

```bash
# Create a log group
aws logs create-log-group \
  --log-group-name "/myapp/production/api"

# Create a log stream within the group
aws logs create-log-stream \
  --log-group-name "/myapp/production/api" \
  --log-stream-name "server-1/application.log"

# Put log events (requires sequence token for subsequent calls)
aws logs put-log-events \
  --log-group-name "/myapp/production/api" \
  --log-stream-name "server-1/application.log" \
  --log-events '[
    { "timestamp": 1704067200000, "message": "Server started on port 3000" },
    { "timestamp": 1704067201000, "message": "Connected to database" },
    { "timestamp": 1704067202000, "message": "ERROR: Failed to connect to Redis" }
  ]'

# List log groups
aws logs describe-log-groups --log-group-name-prefix "/myapp"

# Get log events from a stream
aws logs get-log-events \
  --log-group-name "/aws/lambda/my-function" \
  --log-stream-name "2025/01/15/[\$LATEST]abc123" \
  --start-time 1704067200000 \
  --end-time 1704070800000
```

### 4.2 Log Retention

By default, log data is stored indefinitely (never expires). You should always set a retention policy to control costs.

```bash
# Set retention to 30 days (most common for production)
aws logs put-retention-policy \
  --log-group-name "/myapp/production/api" \
  --retention-in-days 30

# Available retention options (days):
#   1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1096,
#   1827, 2192, 2557, 2922, 3288, 3653
#   Or: never expire (default)

# Delete retention policy (revert to never expire)
aws logs delete-retention-policy \
  --log-group-name "/myapp/production/api"

# Real-world retention strategy:
#   Development    → 7 days    (save costs, logs are transient)
#   Staging        → 14 days   (enough for testing cycles)
#   Production     → 30-90 days (compliance and debugging)
#   Audit/Security → 365+ days (regulatory compliance, export to S3 for long-term)
```

**Cost consideration:** At $0.03/GB/month for storage, a service producing 10 GB/day of logs costs $9/month for 30-day retention vs $109.50/month for 365-day retention. Export old logs to S3 ($0.023/GB/month) for long-term archival.

### 4.3 Metric Filters

Metric filters extract metric data from log events using pattern matching. They scan log data as it arrives and increment a CloudWatch metric when a pattern matches — turning logs into actionable metrics.

```bash
# Create a metric filter: count ERROR occurrences in logs
aws logs put-metric-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "ErrorCount" \
  --filter-pattern "ERROR" \              # simple text match
  --metric-transformations '[
    {
      "metricNamespace": "MyApp/Production",
      "metricName": "ErrorCount",
      "metricValue": "1",
      "defaultValue": 0
    }
  ]'

# Pattern matching examples:
#   "ERROR"                          → matches any log with "ERROR"
#   "?ERROR ?WARN"                   → matches "ERROR" OR "WARN" (? = OR)
#   "[ip, user, timestamp, request]" → space-delimited (positional)
#   "{ $.statusCode = 500 }"         → JSON field match
#   "{ $.statusCode >= 400 }"        → JSON numeric comparison
#   "{ $.level = \"ERROR\" }"        → JSON string match
#   "{ $.latency > 1000 && $.path = \"/api/orders\" }" → compound JSON filter

# Create a metric filter for JSON structured logs
# Log format: { "level": "ERROR", "statusCode": 500, "latency": 1234, "path": "/api/orders" }
aws logs put-metric-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "HighLatencyRequests" \
  --filter-pattern '{ $.latency > 2000 }' \    # requests over 2 seconds
  --metric-transformations '[
    {
      "metricNamespace": "MyApp/Production",
      "metricName": "HighLatencyCount",
      "metricValue": "1",
      "defaultValue": 0
    }
  ]'

# Extract a value from the log as the metric value (e.g., actual latency)
aws logs put-metric-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "RequestLatency" \
  --filter-pattern '{ $.latency = * }' \        # any log with a latency field
  --metric-transformations '[
    {
      "metricNamespace": "MyApp/Production",
      "metricName": "RequestLatency",
      "metricValue": "$.latency",
      "defaultValue": 0,
      "unit": "Milliseconds"
    }
  ]'

# Now you can alarm on this metric filter output!
aws cloudwatch put-metric-alarm \
  --alarm-name "TooManyErrors" \
  --namespace "MyApp/Production" \
  --metric-name "ErrorCount" \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertsTopic"
```

### 4.4 Log Insights (Query Language)

CloudWatch Logs Insights is a purpose-built query language for interactively searching and analyzing log data. It auto-discovers fields from JSON logs and allows SQL-like queries across multiple log groups.

```bash
# Run a Log Insights query via CLI
aws logs start-query \
  --log-group-names "/aws/lambda/my-function" "/myapp/production/api" \
  --start-time 1704067200 \
  --end-time 1704153600 \
  --query-string 'fields @timestamp, @message
    | filter @message like /ERROR/
    | sort @timestamp desc
    | limit 50'

# Get query results (use the queryId from start-query response)
aws logs get-query-results --query-id "12345678-1234-1234-1234-123456789012"
```

**Common Log Insights queries:**

```sql
-- Find the 25 most recent errors
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 25

-- Count errors per hour
fields @timestamp, @message
| filter @message like /ERROR/
| stats count(*) as errorCount by bin(1h)
| sort errorCount desc

-- Find the most expensive Lambda invocations (by duration)
filter @type = "REPORT"
| stats max(@duration) as maxDuration,
        avg(@duration) as avgDuration,
        count(*) as invocations
  by bin(5m)

-- Parse JSON logs and aggregate
fields @timestamp, @message
| parse @message '{"level":"*","statusCode":*,"path":"*","latency":*}' as level, status, path, latency
| filter level = "ERROR"
| stats count(*) as errors, avg(latency) as avgLatency by path
| sort errors desc
| limit 10

-- Find all 5xx responses grouped by API endpoint
fields @timestamp, @message
| filter ispresent(statusCode) and statusCode >= 500
| stats count(*) as count by path, statusCode
| sort count desc

-- Find the top 10 most active IP addresses
fields @timestamp, sourceIPAddress
| stats count(*) as requestCount by sourceIPAddress
| sort requestCount desc
| limit 10

-- Lambda cold start analysis
filter @type = "REPORT"
| fields @duration, @billedDuration, @memorySize, @maxMemoryUsed, @initDuration
| filter ispresent(@initDuration)              # initDuration only exists for cold starts
| stats count(*) as coldStarts,
        avg(@initDuration) as avgColdStartMs,
        max(@initDuration) as maxColdStartMs
  by bin(1h)

-- Percentile analysis (p50, p90, p99)
filter @type = "REPORT"
| stats avg(@duration) as avg,
        pct(@duration, 50) as p50,
        pct(@duration, 90) as p90,
        pct(@duration, 99) as p99,
        max(@duration) as max
  by bin(5m)
```

**Auto-discovered fields:** CloudWatch Logs Insights automatically discovers fields like `@timestamp`, `@message`, `@logStream`, and any JSON keys in your log messages.

### 4.5 Subscription Filters

Subscription filters stream log data in real-time to other AWS services for further processing. Each log group can have up to 2 subscription filters.

```bash
# Stream logs to a Lambda function for real-time processing
aws logs put-subscription-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "ErrorsToLambda" \
  --filter-pattern "ERROR" \
  --destination-arn "arn:aws:lambda:us-east-1:123456789012:function:ProcessErrors"

# Stream logs to Kinesis Data Firehose (for S3, Elasticsearch, Splunk)
aws logs put-subscription-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "AllLogsToS3" \
  --filter-pattern "" \                   # empty = match all logs
  --destination-arn "arn:aws:firehose:us-east-1:123456789012:deliverystream/logs-to-s3" \
  --role-arn "arn:aws:iam::123456789012:role/CWLtoFirehoseRole"

# Stream logs to Kinesis Data Stream (for custom processing)
aws logs put-subscription-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "LogsToKinesis" \
  --filter-pattern '{ $.level = "ERROR" }' \
  --destination-arn "arn:aws:kinesis:us-east-1:123456789012:stream/log-stream" \
  --role-arn "arn:aws:iam::123456789012:role/CWLtoKinesisRole"

# Stream logs to an OpenSearch (Elasticsearch) domain
aws logs put-subscription-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "LogsToOpenSearch" \
  --filter-pattern "" \
  --destination-arn "arn:aws:es:us-east-1:123456789012:domain/my-logs" \
  --role-arn "arn:aws:iam::123456789012:role/CWLtoOpenSearchRole"
```

```
Subscription Filter Destinations:
┌────────────────────────────────────────────────────────┐
│  CloudWatch Logs Log Group                             │
│  (subscription filter applied)                         │
└──────────────┬─────────────────────────────────────────┘
               │ real-time streaming
               ├──► Lambda Function (real-time processing, alerting)
               ├──► Kinesis Data Stream (custom processing pipeline)
               ├──► Kinesis Data Firehose (load to S3, OpenSearch, Splunk)
               └──► CloudWatch Logs in another account (cross-account)
```

### 4.6 Cross-Account Log Sharing

You can share log data from multiple AWS accounts into a central logging account using subscription filters with cross-account destinations.

```bash
# In the DESTINATION account (central logging — account 111111111111):
# Create a destination (Kinesis stream or Firehose in the central account)
aws logs put-destination \
  --destination-name "CentralLogDestination" \
  --target-arn "arn:aws:kinesis:us-east-1:111111111111:stream/central-logs" \
  --role-arn "arn:aws:iam::111111111111:role/CWLtoCentralKinesisRole"

# Set an access policy to allow source accounts to send logs
aws logs put-destination-policy \
  --destination-name "CentralLogDestination" \
  --access-policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "AWS": ["222222222222", "333333333333"]
        },
        "Action": "logs:PutSubscriptionFilter",
        "Resource": "arn:aws:logs:us-east-1:111111111111:destination:CentralLogDestination"
      }
    ]
  }'

# In each SOURCE account (222222222222, 333333333333):
# Create subscription filter pointing to the central destination
aws logs put-subscription-filter \
  --log-group-name "/myapp/production/api" \
  --filter-name "ToCentralLogging" \
  --filter-pattern "" \
  --destination-arn "arn:aws:logs:us-east-1:111111111111:destination:CentralLogDestination"
```

```
Cross-Account Architecture:
┌─────────────────────┐  ┌─────────────────────┐
│ Account A (Dev)     │  │ Account B (Prod)     │
│  Log Group 1 ──────►│  │  Log Group 1 ──────►│
│  Log Group 2 ──────►│  │  Log Group 2 ──────►│
└────────┬────────────┘  └────────┬────────────┘
         │ subscription            │ subscription
         │ filter                  │ filter
         ▼                         ▼
┌──────────────────────────────────────────────┐
│ Central Logging Account (111111111111)        │
│  Kinesis Stream → Firehose → S3 / OpenSearch  │
│  → Single-pane-of-glass log analysis          │
└──────────────────────────────────────────────┘
```

---

## 5. CloudWatch Dashboards

CloudWatch Dashboards provide customizable visualization pages for your metrics. They support multiple widget types and can display data from multiple AWS accounts and regions in a single view.

### 5.1 Creating Dashboards

Dashboards are defined in JSON. You can create them via the console, CLI, or CloudFormation.

```bash
# Create a dashboard with a CPU utilization widget
aws cloudwatch put-dashboard \
  --dashboard-name "Production-Overview" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "x": 0,
        "y": 0,
        "width": 12,
        "height": 6,
        "properties": {
          "title": "EC2 CPU Utilization",
          "metrics": [
            ["AWS/EC2", "CPUUtilization", "InstanceId", "i-abc123", { "label": "Web Server 1" }],
            ["AWS/EC2", "CPUUtilization", "InstanceId", "i-def456", { "label": "Web Server 2" }]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "view": "timeSeries"
        }
      },
      {
        "type": "metric",
        "x": 12,
        "y": 0,
        "width": 12,
        "height": 6,
        "properties": {
          "title": "Lambda Invocations & Errors",
          "metrics": [
            ["AWS/Lambda", "Invocations", "FunctionName", "my-api", { "stat": "Sum", "color": "#2ca02c" }],
            ["AWS/Lambda", "Errors", "FunctionName", "my-api", { "stat": "Sum", "color": "#d62728" }]
          ],
          "period": 300,
          "region": "us-east-1",
          "view": "timeSeries",
          "yAxis": { "left": { "min": 0 } }
        }
      }
    ]
  }'

# List dashboards
aws cloudwatch list-dashboards

# Get a dashboard definition
aws cloudwatch get-dashboard --dashboard-name "Production-Overview"

# Delete a dashboard
aws cloudwatch delete-dashboards --dashboard-names "Production-Overview"
```

### 5.2 Widget Types

Dashboards support several widget types, each suited for different visualization needs.

```json
{
  "widgets": [
    // 1. LINE CHART — trends over time (most common)
    {
      "type": "metric",
      "properties": {
        "title": "API Latency Over Time",
        "view": "timeSeries",                    // line chart
        "stacked": false,
        "metrics": [
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/my-alb/123"]
        ],
        "period": 300,
        "stat": "Average"
      }
    },

    // 2. STACKED AREA CHART — show composition
    {
      "type": "metric",
      "properties": {
        "title": "HTTP Status Codes",
        "view": "timeSeries",
        "stacked": true,                         // stacked area chart
        "metrics": [
          ["AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", "LoadBalancer", "app/my-alb/123"],
          ["AWS/ApplicationELB", "HTTPCode_Target_4XX_Count", "LoadBalancer", "app/my-alb/123"],
          ["AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", "LoadBalancer", "app/my-alb/123"]
        ]
      }
    },

    // 3. NUMBER (single value) — current state at a glance
    {
      "type": "metric",
      "properties": {
        "title": "Active Connections",
        "view": "singleValue",                   // big number
        "metrics": [
          ["AWS/ApplicationELB", "ActiveConnectionCount", "LoadBalancer", "app/my-alb/123"]
        ],
        "period": 60,
        "stat": "Sum"
      }
    },

    // 4. GAUGE — show value relative to a threshold
    {
      "type": "metric",
      "properties": {
        "title": "CPU Utilization",
        "view": "gauge",                         // gauge widget
        "metrics": [
          ["AWS/EC2", "CPUUtilization", "InstanceId", "i-abc123"]
        ],
        "yAxis": { "left": { "min": 0, "max": 100 } },
        "period": 300,
        "stat": "Average"
      }
    },

    // 5. TEXT — markdown for documentation, links, headers
    {
      "type": "text",
      "properties": {
        "markdown": "# Production Dashboard\n**Team:** Platform Engineering\n**Runbook:** [link](https://wiki.example.com/runbook)"
      }
    },

    // 6. LOG — show recent log events
    {
      "type": "log",
      "properties": {
        "title": "Recent Errors",
        "query": "fields @timestamp, @message\n| filter @message like /ERROR/\n| sort @timestamp desc\n| limit 20",
        "region": "us-east-1",
        "stacked": false,
        "view": "table"
      }
    },

    // 7. ALARM STATUS — show alarm states
    {
      "type": "alarm",
      "properties": {
        "title": "Alarm Status",
        "alarms": [
          "arn:aws:cloudwatch:us-east-1:123456789012:alarm:HighCPU",
          "arn:aws:cloudwatch:us-east-1:123456789012:alarm:HighMemory",
          "arn:aws:cloudwatch:us-east-1:123456789012:alarm:HighErrorRate"
        ]
      }
    }
  ]
}
```

### 5.3 Cross-Account and Cross-Region

CloudWatch dashboards can display metrics from multiple AWS accounts and regions. This requires setting up cross-account observability.

```
Cross-Account Setup:
1. Enable "CloudWatch cross-account observability" in the monitoring account
2. Link source accounts (the accounts being monitored)
3. Source accounts share metrics, logs, and traces with the monitoring account

Cross-Region:
  - Each widget can specify its own "region" property
  - A single dashboard can show US-East, EU-West, and AP-Southeast metrics together
```

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "Global API Latency",
        "metrics": [
          // US region
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/us-alb/123",
            { "region": "us-east-1", "label": "US-East" }],
          // EU region
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/eu-alb/456",
            { "region": "eu-west-1", "label": "EU-West" }],
          // Asia region
          ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", "app/ap-alb/789",
            { "region": "ap-southeast-1", "label": "Asia-Pacific" }]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Cross-Account CPU (Monitoring Account View)",
        "metrics": [
          // Metrics from Account A
          ["AWS/EC2", "CPUUtilization", "InstanceId", "i-aaa111",
            { "accountId": "111111111111", "label": "Dev Account" }],
          // Metrics from Account B
          ["AWS/EC2", "CPUUtilization", "InstanceId", "i-bbb222",
            { "accountId": "222222222222", "label": "Prod Account" }]
        ],
        "period": 300,
        "stat": "Average"
      }
    }
  ]
}
```

---

## 6. CloudWatch Events / EventBridge

CloudWatch Events (now replaced by Amazon EventBridge) is an event bus service that delivers a near-real-time stream of system events. EventBridge extends CloudWatch Events with support for SaaS integrations, custom event buses, schema registries, and more.

### 6.1 Rules and Targets

Rules match incoming events and route them to one or more targets. A single rule can have up to 5 targets.

```bash
# Create an EventBridge rule that triggers on EC2 state changes
aws events put-rule \
  --name "EC2StateChangeRule" \
  --event-pattern '{
    "source": ["aws.ec2"],
    "detail-type": ["EC2 Instance State-change Notification"],
    "detail": {
      "state": ["stopped", "terminated"]
    }
  }' \
  --state ENABLED \
  --description "Detect when EC2 instances stop or terminate"

# Add a target: invoke a Lambda function
aws events put-targets \
  --rule "EC2StateChangeRule" \
  --targets '[
    {
      "Id": "NotifyLambda",
      "Arn": "arn:aws:lambda:us-east-1:123456789012:function:HandleEC2StateChange"
    }
  ]'

# Add a target: send to SNS topic
aws events put-targets \
  --rule "EC2StateChangeRule" \
  --targets '[
    {
      "Id": "NotifySNS",
      "Arn": "arn:aws:sns:us-east-1:123456789012:EC2Alerts",
      "InputTransformer": {
        "InputPathsMap": {
          "instance": "$.detail.instance-id",
          "state": "$.detail.state"
        },
        "InputTemplate": "\"EC2 instance <instance> changed state to <state>\""
      }
    }
  ]'

# List rules
aws events list-rules

# List targets for a rule
aws events list-targets-by-rule --rule "EC2StateChangeRule"
```

```
Supported Targets:
  - Lambda function          ← most common
  - SNS topic
  - SQS queue
  - Kinesis Data Stream
  - Step Functions state machine
  - ECS task (run a container)
  - CodePipeline (trigger deployment)
  - CodeBuild (trigger build)
  - SSM Run Command
  - API Gateway endpoint
  - Another EventBridge bus (cross-account)
```

### 6.2 Event Patterns

Event patterns define which events a rule matches. They use a JSON structure that matches against the event fields.

```json
// Sample EC2 event (what EventBridge receives)
{
  "version": "0",
  "id": "12345678-1234-1234-1234-123456789012",
  "detail-type": "EC2 Instance State-change Notification",
  "source": "aws.ec2",
  "account": "123456789012",
  "time": "2025-01-15T12:00:00Z",
  "region": "us-east-1",
  "resources": ["arn:aws:ec2:us-east-1:123456789012:instance/i-abc123"],
  "detail": {
    "instance-id": "i-abc123",
    "state": "stopped"
  }
}
```

```json
// Pattern: match ANY EC2 event
{ "source": ["aws.ec2"] }

// Pattern: match specific state changes
{
  "source": ["aws.ec2"],
  "detail-type": ["EC2 Instance State-change Notification"],
  "detail": {
    "state": ["stopping", "stopped", "terminated"]     // OR logic within array
  }
}

// Pattern: match S3 object creation in specific bucket
{
  "source": ["aws.s3"],
  "detail-type": ["Object Created"],
  "detail": {
    "bucket": { "name": ["my-uploads-bucket"] },
    "object": { "key": [{ "prefix": "images/" }] }     // key starts with "images/"
  }
}

// Pattern: match Auto Scaling events
{
  "source": ["aws.autoscaling"],
  "detail-type": ["EC2 Instance Launch Successful", "EC2 Instance Terminate Successful"]
}

// Pattern: match IAM console sign-in events
{
  "source": ["aws.signin"],
  "detail-type": ["AWS Console Sign In via CloudTrail"],
  "detail": {
    "responseElements": {
      "ConsoleLogin": ["Success"]
    }
  }
}

// Pattern: match custom application events
{
  "source": ["myapp.orders"],
  "detail-type": ["Order Created"],
  "detail": {
    "amount": [{ "numeric": [">=", 1000] }],            // orders >= $1000
    "priority": ["high"]
  }
}

// Advanced pattern operators:
//   "prefix"    → { "prefix": "prod-" }          matches strings starting with "prod-"
//   "suffix"    → { "suffix": ".png" }            matches strings ending with ".png"
//   "numeric"   → { "numeric": [">", 100] }       numeric comparisons
//   "exists"    → { "exists": true }               field must exist
//   "anything-but" → { "anything-but": ["test"] }  match anything except "test"
//   "cidr"      → { "cidr": "10.0.0.0/8" }        match IP ranges
```

### 6.3 Scheduled Events (Cron)

EventBridge supports cron expressions and rate expressions for periodic triggers — replacing the need for dedicated cron servers.

```bash
# Rate expression: run every 5 minutes
aws events put-rule \
  --name "Every5Minutes" \
  --schedule-expression "rate(5 minutes)" \
  --state ENABLED

# Rate expression: run every 1 hour
aws events put-rule \
  --name "Hourly" \
  --schedule-expression "rate(1 hour)" \
  --state ENABLED

# Cron expression: run at 8 AM UTC every weekday
aws events put-rule \
  --name "WeekdayMorning" \
  --schedule-expression "cron(0 8 ? * MON-FRI *)" \
  --state ENABLED

# Cron expression: run at midnight on the 1st of every month
aws events put-rule \
  --name "MonthlyMidnight" \
  --schedule-expression "cron(0 0 1 * ? *)" \
  --state ENABLED

# Cron format: cron(Minutes Hours Day-of-month Month Day-of-week Year)
# Fields:     min(0-59)  hr(0-23) dom(1-31)  mon(1-12) dow(SUN-SAT) yr(*)
# Special:    * = all, ? = no specific value (required for dom OR dow)
#             L = last, W = weekday, # = nth day (e.g., 3#2 = 2nd Wednesday)

# Add Lambda target to the schedule
aws events put-targets \
  --rule "Every5Minutes" \
  --targets '[{
    "Id": "HealthCheckLambda",
    "Arn": "arn:aws:lambda:us-east-1:123456789012:function:health-check",
    "Input": "{\"type\": \"scheduled\", \"source\": \"EventBridge\"}"
  }]'
```

**Real-world examples:**

```bash
# Nightly database backup at 2 AM UTC
cron(0 2 * * ? *)     # → triggers Lambda that starts RDS snapshot

# Scale up ASG on weekday mornings (9 AM EST = 14:00 UTC)
cron(0 14 ? * MON-FRI *)

# Clean up temporary S3 objects every Sunday at midnight
cron(0 0 ? * SUN *)

# Generate weekly reports every Monday at 6 AM UTC
cron(0 6 ? * MON *)

# Run every 15 minutes during business hours (9 AM - 5 PM UTC, weekdays)
# → Not possible with a single cron; use rate(15 minutes) + Lambda logic to check time
```

---

## 7. CloudWatch Agent

The CloudWatch Agent is a lightweight daemon you install on EC2 instances (or on-premises servers) to collect OS-level metrics and application logs that are not available through default CloudWatch monitoring.

### 7.1 Installing and Configuring

The agent is installed via Systems Manager (SSM), a package manager, or manually. Configuration is done via a JSON file.

```bash
# Install CloudWatch Agent on Amazon Linux 2 / AL2023
sudo yum install -y amazon-cloudwatch-agent

# Install on Ubuntu/Debian
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Install via SSM (recommended for fleet management)
aws ssm send-command \
  --document-name "AWS-ConfigureAWSPackage" \
  --parameters '{"action":["Install"],"name":["AmazonCloudWatchAgent"]}' \
  --targets "Key=tag:Environment,Values=Production"

# Run the configuration wizard (interactive — generates config JSON)
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# Start the agent with a config file
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \                                    # mode: ec2 or onPremise
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
  -s                                           # start the agent

# Check agent status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a status

# Store config in SSM Parameter Store (for fleet-wide deployment)
aws ssm put-parameter \
  --name "AmazonCloudWatch-linux-config" \
  --type "String" \
  --value file://cloudwatch-agent-config.json

# Start agent using SSM Parameter Store config
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c ssm:AmazonCloudWatch-linux-config \
  -s
```

**IAM Role required:** The EC2 instance must have the `CloudWatchAgentServerPolicy` managed policy attached to its IAM role.

### 7.2 Collecting System Metrics

The agent configuration file defines which OS-level metrics to collect — memory, disk, CPU (detailed), network, processes, etc.

```json
// /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 60,         // collect every 60 seconds
    "run_as_user": "cwagent",
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
  },
  "metrics": {
    "namespace": "CWAgent",                    // custom namespace (default: CWAgent)
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}",       // auto-populated EC2 instance ID
      "InstanceType": "${aws:InstanceType}",
      "AutoScalingGroupName": "${aws:AutoScalingGroupName}"
    },
    "aggregation_dimensions": [
      ["InstanceId"],
      ["AutoScalingGroupName"]                 // aggregate metrics per ASG
    ],
    "metrics_collected": {
      "mem": {                                 // MEMORY — not available by default!
        "measurement": [
          "mem_used_percent",                  // percentage of memory in use
          "mem_available_percent",
          "mem_used",
          "mem_total"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {                                // DISK — not available by default!
        "measurement": [
          "disk_used_percent",
          "disk_free",
          "disk_used",
          "disk_total"
        ],
        "resources": ["/", "/data"],           // which mount points to monitor
        "ignore_file_system_types": [
          "sysfs", "devtmpfs", "tmpfs"         // skip virtual filesystems
        ],
        "metrics_collection_interval": 60
      },
      "cpu": {                                 // DETAILED CPU (per-core, idle, iowait, etc.)
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_user",
          "cpu_usage_system",
          "cpu_usage_iowait"
        ],
        "totalcpu": true,                      // aggregate across all cores
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": [
          "tcp_established",
          "tcp_time_wait"
        ],
        "metrics_collection_interval": 60
      },
      "processes": {
        "measurement": [
          "running",
          "sleeping",
          "zombie"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
```

### 7.3 Collecting Application Logs

The agent can tail log files from your application and stream them to CloudWatch Logs in real-time.

```json
// Add "logs" section to the agent config
{
  "agent": { "...": "..." },
  "metrics": { "...": "..." },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/myapp/application.log",
            "log_group_name": "/myapp/production/application",
            "log_stream_name": "{instance_id}/application",    // dynamic — uses EC2 instance ID
            "timezone": "UTC",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S%z",        // parse timestamps from log lines
            "multi_line_start_pattern": "^\\d{4}-\\d{2}-\\d{2}",  // group stack traces with their error
            "retention_in_days": 30                             // auto-set retention on log group
          },
          {
            "file_path": "/var/log/myapp/error.log",
            "log_group_name": "/myapp/production/errors",
            "log_stream_name": "{instance_id}/errors",
            "retention_in_days": 90
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/myapp/production/nginx-access",
            "log_stream_name": "{instance_id}/nginx-access",
            "retention_in_days": 14
          },
          {
            "file_path": "/var/log/syslog",
            "log_group_name": "/myapp/production/syslog",
            "log_stream_name": "{instance_id}/syslog",
            "retention_in_days": 7
          }
        ]
      }
    },
    "log_stream_name": "default-stream",                // fallback stream name
    "force_flush_interval": 5                            // flush logs every 5 seconds
  }
}
```

**Complete config example combining metrics + logs:**

```bash
# Validate agent config before applying
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# View agent log for troubleshooting
tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

# Stop the agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop

# Restart the agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json -s
```

---

## 8. CloudTrail

### 8.1 What is CloudTrail?

AWS CloudTrail records **API calls** made in your AWS account — every action taken through the console, CLI, SDK, or by AWS services on your behalf. It answers the question: **"Who did what, when, and from where?"**

```
CloudTrail records:
  WHO    → IAM user/role (userIdentity)
  WHAT   → API action (eventName: RunInstances, PutObject, DeleteBucket)
  WHEN   → Timestamp (eventTime)
  WHERE  → Source IP address (sourceIPAddress), AWS region
  HOW    → Console, CLI, SDK, or AWS service (userAgent)

Example CloudTrail event:
{
  "eventVersion": "1.08",
  "userIdentity": {
    "type": "IAMUser",
    "userName": "alice",
    "arn": "arn:aws:iam::123456789012:user/alice",
    "accountId": "123456789012"
  },
  "eventTime": "2025-01-15T14:30:00Z",
  "eventSource": "ec2.amazonaws.com",
  "eventName": "TerminateInstances",           // ← WHAT action was taken
  "awsRegion": "us-east-1",
  "sourceIPAddress": "203.0.113.50",           // ← WHERE (caller IP)
  "userAgent": "aws-cli/2.13.0",              // ← HOW (CLI)
  "requestParameters": {
    "instancesSet": { "items": [{ "instanceId": "i-abc123" }] }
  },
  "responseElements": {
    "instancesSet": { "items": [{ "currentState": { "name": "shutting-down" } }] }
  }
}
```

Key facts for interviews:
- **Event history:** Free, 90-day lookup of management events in the console
- **Trails:** Required for long-term storage (S3) and advanced features
- **Delivery delay:** Events typically appear within 15 minutes
- **CloudTrail is NOT real-time** — use CloudWatch Events/EventBridge for real-time reactions

### 8.2 Management Events vs Data Events

CloudTrail categorizes API calls into management events and data events. This distinction affects what is logged by default and the cost.

```
Management Events (Control Plane):
  - Actions that manage/configure AWS resources
  - Logged by DEFAULT (free with event history)
  - Examples:
    - CreateBucket, DeleteBucket
    - RunInstances, TerminateInstances
    - CreateUser, AttachRolePolicy
    - CreateStack, UpdateStack
    - CreateFunction, UpdateFunctionCode

Data Events (Data Plane):
  - Actions that operate ON the data within resources
  - NOT logged by default (extra cost: $0.10 per 100,000 events)
  - High volume — can be expensive
  - Examples:
    - S3: GetObject, PutObject, DeleteObject
    - Lambda: Invoke
    - DynamoDB: GetItem, PutItem, Query

Insights Events:
  - CloudTrail Insights detects unusual API activity
  - Identifies anomalies in write management events
  - Example: spike in TerminateInstances calls
  - Extra cost: $0.35 per 100,000 events analyzed
```

### 8.3 Trail Configuration

A trail captures CloudTrail events and delivers them to an S3 bucket (and optionally to CloudWatch Logs).

```bash
# Create a trail that logs to S3 (all regions)
aws cloudtrail create-trail \
  --name "my-org-trail" \
  --s3-bucket-name "my-cloudtrail-logs-bucket" \
  --s3-key-prefix "cloudtrail" \
  --is-multi-region-trail \                    # capture events from ALL regions
  --include-global-service-events \            # IAM, STS, CloudFront (global services)
  --enable-log-file-validation                 # digest files for integrity verification

# Start logging (trail is created in a stopped state)
aws cloudtrail start-logging --name "my-org-trail"

# Enable data events for S3 (all buckets)
aws cloudtrail put-event-selectors \
  --trail-name "my-org-trail" \
  --event-selectors '[
    {
      "ReadWriteType": "All",
      "IncludeManagementEvents": true,
      "DataResources": [
        {
          "Type": "AWS::S3::Object",
          "Values": ["arn:aws:s3"]             // all S3 buckets
        }
      ]
    }
  ]'

# Enable data events for specific Lambda functions only
aws cloudtrail put-event-selectors \
  --trail-name "my-org-trail" \
  --event-selectors '[
    {
      "ReadWriteType": "WriteOnly",
      "IncludeManagementEvents": true,
      "DataResources": [
        {
          "Type": "AWS::Lambda::Function",
          "Values": [
            "arn:aws:lambda:us-east-1:123456789012:function:my-critical-function"
          ]
        }
      ]
    }
  ]'

# Look up recent events (last 90 days, management events only)
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=TerminateInstances \
  --start-time "2025-01-01T00:00:00Z" \
  --end-time "2025-01-15T23:59:59Z"

# Get trail status
aws cloudtrail get-trail-status --name "my-org-trail"
```

**S3 bucket policy required for CloudTrail delivery:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AWSCloudTrailAclCheck",
      "Effect": "Allow",
      "Principal": { "Service": "cloudtrail.amazonaws.com" },
      "Action": "s3:GetBucketAcl",
      "Resource": "arn:aws:s3:::my-cloudtrail-logs-bucket"
    },
    {
      "Sid": "AWSCloudTrailWrite",
      "Effect": "Allow",
      "Principal": { "Service": "cloudtrail.amazonaws.com" },
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::my-cloudtrail-logs-bucket/cloudtrail/AWSLogs/123456789012/*",
      "Condition": {
        "StringEquals": { "s3:x-amz-acl": "bucket-owner-full-control" }
      }
    }
  ]
}
```

### 8.4 CloudTrail + CloudWatch Integration

By sending CloudTrail events to CloudWatch Logs, you can create metric filters and alarms on API activity — enabling real-time security monitoring.

```bash
# Configure trail to deliver events to CloudWatch Logs
aws cloudtrail update-trail \
  --name "my-org-trail" \
  --cloud-watch-logs-log-group-arn "arn:aws:logs:us-east-1:123456789012:log-group:CloudTrail/DefaultLogGroup:*" \
  --cloud-watch-logs-role-arn "arn:aws:iam::123456789012:role/CloudTrail_CloudWatchLogs_Role"
```

**Security monitoring with metric filters on CloudTrail logs:**

```bash
# Alert on root account usage (security critical)
aws logs put-metric-filter \
  --log-group-name "CloudTrail/DefaultLogGroup" \
  --filter-name "RootAccountUsage" \
  --filter-pattern '{ $.userIdentity.type = "Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType != "AwsServiceEvent" }' \
  --metric-transformations '[{
    "metricNamespace": "CloudTrailMetrics",
    "metricName": "RootAccountUsageCount",
    "metricValue": "1",
    "defaultValue": 0
  }]'

# Alert on unauthorized API calls (AccessDenied)
aws logs put-metric-filter \
  --log-group-name "CloudTrail/DefaultLogGroup" \
  --filter-name "UnauthorizedAPICalls" \
  --filter-pattern '{ ($.errorCode = "*UnauthorizedAccess*") || ($.errorCode = "AccessDenied*") }' \
  --metric-transformations '[{
    "metricNamespace": "CloudTrailMetrics",
    "metricName": "UnauthorizedAPICallCount",
    "metricValue": "1",
    "defaultValue": 0
  }]'

# Alert on security group changes
aws logs put-metric-filter \
  --log-group-name "CloudTrail/DefaultLogGroup" \
  --filter-name "SecurityGroupChanges" \
  --filter-pattern '{ ($.eventName = "AuthorizeSecurityGroupIngress") || ($.eventName = "RevokeSecurityGroupIngress") || ($.eventName = "CreateSecurityGroup") || ($.eventName = "DeleteSecurityGroup") }' \
  --metric-transformations '[{
    "metricNamespace": "CloudTrailMetrics",
    "metricName": "SecurityGroupChangeCount",
    "metricValue": "1",
    "defaultValue": 0
  }]'

# Alert on console sign-in failures
aws logs put-metric-filter \
  --log-group-name "CloudTrail/DefaultLogGroup" \
  --filter-name "ConsoleSignInFailures" \
  --filter-pattern '{ ($.eventName = "ConsoleLogin") && ($.errorMessage = "Failed authentication") }' \
  --metric-transformations '[{
    "metricNamespace": "CloudTrailMetrics",
    "metricName": "ConsoleSignInFailureCount",
    "metricValue": "1",
    "defaultValue": 0
  }]'

# Create alarm on root account usage
aws cloudwatch put-metric-alarm \
  --alarm-name "RootAccountUsage" \
  --namespace "CloudTrailMetrics" \
  --metric-name "RootAccountUsageCount" \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:SecurityAlerts" \
  --treat-missing-data notBreaching
```

---

## 9. AWS X-Ray

### 9.1 Distributed Tracing

AWS X-Ray provides end-to-end tracing for distributed applications. It tracks a request as it flows through multiple services (API Gateway -> Lambda -> DynamoDB -> SNS), showing latency, errors, and dependencies at each hop.

```
What X-Ray does:
  - Traces requests across microservices
  - Visualizes service dependencies (service map)
  - Identifies performance bottlenecks
  - Pinpoints errors and their root causes
  - Measures latency distributions

X-Ray Concepts:
┌─────────────────────────────────────────────────────────┐
│ Trace: The complete journey of a request through        │
│        all services (identified by a unique Trace ID)   │
│                                                         │
│ Segment: A unit of work done by a single service        │
│          (e.g., Lambda function processing)              │
│                                                         │
│ Subsegment: A more granular unit within a segment       │
│             (e.g., a DynamoDB call within Lambda)        │
│                                                         │
│ Annotations: Key-value pairs for FILTERING traces       │
│              (indexed, searchable — e.g., userId=123)   │
│                                                         │
│ Metadata: Key-value pairs for ADDITIONAL data           │
│           (NOT indexed, NOT searchable — e.g., payload) │
└─────────────────────────────────────────────────────────┘

Example Trace:
  Trace ID: 1-5e3162f0-1234567890abcdef12345678
  ├── Segment: API Gateway (12ms)
  ├── Segment: Lambda function (250ms)
  │     ├── Subsegment: DynamoDB GetItem (45ms)
  │     ├── Subsegment: External HTTP call (120ms)
  │     └── Subsegment: SNS Publish (30ms)
  └── Segment: SNS → SQS → Lambda (processing subscriber)
```

```
Sampling Rules (controls cost):
  - X-Ray does NOT trace every request (that would be too expensive)
  - Default: trace first request per second + 5% of additional requests
  - Custom sampling rules: increase/decrease sampling per URL, method, etc.

  Reservoir: 1       ← guaranteed 1 trace per second
  Rate: 0.05         ← 5% of additional requests
```

### 9.2 X-Ray SDK Integration

Instrument your application with the X-Ray SDK to capture traces. The SDK automatically traces AWS SDK calls, HTTP calls, and SQL queries.

```javascript
// Node.js X-Ray SDK integration

// 1. Install: npm install aws-xray-sdk

// 2. Instrument the AWS SDK (captures all AWS service calls)
const AWSXRay = require("aws-xray-sdk");
const AWS = AWSXRay.captureAWS(require("aws-sdk"));   // wraps ALL AWS SDK calls

// Now any DynamoDB, S3, SNS, etc. calls are automatically traced
const dynamodb = new AWS.DynamoDB.DocumentClient();
await dynamodb.get({                                    // ← auto-traced as subsegment
  TableName: "orders",
  Key: { id: "order-123" }
}).promise();

// 3. Instrument outgoing HTTP calls
const http = AWSXRay.captureHTTPs(require("http"));    // wraps http module
const https = AWSXRay.captureHTTPs(require("https"));  // wraps https module
// Now all http.get(), https.request() are auto-traced

// 4. Instrument Express.js
const express = require("express");
const app = express();

app.use(AWSXRay.express.openSegment("MyApp"));        // start segment
// ... all your routes here ...
app.use(AWSXRay.express.closeSegment());               // close segment

// 5. Create custom subsegments for business logic
app.get("/api/orders/:id", async (req, res) => {
  const segment = AWSXRay.getSegment();

  // Add annotation (indexed, searchable in X-Ray console)
  segment.addAnnotation("orderId", req.params.id);
  segment.addAnnotation("userId", req.user.id);

  // Add metadata (not indexed, for detailed debugging)
  segment.addMetadata("requestBody", req.body);

  // Custom subsegment for your own code
  const subsegment = segment.addNewSubsegment("ProcessOrder");
  try {
    const result = await processOrder(req.params.id);
    subsegment.close();
    res.json(result);
  } catch (error) {
    subsegment.addError(error);                        // record error in trace
    subsegment.close();
    res.status(500).json({ error: "Internal error" });
  }
});
```

```python
# Python X-Ray SDK integration
# pip install aws-xray-sdk

from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all

# Patch all supported libraries (boto3, requests, sqlite3, etc.)
patch_all()

# Or patch specific libraries
# from aws_xray_sdk.core import patch
# patch(['boto3', 'requests'])

# Lambda function with X-Ray (auto-instrumented when enabled)
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('orders')

def lambda_handler(event, context):
    # Add annotation for filtering traces
    subsegment = xray_recorder.current_subsegment()
    subsegment.put_annotation("order_id", event["order_id"])

    # This DynamoDB call is automatically traced
    response = table.get_item(Key={"id": event["order_id"]})
    return response["Item"]
```

```bash
# Enable X-Ray tracing on Lambda (via CLI)
aws lambda update-function-configuration \
  --function-name my-function \
  --tracing-config Mode=Active                # Active = Lambda samples traces
                                               # PassThrough = only if upstream sends trace header

# Enable X-Ray tracing on API Gateway
aws apigateway update-stage \
  --rest-api-id abc123 \
  --stage-name prod \
  --patch-operations '[{
    "op": "replace",
    "path": "/tracingEnabled",
    "value": "true"
  }]'

# Enable X-Ray for ECS task (add daemon sidecar container)
# In task definition, add X-Ray daemon container alongside your app container
```

### 9.3 Service Maps

X-Ray automatically generates a visual service map showing all services in your architecture, their connections, latency, and error rates. No configuration needed — it builds the map from trace data.

```
Service Map Example (visual in X-Ray console):

  [Client] ──► [API Gateway] ──► [Lambda: OrderAPI]
                    │                    │
                    │                    ├──► [DynamoDB: orders]
                    │                    ├──► [SQS: order-queue]
                    │                    └──► [SNS: notifications]
                    │
                    └──► [Lambda: AuthFunction]
                              │
                              └──► [Cognito]

Each node shows:
  - Average latency
  - Request rate (requests/sec)
  - Error rate (% of 5xx)
  - Fault rate (% of 4xx)
  - Color coding: Green (healthy), Yellow (errors), Red (faults)
```

```bash
# Get service graph (programmatic access to service map data)
aws xray get-service-graph \
  --start-time "2025-01-15T00:00:00Z" \
  --end-time "2025-01-15T12:00:00Z"

# Get trace summaries (list of traces matching filter)
aws xray get-trace-summaries \
  --start-time "2025-01-15T00:00:00Z" \
  --end-time "2025-01-15T12:00:00Z" \
  --filter-expression 'service("OrderAPI") AND responsetime > 2'
  # Filter expressions:
  #   service("name")                 → traces involving this service
  #   responsetime > 2                → requests taking > 2 seconds
  #   error = true                    → traces with errors
  #   fault = true                    → traces with 5xx errors
  #   annotation.orderId = "123"      → filter by custom annotation
  #   http.url CONTAINS "/api/orders" → URL pattern match
```

### 9.4 Trace Analysis

X-Ray allows you to analyze traces to find performance bottlenecks, error patterns, and service dependencies.

```bash
# Get full trace details (all segments and subsegments)
aws xray batch-get-traces \
  --trace-ids "1-5e3162f0-1234567890abcdef12345678"

# Get trace summaries with filtering
aws xray get-trace-summaries \
  --start-time "2025-01-15T00:00:00Z" \
  --end-time "2025-01-15T12:00:00Z" \
  --filter-expression 'annotation.userId = "user-456" AND responsetime > 1'

# Create a sampling rule (control what gets traced)
aws xray create-sampling-rule \
  --sampling-rule '{
    "RuleName": "HighValueOrders",
    "Priority": 100,
    "FixedRate": 1.0,
    "ReservoirSize": 10,
    "ServiceName": "OrderService",
    "ServiceType": "*",
    "Host": "*",
    "ResourceARN": "*",
    "HTTPMethod": "POST",
    "URLPath": "/api/orders",
    "Version": 1
  }'
  # This rule traces 100% of POST /api/orders requests (10 per second guaranteed)

# Create a group for filtered traces (logical grouping)
aws xray create-group \
  --group-name "SlowRequests" \
  --filter-expression "responsetime > 3"
  # Groups appear in X-Ray console as separate views
  # Can also create CloudWatch metrics per group
```

**Common analysis patterns:**

```
1. Find slow endpoints:
   Filter: responsetime > 2
   Group by: http.url
   → Identify which API endpoints are slowest

2. Error investigation:
   Filter: fault = true AND service("OrderService")
   → Drill into each trace to see which subsegment failed

3. Cold start impact (Lambda):
   Filter: annotation.coldStart = true
   Compare with: annotation.coldStart = false
   → Measure latency difference

4. Downstream dependency issues:
   Look at service map for red/yellow nodes
   → Identifies if DynamoDB, external API, etc. is the bottleneck

5. User experience tracking:
   Filter: annotation.userId = "user-123"
   → See all requests from one user to debug their specific issue
```

---

## 10. Monitoring Best Practices

### 10.1 What to Monitor per Service

Each AWS service has critical metrics that indicate health and performance. Here is what to monitor for the most common services.

```
EC2 Instances:
┌──────────────────────────┬──────────────────────────────────────┐
│ Metric                   │ Why It Matters                       │
├──────────────────────────┼──────────────────────────────────────┤
│ CPUUtilization           │ High CPU = underprovisioned or issue │
│ StatusCheckFailed        │ Instance or system is unreachable    │
│ mem_used_percent *       │ Memory leak detection                │
│ disk_used_percent *      │ Prevent disk-full outages            │
│ NetworkIn/Out            │ Traffic spikes, potential DDoS       │
└──────────────────────────┴──────────────────────────────────────┘
  * requires CloudWatch Agent

RDS / Aurora:
┌──────────────────────────┬──────────────────────────────────────┐
│ CPUUtilization           │ Query optimization needed            │
│ FreeableMemory           │ Memory pressure                      │
│ DatabaseConnections      │ Connection pool exhaustion            │
│ ReadIOPS / WriteIOPS     │ I/O bottlenecks                      │
│ FreeStorageSpace         │ Prevent storage-full crashes          │
│ ReplicaLag               │ Read replica is behind                │
│ AuroraReplicaLagMaximum  │ Aurora failover risk                  │
└──────────────────────────┴──────────────────────────────────────┘

Lambda:
┌──────────────────────────┬──────────────────────────────────────┐
│ Errors                   │ Function failures                     │
│ Duration                 │ Performance / timeout risk            │
│ Throttles                │ Hitting concurrency limits             │
│ ConcurrentExecutions     │ Scaling behavior                      │
│ IteratorAge (streams)    │ Processing lag (Kinesis/DynamoDB)     │
└──────────────────────────┴──────────────────────────────────────┘

ALB / API Gateway:
┌──────────────────────────┬──────────────────────────────────────┐
│ HTTPCode_Target_5XX      │ Backend errors                        │
│ HTTPCode_ELB_5XX         │ Load balancer errors                  │
│ TargetResponseTime       │ Latency (user experience)             │
│ RequestCount             │ Traffic volume / patterns              │
│ UnhealthyHostCount       │ Backend instances failing health check│
│ 4XXError / 5XXError (APIGW)│ API error rates                     │
│ Latency / IntegrationLatency│ Where time is spent                │
└──────────────────────────┴──────────────────────────────────────┘

DynamoDB:
┌──────────────────────────┬──────────────────────────────────────┐
│ ConsumedReadCapacity     │ Approaching provisioned limit         │
│ ConsumedWriteCapacity    │ Approaching provisioned limit         │
│ ThrottledRequests        │ Capacity exceeded (critical!)         │
│ SuccessfulRequestLatency │ Performance monitoring                │
│ SystemErrors             │ DynamoDB internal issues              │
└──────────────────────────┴──────────────────────────────────────┘

SQS:
┌──────────────────────────┬──────────────────────────────────────┐
│ ApproximateNumberOfMessages│ Queue depth / backlog               │
│ ApproximateAgeOfOldestMessage│ Processing delay                  │
│ NumberOfMessagesSent     │ Throughput                            │
│ NumberOfMessagesDeleted  │ Processing rate                       │
└──────────────────────────┴──────────────────────────────────────┘
```

### 10.2 Setting Meaningful Alarms

Avoid alarm fatigue by setting thresholds that reflect real problems, not normal fluctuations.

```
Principles:
  1. Alarm on SYMPTOMS, not causes
     Bad:  CPU > 80%                    ← CPU spikes may be normal during deployments
     Good: Error rate > 5% AND latency p99 > 3s  ← users are actually impacted

  2. Use multiple evaluation periods
     Bad:  CPU > 80% for 1 period      ← triggers on brief spikes
     Good: CPU > 80% for 3 consecutive 5-min periods  ← sustained problem

  3. Use composite alarms to reduce noise
     Bad:  3 separate alarms fire at once → 3 PagerDuty pages
     Good: Composite alarm fires when CPU AND Memory AND Errors are all high → 1 page

  4. Set OK actions too
     → Notify when the alarm recovers (auto-close PagerDuty incident)

  5. Use anomaly detection alarms for unpredictable baselines
     → CloudWatch learns normal patterns and alerts on deviations
```

```bash
# Anomaly detection alarm (CloudWatch learns normal patterns)
aws cloudwatch put-metric-alarm \
  --alarm-name "AnomalousAPILatency" \
  --metrics '[
    {
      "Id": "m1",
      "MetricStat": {
        "Metric": {
          "Namespace": "AWS/ApplicationELB",
          "MetricName": "TargetResponseTime",
          "Dimensions": [
            { "Name": "LoadBalancer", "Value": "app/my-alb/123" }
          ]
        },
        "Period": 300,
        "Stat": "Average"
      },
      "ReturnData": true
    },
    {
      "Id": "ad1",
      "Expression": "ANOMALY_DETECTION_BAND(m1, 2)",
      "Label": "Expected Range",
      "ReturnData": false
    }
  ]' \
  --evaluation-periods 3 \
  --threshold-metric-id "ad1" \
  --comparison-operator GreaterThanUpperThreshold \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertsTopic"

# Recommended alarm thresholds (starting points):
#
# EC2 CPU:              > 80% for 15 min (3 x 5min periods)
# EC2 StatusCheck:      >= 1 for 5 min (2 x 1min periods) → auto-recover action
# RDS CPU:              > 90% for 15 min
# RDS FreeStorage:      < 2 GB (absolute, not percentage)
# RDS Connections:      > 80% of max (varies by instance type)
# Lambda Errors:        > 1% of invocations
# Lambda Duration:      > 80% of timeout setting
# Lambda Throttles:     > 0 (any throttling is a problem)
# ALB 5XX:              > 1% of total requests
# ALB TargetResponseTime: > 2s p99
# DynamoDB Throttles:   > 0
# SQS OldestMessage:    > 300 seconds (processing falling behind)
```

### 10.3 Cost Optimization

CloudWatch costs can grow quickly if not managed. Here are strategies to keep monitoring effective and affordable.

```
Cost Drivers (ranked):
  1. Log ingestion ($0.50/GB)         ← usually the biggest cost
  2. Log storage ($0.03/GB/month)     ← compounds over time
  3. Custom metrics ($0.30/metric/month) ← each dimension combo = separate metric
  4. Dashboards ($3.00/dashboard/month after first 3)
  5. Alarms ($0.10/alarm/month)
  6. Log Insights ($0.005/GB scanned)

Cost Optimization Strategies:

  1. LOG RETENTION — set retention policies on every log group
     → 7 days for dev, 30 days for prod, export to S3 for long-term

  2. LOG LEVEL — don't log DEBUG in production
     → Use environment variables to control log level
     → Structured JSON logging lets you filter more efficiently

  3. METRIC DIMENSIONS — don't over-dimension custom metrics
     → 10 dimensions x 5 values each = 50 unique metrics = $15/month
     → Only add dimensions you actually filter by

  4. SAMPLING — use X-Ray sampling rules to control trace volume
     → Default 5% is usually fine; increase only for critical paths

  5. LOG FILTERING — use subscription filters to ship only relevant logs
     → Don't stream ALL logs to third-party tools; filter first

  6. EMBEDDED METRIC FORMAT — publish metrics from logs (no put-metric-data cost)
     → Log structured JSON with metric data; CloudWatch extracts it automatically

  7. CONTRIBUTOR INSIGHTS — disable if not using ($0.02/rule/month)

  8. DASHBOARD CONSOLIDATION — keep under 3 dashboards when possible (free tier)
```

```javascript
// Embedded Metric Format (EMF) — publish metrics via log lines (free metric ingestion)
// Works in Lambda without any SDK — just log in the right format

// Node.js Lambda example using EMF
const metrics = {
  "_aws": {
    "Timestamp": Date.now(),
    "CloudWatchMetrics": [
      {
        "Namespace": "MyApp/Production",
        "Dimensions": [["Service", "Environment"]],
        "Metrics": [
          { "Name": "ProcessingTime", "Unit": "Milliseconds" },
          { "Name": "OrderValue", "Unit": "None" }
        ]
      }
    ]
  },
  "Service": "OrderService",
  "Environment": "Production",
  "ProcessingTime": 234,          // ← extracted as a CloudWatch metric
  "OrderValue": 49.99,            // ← extracted as a CloudWatch metric
  "orderId": "order-123",         // ← stays as log data only (not a metric)
  "message": "Order processed"
};

// Just console.log it — CloudWatch extracts the metrics automatically!
console.log(JSON.stringify(metrics));
// Result: zero cost for put-metric-data API calls, metric appears in CloudWatch
```

---

## 11. Interview Questions & Answers

### Beginner

---

**Q1: What is Amazon CloudWatch and what are its main components?**

Amazon CloudWatch is AWS's native monitoring and observability service. Its main components are:
1. **Metrics** — time-series data points (CPU, memory, request count, custom business metrics)
2. **Alarms** — watch metrics and trigger actions when thresholds are breached
3. **Logs** — centralized log ingestion, storage, and analysis
4. **Dashboards** — visual displays of metrics and logs
5. **Events/EventBridge** — react to AWS resource state changes and scheduled tasks

CloudWatch integrates automatically with most AWS services, collecting default metrics without any configuration.

---

**Q2: What is the difference between basic monitoring and detailed monitoring for EC2?**

- **Basic monitoring** (free, default): Metrics are published at **5-minute intervals**. Covers standard metrics like CPUUtilization, NetworkIn/Out, DiskReadOps.
- **Detailed monitoring** (paid, $0.30/metric/month): Metrics are published at **1-minute intervals**. Enables more responsive alarms and more granular data. You enable it per-instance with `aws ec2 monitor-instances`.

Important: Neither basic nor detailed monitoring provides memory or disk usage metrics. Those require the CloudWatch Agent.

---

**Q3: Why can't you see memory utilization in CloudWatch for EC2 by default?**

CloudWatch collects metrics by querying the hypervisor (the virtualization layer that manages EC2 instances). The hypervisor can see CPU utilization, network traffic, and disk I/O — but it **cannot see inside the operating system**. Memory usage and disk space are OS-level metrics. To collect them, you must install the **CloudWatch Agent** on the instance, which runs inside the OS and publishes these metrics to CloudWatch.

---

**Q4: What are the three states of a CloudWatch alarm?**

1. **OK** — The metric is within the acceptable threshold range.
2. **ALARM** — The metric has breached the threshold for the required number of evaluation periods.
3. **INSUFFICIENT_DATA** — The alarm has just been created, the metric is not reporting data, or there are not enough data points to evaluate the alarm.

Each state transition can trigger actions (SNS notifications, Auto Scaling policies, EC2 actions).

---

**Q5: What is the difference between CloudWatch and CloudTrail?**

| Feature | CloudWatch | CloudTrail |
|---------|-----------|------------|
| **Purpose** | Performance monitoring | API audit logging |
| **Tracks** | Metrics, logs, events | Who did what, when, from where |
| **Example** | CPU is at 85% | User "alice" terminated instance i-abc123 at 2:30 PM |
| **Use case** | Alerting, dashboards, auto-scaling | Security auditing, compliance, forensics |
| **Data type** | Time-series metrics + application logs | API call records (JSON events) |

In short: CloudWatch tells you **how your resources are performing**; CloudTrail tells you **who changed your resources and when**.

---

**Q6: What is CloudWatch Logs Insights?**

CloudWatch Logs Insights is an interactive query service for analyzing log data stored in CloudWatch Logs. It provides a purpose-built query language that supports filtering, aggregation, sorting, and pattern matching. Key features include:
- Auto-discovery of fields in JSON-formatted logs
- SQL-like syntax (`fields`, `filter`, `stats`, `sort`, `limit`, `parse`)
- Queries can span multiple log groups
- Built-in support for Lambda REPORT lines (`@duration`, `@initDuration`, `@maxMemoryUsed`)
- Pricing is based on the amount of data scanned ($0.005/GB)

---

### Intermediate

---

**Q7: How do metric filters work, and when would you use them?**

Metric filters scan incoming CloudWatch Logs data in real-time and extract numeric values to publish as CloudWatch metrics. You define a **filter pattern** (text match or JSON field match) and a **metric transformation** (what metric to publish when a match is found).

Use cases:
- Count the number of ERROR lines in application logs and create an alarm when errors spike
- Extract request latency from JSON logs and publish it as a metric for dashboards
- Count 4xx/5xx HTTP status codes from access logs
- Track specific business events (e.g., "payment_failed") logged by your application

Important: Metric filters are NOT retroactive — they only process logs arriving after the filter is created. For historical analysis, use Logs Insights instead.

---

**Q8: Explain how composite alarms reduce alert fatigue.**

Composite alarms combine multiple child alarms using Boolean logic (AND, OR, NOT). Instead of receiving separate alerts for CPU, memory, error rate, and latency — each of which might spike independently during normal operations — a composite alarm only fires when a **meaningful combination** occurs.

Example: An e-commerce application has three alarms:
- `HighCPU` — CPU > 80%
- `HighErrorRate` — 5xx errors > 5%
- `HighLatency` — p99 latency > 3 seconds

Individually, CPU might spike during deployments (false alarm). But a composite alarm `HighCPU AND HighErrorRate AND HighLatency` only fires when all three are true simultaneously — indicating a real outage, not normal behavior. This dramatically reduces false pages to the on-call engineer.

---

**Q9: What is the difference between CloudWatch Events and Amazon EventBridge?**

Amazon EventBridge is the evolution of CloudWatch Events. They use the same underlying infrastructure and API, but EventBridge adds:

1. **Custom event buses** — CloudWatch Events only has the default bus; EventBridge supports multiple buses for different teams/domains
2. **SaaS integrations** — receive events from third-party services (Shopify, Datadog, Auth0, Zendesk)
3. **Schema registry** — auto-discovers event schemas and generates code bindings
4. **Archive and replay** — store events and replay them for debugging
5. **Cross-account event routing** — send events between AWS accounts via event buses

AWS recommends using EventBridge for all new applications. CloudWatch Events rules continue to work (they show up in both consoles) but EventBridge is the preferred service going forward.

---

**Q10: How would you set up centralized logging for a multi-account AWS organization?**

Architecture:
1. **Central logging account** (e.g., account 111111111111) — hosts the log aggregation infrastructure
2. **Source accounts** (dev, staging, prod) — send logs to the central account

Implementation steps:
1. In the central account: create a Kinesis Data Stream or Firehose delivery stream as the log destination
2. In the central account: create a CloudWatch Logs destination with an access policy allowing source accounts
3. In each source account: create subscription filters on log groups pointing to the central account's destination
4. Central account processes logs via: Firehose to S3 (archival), OpenSearch (search), or Lambda (real-time alerts)

This pattern enables: single-pane-of-glass log analysis, centralized security monitoring, compliance auditing across all accounts, and cost optimization through unified retention policies.

---

**Q11: What are X-Ray annotations vs metadata, and when would you use each?**

Both are key-value pairs attached to X-Ray trace segments, but they serve different purposes:

| Feature | Annotations | Metadata |
|---------|------------|----------|
| **Indexed** | Yes (searchable) | No |
| **Filterable** | Yes — `annotation.userId = "123"` | No |
| **Use for** | Values you need to search by | Supplementary debug data |
| **Limits** | 50 per trace | No hard limit (within segment size) |
| **Examples** | `userId`, `orderId`, `environment` | request body, response payload, config |
| **Cost** | Counts toward indexed data | No extra cost |

Rule of thumb: If you will ever need to **find traces** using this value, make it an annotation. If it is just helpful context when you are already looking at a trace, make it metadata.

---

### Advanced

---

**Q12: How would you implement a comprehensive monitoring strategy for a serverless e-commerce application (API Gateway + Lambda + DynamoDB + SQS)?**

I would implement a four-layer monitoring strategy:

**Layer 1 — Metrics and Alarms:**
- API Gateway: alarm on 5XXError rate > 1%, Latency p99 > 2s
- Lambda: alarm on Error rate > 1%, Throttles > 0, Duration > 80% of timeout
- DynamoDB: alarm on ThrottledRequests > 0, SuccessfulRequestLatency p99 > 50ms
- SQS: alarm on ApproximateAgeOfOldestMessage > 300s (processing lag)
- Custom business metrics (EMF): OrdersPerMinute, PaymentFailureRate, CartAbandonRate
- Composite alarm: `HighLambdaErrors AND HighAPILatency` triggers PagerDuty

**Layer 2 — Logging:**
- Structured JSON logging from all Lambda functions (level, requestId, orderId, userId, latency)
- Metric filters on ERROR and WARN levels
- Log Insights saved queries for: top errors, slowest endpoints, cold start frequency
- 30-day retention in CloudWatch, export to S3 for long-term compliance

**Layer 3 — Distributed Tracing (X-Ray):**
- Enable active tracing on API Gateway and all Lambda functions
- X-Ray SDK in Lambda to trace DynamoDB and SQS calls
- Annotations: `orderId`, `userId`, `paymentMethod`
- Custom sampling: 100% for `/api/checkout` (critical path), 5% for `/api/health`
- X-Ray Groups: "SlowRequests" (responsetime > 2), "Errors" (fault = true)

**Layer 4 — Dashboard:**
- Production dashboard showing: request rate, error rate, latency (p50/p90/p99), DynamoDB consumed capacity, SQS queue depth, Lambda concurrent executions
- Alarm status widget showing all alarm states
- Log widget showing last 20 errors
- Cross-region widgets if multi-region deployment

---

**Q13: Explain CloudWatch data retention and how you would design a cost-effective long-term monitoring data strategy.**

CloudWatch retains metric data at decreasing resolution over time:
- **1-second** data points: retained for **3 hours**
- **60-second** data points: retained for **15 days**
- **5-minute** data points: retained for **63 days**
- **1-hour** data points: retained for **455 days** (15 months)

CloudWatch Logs are retained **indefinitely** by default unless a retention policy is set.

For a cost-effective strategy:

1. **Metrics:** Accept CloudWatch's built-in aggregation. For metrics you need at full resolution beyond 15 months, use `get-metric-data` to export to S3 via a scheduled Lambda function before they age out.

2. **Logs:**
   - Set retention policies: 7 days (dev), 30 days (prod), 90 days (security/audit)
   - Use subscription filters + Kinesis Firehose to stream logs to S3 in real-time for long-term archival
   - S3 storage: use Intelligent-Tiering or Glacier for logs older than 90 days
   - Use S3 Select or Athena to query archived logs when needed

3. **Reduce ingestion volume:**
   - Use log levels (ERROR/WARN in prod, not DEBUG)
   - Avoid logging request/response bodies in production
   - Use EMF for custom metrics instead of `put-metric-data` API (saves API call costs)

4. **X-Ray traces:** Retained for 30 days only. Export critical traces to S3 via `batch-get-traces` if needed for compliance.

Monthly cost estimate for a medium application:
- 50 custom metrics: $15
- 100 GB log ingestion: $50
- 100 GB log storage (30-day): $3
- 10 alarms: $1
- 3 dashboards: free
- Total: ~$69/month (vs. third-party tools at $200-500+/month)

---

**Q14: How does CloudWatch anomaly detection work, and when should you use it over static thresholds?**

CloudWatch anomaly detection uses machine learning to create a **model** of a metric's expected behavior. It analyzes 2 weeks of historical data to learn patterns — daily cycles, weekly patterns, and trends. It then creates a dynamic band (upper and lower bounds) that adjusts automatically.

How it works:
1. CloudWatch trains a model on the metric's historical data
2. The model identifies patterns (e.g., traffic peaks at 2 PM and drops at 3 AM)
3. An anomaly detection band is created with configurable width (standard deviations)
4. Alarms fire when the metric goes **outside the expected band**

When to use anomaly detection over static thresholds:
- **Variable baselines:** A metric that is 200 req/s at night and 2000 req/s at peak. A static threshold of 1500 would either: miss nighttime issues (if set high) or false-alarm during peak (if set low). Anomaly detection adapts automatically.
- **Gradual growth:** Traffic increases 10% month-over-month. Static thresholds need constant adjustment; anomaly detection learns the trend.
- **Seasonal patterns:** Black Friday, end-of-month processing spikes, etc.

When to use static thresholds:
- **Hard limits:** Disk space < 10%, database connections approaching maximum — these have absolute danger points regardless of patterns.
- **SLA targets:** Response time must never exceed 3 seconds, regardless of "normal" behavior.
- **Binary metrics:** Throttles > 0, status check failed >= 1 — these should always be zero.

---

**Q15: A production application has intermittent 504 timeout errors reported by users but your CloudWatch alarms did not fire. Walk through your debugging process.**

**Step 1: Verify alarm configuration**
- Check if the alarm exists and is evaluating the right metric. A common mistake: alarming on `HTTPCode_ELB_5XX_Count` (load balancer errors) but the 504s are coming from `HTTPCode_Target_5XX_Count` (backend errors). These are different metrics.
- Check the evaluation period. If the alarm requires 3 consecutive 5-minute periods (15 min) but the errors are intermittent bursts lasting 2 minutes, the alarm never reaches ALARM state.
- Check `treat-missing-data` setting. If set to `notBreaching` and the metric reports zero data points (not the value 0, but no data), the alarm treats gaps as healthy.

**Step 2: Investigate the metric data**
- Use `get-metric-statistics` with 1-minute granularity to see if errors are captured at all
- Check if detailed monitoring is enabled (1-min vs 5-min periods)
- The errors might be below the alarm threshold. 5 errors in 10,000 requests = 0.05% — real impact on affected users but below a 1% threshold

**Step 3: Check the logs**
- Use Log Insights to query for 504 status codes in the time range reported by users
- Look at the `TargetResponseTime` metric — 504s from ALB mean the backend did not respond within the idle timeout (default 60s)
- Check Lambda duration if backend is serverless — approaching the 29-second API Gateway timeout

**Step 4: Check X-Ray traces**
- Filter: `http.status = 504` in the affected time window
- Examine the trace waterfall — is the slow call to DynamoDB? An external API? A cold start?

**Step 5: Root cause and fix**
- Likely causes: Lambda cold starts + slow database queries combining to exceed timeout; external API dependency being slow; connection pool exhaustion
- Fix the alarm: lower the threshold, reduce evaluation periods, use anomaly detection, or create a metric math alarm on error **rate** (errors/total) rather than absolute count

---

**Q16: How would you design a monitoring solution that works across 20 AWS accounts and 4 regions?**

**Architecture: Hub-and-Spoke Model**

Monitoring Account (hub): A dedicated AWS account for centralized observability.

**1. Cross-Account Observability (CloudWatch):**
- Enable CloudWatch cross-account observability with the monitoring account as the "monitoring account" and all 20 accounts as "source accounts"
- This shares metrics, logs, and X-Ray traces automatically — the monitoring account can view all data from all source accounts without copying data
- Create cross-account dashboards in the monitoring account showing all 20 accounts

**2. Centralized Logging:**
- Each source account's log groups have subscription filters sending to a central Kinesis Data Firehose in the monitoring account
- Firehose delivers to: S3 (archival, Athena querying) and OpenSearch (real-time search)
- Alternative: Use CloudWatch cross-account log viewing (no data copy needed for ad-hoc analysis)

**3. Centralized Alarming:**
- Create alarms in the monitoring account that reference cross-account metrics
- Use composite alarms per application (spanning multiple accounts/regions)
- Route all alarms to a central SNS topic → PagerDuty/Slack integration
- Use EventBridge cross-account event routing for custom events

**4. Cross-Region Strategy:**
- Each region's data stays in that region by default (data sovereignty)
- Dashboards aggregate metrics from all 4 regions in a single view (cross-region widgets)
- For logs: replicate critical logs to a primary region using subscription filters + Firehose
- For X-Ray: use X-Ray groups per region; cross-region tracing is automatic when services call across regions

**5. Infrastructure as Code:**
- Define all monitoring resources (alarms, dashboards, metric filters, subscription filters) in CloudFormation/Terraform
- Deploy monitoring stack to all 20 accounts using CloudFormation StackSets
- Standardize: log group naming, metric namespaces, alarm naming conventions, dashboard templates

**6. Cost Management:**
- Estimated: $200-500/month for 20 accounts with moderate log volume
- Log retention: 30 days in CloudWatch, long-term in S3 Glacier
- Use EMF for custom metrics across all accounts (reduce API costs)
- Centralized dashboard reduces per-account dashboard costs

---

**Q17: How does the Embedded Metric Format (EMF) work and why is it more cost-effective than calling the PutMetricData API?**

The Embedded Metric Format (EMF) allows you to publish custom CloudWatch metrics by embedding structured JSON in your log output. CloudWatch automatically extracts the metric data from the log line — no API calls needed.

How it works:
1. Your application logs a JSON object with a special `_aws` key containing metric definitions
2. CloudWatch Logs ingests the log line (normal log ingestion cost: $0.50/GB)
3. CloudWatch automatically parses the `_aws` block and creates metrics in the specified namespace
4. The metrics appear in CloudWatch Metrics just like metrics published via `PutMetricData`

Why it is more cost-effective:
- `PutMetricData` API: Up to 1000 calls per second, but each call has API overhead and you pay for both the API call AND the metric storage
- EMF: You are already paying for log ingestion. The metric extraction is **free** — no additional `PutMetricData` API cost
- For high-cardinality metrics (e.g., latency per unique URL path), EMF is dramatically cheaper because you avoid thousands of `PutMetricData` calls
- EMF also gives you the raw log data alongside the metric, which is valuable for debugging

Limitations of EMF:
- Maximum 100 metrics per log event
- Maximum 9 dimensions per metric
- Log line must be valid JSON with the `_aws` key
- Only works when logs go to CloudWatch Logs (not if you redirect logs elsewhere)

In practice, I use EMF for all custom metrics in Lambda functions. The function already sends logs to CloudWatch, so the metrics come "for free" on top of the log ingestion cost I am already paying.

---

## References

- [AWS CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring) — Official CloudWatch documentation
- [CloudWatch Logs User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs) — Logs documentation
- [AWS X-Ray Developer Guide](https://docs.aws.amazon.com/xray/latest/devguide) — Distributed tracing documentation
