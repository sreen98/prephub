# AWS EC2 & Networking — Complete Guide

## Table of Contents

- [1. What is EC2?](#1-what-is-ec2)
- [2. Instance Types](#2-instance-types)
- [3. AMIs (Amazon Machine Images)](#3-amis-amazon-machine-images)
- [4. Instance Lifecycle](#4-instance-lifecycle)
- [5. Security Groups](#5-security-groups)
- [6. Key Pairs and SSH](#6-key-pairs-and-ssh)
- [7. EBS (Elastic Block Store)](#7-ebs-elastic-block-store)
- [8. VPC (Virtual Private Cloud)](#8-vpc-virtual-private-cloud)
- [9. Elastic Load Balancing](#9-elastic-load-balancing)
- [10. Auto Scaling](#10-auto-scaling)
- [11. Elastic IP](#11-elastic-ip)
- [12. Placement Groups](#12-placement-groups)
- [13. Pricing Models](#13-pricing-models)
- [14. Interview Questions & Answers](#14-interview-questions--answers)

---

## 1. What is EC2?

Amazon EC2 (Elastic Compute Cloud) is a web service that provides **resizable virtual servers** (instances) in the AWS cloud. You can launch instances with the OS, CPU, memory, storage, and networking configuration you need, and only pay for what you use.

Key characteristics:
- **Virtual machines** — run Linux, Windows, or macOS on AWS hardware
- **Elastic** — scale capacity up/down in minutes
- **Complete control** — root/admin access, choose instance type, storage, networking
- **Pay-as-you-go** — per-second billing (minimum 60 seconds)
- **Global** — launch in any AWS region and availability zone
- **Integrates** — with VPC, EBS, ELB, Auto Scaling, IAM, CloudWatch

### When to Use EC2

| Good for | Not ideal for |
|----------|---------------|
| Web/app servers (persistent workloads) | Short event-driven tasks (use Lambda) |
| Databases (self-managed) | Static websites (use S3 + CloudFront) |
| Batch processing / HPC | Managed databases (use RDS/Aurora) |
| Machine learning training | Container orchestration (use ECS/EKS) |
| Legacy applications | Serverless APIs (use API Gateway + Lambda) |
| Custom networking setups | |

```bash
# Launch a simple EC2 instance with the AWS CLI
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \        # Amazon Linux 2023 AMI
  --instance-type t3.micro \                  # 2 vCPU, 1 GB RAM
  --key-name my-key-pair \                    # SSH key pair name
  --security-group-ids sg-0123456789abcdef0 \ # Security group ID
  --subnet-id subnet-0123456789abcdef0 \      # Subnet to launch in
  --count 1 \                                 # Number of instances
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=my-web-server}]'
```

---

## 2. Instance Types

EC2 offers a wide range of instance types optimized for different workloads. Each type provides a specific combination of CPU, memory, storage, and networking capacity.

### 2.1 Instance Families

```
Family        | Prefix | Optimized For              | Example Use Cases
--------------+--------+----------------------------+----------------------------------
General       | t3, t4g| Balanced CPU/memory        | Web servers, dev environments,
Purpose       | m5, m6i|                            | small databases, microservices
              | m7g    |                            |
--------------+--------+----------------------------+----------------------------------
Compute       | c5, c6i| High-performance CPU       | Batch processing, gaming servers,
Optimized     | c7g    |                            | HPC, ML inference, encoding
--------------+--------+----------------------------+----------------------------------
Memory        | r5, r6i| Large in-memory datasets   | In-memory databases (Redis),
Optimized     | r7g    |                            | real-time analytics, SAP HANA
              | x2idn  |                            |
--------------+--------+----------------------------+----------------------------------
Storage       | i3, i4i| High sequential read/write | NoSQL databases (Cassandra),
Optimized     | d3, h1 |                            | data warehousing, log processing
--------------+--------+----------------------------+----------------------------------
Accelerated   | p4, p5 | GPU / custom hardware      | ML training, graphics rendering,
Computing     | g5, inf| FPGA                       | video transcoding, genomics
              | trn1   |                            |
```

### 2.2 Choosing the Right Instance

```
Decision Tree:

1. Is it burstable / variable load?
   → YES: t3 or t4g (burstable, cheapest)
   → NO: continue

2. What's the bottleneck?
   → CPU-bound:       c-family (c6i, c7g)
   → Memory-bound:    r-family (r6i, r7g) or x-family
   → Storage I/O:     i-family (i4i) or d-family
   → GPU needed:      p-family (training), g-family (graphics), inf (inference)
   → Balanced:        m-family (m6i, m7g)

3. Do you want ARM (Graviton)?
   → YES: Choose 'g' suffix (t4g, m7g, c7g, r7g) — 20% cheaper, better perf/$
   → NO: Choose Intel/AMD variant (m6i, c6a)

Real-world example:
  - Small API server, low traffic       → t3.micro   (2 vCPU, 1 GB)
  - Production web server               → m6i.large  (2 vCPU, 8 GB)
  - Video encoding pipeline             → c6i.2xlarge (8 vCPU, 16 GB)
  - Redis cache cluster                 → r6g.xlarge  (4 vCPU, 32 GB)
  - ML training with GPUs               → p4d.24xlarge (8 NVIDIA A100)
```

### 2.3 Instance Naming Convention

```
Example: m6i.2xlarge

  m    →  Family       (m = general purpose)
  6    →  Generation   (6th generation — newer is generally better)
  i    →  Processor    (i = Intel, a = AMD, g = Graviton/ARM)
  .    →  Separator
  2xlarge → Size       (determines vCPU, memory, network bandwidth)

Size ladder:
  nano → micro → small → medium → large → xlarge → 2xlarge → ... → metal

Each step roughly doubles resources:
  t3.micro    = 2 vCPU,  1 GB RAM
  t3.small    = 2 vCPU,  2 GB RAM
  t3.medium   = 2 vCPU,  4 GB RAM
  t3.large    = 2 vCPU,  8 GB RAM
  t3.xlarge   = 4 vCPU, 16 GB RAM
  t3.2xlarge  = 8 vCPU, 32 GB RAM

"metal" = bare-metal (no hypervisor), full access to host hardware
```

```bash
# List available instance types in a region
aws ec2 describe-instance-types \
  --filters "Name=instance-type,Values=t3.*" \
  --query "InstanceTypes[].{Type:InstanceType,vCPU:VCpuInfo.DefaultVCpus,MemGB:MemoryInfo.SizeInMiB}" \
  --output table

# Describe a specific instance type
aws ec2 describe-instance-types \
  --instance-types m6i.large \
  --query "InstanceTypes[0].{Type:InstanceType,vCPU:VCpuInfo.DefaultVCpus,MemMB:MemoryInfo.SizeInMiB,Network:NetworkInfo.NetworkPerformance}"
```

---

## 3. AMIs (Amazon Machine Images)

An AMI is a **template** that contains the OS, application server, and applications needed to launch an EC2 instance. Every instance is launched from an AMI — think of it as a snapshot of a configured machine.

### 3.1 Public vs Private AMIs

```
Public AMIs:
  - Provided by AWS (Amazon Linux, Ubuntu, Windows Server)
  - Provided by the community or AWS Marketplace
  - Anyone can use them
  - AWS-maintained AMIs are patched and updated regularly

Private AMIs:
  - Created by you or your organization
  - Only available in your AWS account (or shared accounts)
  - Contain your custom software, configs, security hardening
  - Can be shared with specific AWS accounts
  - Can be copied across regions

AWS Marketplace AMIs:
  - Third-party vendors (pre-configured software)
  - May have additional licensing costs
  - Examples: pre-configured WordPress, hardened CIS images
```

```bash
# Find the latest Amazon Linux 2023 AMI
aws ec2 describe-images \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023*-x86_64" \
             "Name=state,Values=available" \
  --query "Images | sort_by(@, &CreationDate) | [-1].{ID:ImageId,Name:Name}" \
  --output table

# Find the latest Ubuntu 22.04 AMI
aws ec2 describe-images \
  --owners 099720109477 \           # Canonical's AWS account ID
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
  --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
  --output text

# List your private AMIs
aws ec2 describe-images --owners self
```

### 3.2 Creating Custom AMIs

```
Why create custom AMIs:
  1. Pre-bake your application → faster instance boot time
  2. Ensure consistency → every instance starts with the same config
  3. Security hardening → bake in security patches, CIS benchmarks
  4. Golden image pattern → base AMI with org standards + app-specific AMIs

Process:
  1. Launch a base instance (e.g., Amazon Linux 2023)
  2. SSH in and install/configure software
  3. Create an AMI from the running (or stopped) instance
  4. Use the custom AMI to launch new instances
```

```bash
# Step 1: Launch a base instance and configure it
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type t3.micro \
  --key-name my-key-pair

# Step 2: SSH in and install software
ssh -i my-key-pair.pem ec2-user@<public-ip>
sudo yum update -y
sudo yum install -y nginx
sudo systemctl enable nginx
# ... install your application, configure everything

# Step 3: Create an AMI from the instance
aws ec2 create-image \
  --instance-id i-0123456789abcdef0 \
  --name "my-web-server-v1.0" \
  --description "Nginx + Node.js app preconfigured" \
  --no-reboot                              # Skip reboot (data consistency risk)

# Step 4: Launch instances from your custom AMI
aws ec2 run-instances \
  --image-id ami-0your-custom-ami-id \
  --instance-type t3.small \
  --count 3                                # Launch 3 identical servers

# Share AMI with another AWS account
aws ec2 modify-image-attribute \
  --image-id ami-0your-custom-ami-id \
  --launch-permission "Add=[{UserId=123456789012}]"

# Copy AMI to another region (for multi-region deployments)
aws ec2 copy-image \
  --source-image-id ami-0your-custom-ami-id \
  --source-region us-east-1 \
  --region eu-west-1 \
  --name "my-web-server-v1.0-eu"
```

---

## 4. Instance Lifecycle

EC2 instances move through defined states. Understanding the lifecycle is critical for managing costs and availability.

### 4.1 Launch, Stop, Start, Terminate, Hibernate

```
Instance Lifecycle States:

  Launch (RunInstances)
      |
      v
  +---------+
  | pending |  ← instance is being provisioned
  +---------+
      |
      v
  +---------+
  | running |  ← instance is live, you are being billed
  +---------+
      |                          |                         |
      | StopInstances            | TerminateInstances      | HibernateInstances
      v                          v                         v
  +----------+             +--------------+          +----------+
  | stopping |             | shutting-down|          | stopping |
  +----------+             +--------------+          | (hibernate)
      |                          |                   +----------+
      v                          v                        |
  +---------+              +------------+                 v
  | stopped |              | terminated |            +---------+
  +---------+              +------------+            | stopped |
      |                     (gone forever)           | (RAM on |
      | StartInstances                               |  disk)  |
      v                                              +---------+
  +---------+                                             |
  | pending |                                    StartInstances
  +---------+                                             |
      |                                                   v
      v                                              +---------+
  +---------+                                        | pending |
  | running |                                        +---------+
  +---------+                                             |
                                                          v
                                                     +---------+
                                                     | running |
                                                     | (RAM    |
                                                     | restored)
                                                     +---------+
```

### 4.2 Instance States

```
State           | Billing? | EBS Root? | Public IP?  | Notes
----------------+----------+-----------+-------------+---------------------------
pending         | No       | Attaching | Not yet     | Being provisioned
running         | Yes      | Attached  | Yes (if set)| Active and usable
stopping        | No       | Attached  | Releasing   | Transitioning to stopped
stopped         | No*      | Persists  | Released    | *EBS still billed
shutting-down   | No       | Deleting  | Released    | Being terminated
terminated      | No       | Deleted** | Released    | **Unless DeleteOnTermination=false

Key behaviors:
  Stop/Start:
    - Instance moves to different host hardware
    - Public IP changes (unless Elastic IP)
    - EBS root volume persists
    - Instance store (ephemeral) data is LOST
    - No compute charges while stopped (EBS charges continue)

  Terminate:
    - Instance is permanently deleted
    - EBS root volume deleted by default (configurable)
    - Cannot be undone (enable termination protection!)

  Hibernate:
    - RAM contents saved to EBS root volume (must be encrypted)
    - On start, RAM is restored → applications resume where they left off
    - Faster than cold boot
    - Supported on specific instance types, max 60 days
    - Root volume must be large enough for RAM dump
```

```bash
# Stop an instance (EBS-backed only)
aws ec2 stop-instances --instance-ids i-0123456789abcdef0

# Start a stopped instance
aws ec2 start-instances --instance-ids i-0123456789abcdef0

# Terminate an instance (permanent!)
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0

# Enable termination protection (prevents accidental deletion)
aws ec2 modify-instance-attribute \
  --instance-id i-0123456789abcdef0 \
  --disable-api-termination

# Reboot (does NOT change host, keeps public IP)
aws ec2 reboot-instances --instance-ids i-0123456789abcdef0

# Hibernate an instance
aws ec2 stop-instances \
  --instance-ids i-0123456789abcdef0 \
  --hibernate

# Check instance state
aws ec2 describe-instances \
  --instance-ids i-0123456789abcdef0 \
  --query "Reservations[0].Instances[0].State.Name"
```

---

## 5. Security Groups

A Security Group acts as a **virtual firewall** for your EC2 instances, controlling inbound (incoming) and outbound (outgoing) traffic at the instance level. Security groups are stateful — if you allow inbound traffic, the response is automatically allowed out.

### 5.1 Inbound and Outbound Rules

```
Security Group Rules Structure:

  Inbound (Ingress):
    - Type:       protocol (TCP, UDP, ICMP, or All)
    - Port Range: single port (22) or range (8000-9000)
    - Source:     CIDR block (0.0.0.0/0), another SG, or prefix list

  Outbound (Egress):
    - Type:       protocol
    - Port Range: port or range
    - Destination: CIDR, SG, or prefix list

Key rules:
  1. Default: ALL inbound DENIED, ALL outbound ALLOWED
  2. You can only create ALLOW rules (no DENY rules)
  3. Stateful: return traffic is automatically allowed
  4. Changes take effect immediately (no restart needed)
  5. An instance can have multiple security groups (rules are aggregated)
  6. Security groups are VPC-specific
```

```bash
# Create a security group
aws ec2 create-security-group \
  --group-name web-server-sg \
  --description "Security group for web servers" \
  --vpc-id vpc-0123456789abcdef0

# Allow SSH from your IP only
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 22 \
  --cidr 203.0.113.50/32             # Your specific IP (/32 = single host)

# Allow HTTP from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0                   # Open to the world

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# Allow traffic from another security group (e.g., ALB → EC2)
aws ec2 authorize-security-group-ingress \
  --group-id sg-0ec2-instance-sg \
  --protocol tcp \
  --port 8080 \
  --source-group sg-0alb-security-group  # Only ALB can reach port 8080

# List rules for a security group
aws ec2 describe-security-groups \
  --group-ids sg-0123456789abcdef0 \
  --query "SecurityGroups[0].{Inbound:IpPermissions,Outbound:IpPermissionsEgress}"
```

### 5.2 Security Group vs NACL

```
Feature              | Security Group            | Network ACL (NACL)
---------------------+---------------------------+---------------------------
Level                | Instance (ENI)            | Subnet
State                | Stateful                  | Stateless
                     | (return traffic auto)     | (must allow return traffic)
Rules                | ALLOW only                | ALLOW and DENY
Evaluation           | All rules evaluated       | Rules evaluated in order
                     | (most permissive wins)    | (first match wins)
Default              | Deny all inbound,         | Allow all inbound,
                     | Allow all outbound        | Allow all outbound
Association          | Assigned to instances     | Applied to entire subnet
Rule count           | 60 inbound + 60 outbound  | 20 inbound + 20 outbound

When to use both:
  NACL → broad subnet-level blocking (block a known bad IP range)
  SG   → fine-grained instance-level control (only ALB can talk to app server)

Typical layered approach:
  NACL: Block known malicious IPs, allow all other traffic
  SG:   Allow only specific ports from specific sources
```

### 5.3 Common Configurations

```
Web Server (public-facing):
  Inbound:
    TCP 80   from 0.0.0.0/0          # HTTP
    TCP 443  from 0.0.0.0/0          # HTTPS
    TCP 22   from 10.0.0.0/8         # SSH from internal only
  Outbound:
    All traffic to 0.0.0.0/0         # Default — allow all outbound

Application Server (behind ALB):
  Inbound:
    TCP 8080 from sg-alb-sg          # Only ALB can reach app port
    TCP 22   from sg-bastion-sg      # SSH only from bastion host
  Outbound:
    All traffic to 0.0.0.0/0

Database Server (private):
  Inbound:
    TCP 5432 from sg-app-sg          # PostgreSQL only from app servers
    TCP 5432 from sg-bastion-sg      # DB access from bastion
  Outbound:
    All traffic to 0.0.0.0/0

Bastion Host:
  Inbound:
    TCP 22 from 203.0.113.0/24       # SSH from corporate IP range only
  Outbound:
    TCP 22 to 10.0.0.0/8             # SSH to private instances only
```

---

## 6. Key Pairs and SSH

Key pairs are used for **secure SSH access** to EC2 instances. AWS stores the public key on the instance; you keep the private key. Without the private key, you cannot SSH into the instance.

### 6.1 Creating Key Pairs

```bash
# Option 1: Let AWS generate the key pair (downloads private key)
aws ec2 create-key-pair \
  --key-name my-key-pair \
  --key-type rsa \                  # rsa (default) or ed25519
  --query "KeyMaterial" \
  --output text > my-key-pair.pem

# Set correct permissions (required — SSH refuses if too open)
chmod 400 my-key-pair.pem           # Owner read-only

# Option 2: Import your own public key
ssh-keygen -t ed25519 -C "my-aws-key" -f ~/.ssh/aws-key   # Generate locally
aws ec2 import-key-pair \
  --key-name my-imported-key \
  --public-key-material fileb://~/.ssh/aws-key.pub

# List key pairs
aws ec2 describe-key-pairs --query "KeyPairs[].{Name:KeyName,ID:KeyPairId,Type:KeyType}"

# Delete a key pair
aws ec2 delete-key-pair --key-name old-key-pair
```

### 6.2 Connecting to Instances

```bash
# Standard SSH connection
ssh -i ~/.ssh/my-key-pair.pem ec2-user@54.123.45.67
# ec2-user     → Amazon Linux, AL2023
# ubuntu       → Ubuntu
# admin        → Debian
# centos       → CentOS
# Administrator → Windows (use RDP instead)

# SSH with verbose output (debugging connection issues)
ssh -v -i ~/.ssh/my-key-pair.pem ec2-user@54.123.45.67

# SSH through a bastion host (jump host)
ssh -i ~/.ssh/my-key-pair.pem \
  -J ec2-user@bastion-public-ip \       # Jump through bastion
  ec2-user@10.0.1.50                     # Private IP of target

# SCP: Copy files to instance
scp -i ~/.ssh/my-key-pair.pem ./app.tar.gz ec2-user@54.123.45.67:/home/ec2-user/

# SSH config file (~/.ssh/config) for easier access
# Host my-web-server
#   HostName 54.123.45.67
#   User ec2-user
#   IdentityFile ~/.ssh/my-key-pair.pem
#   ProxyJump bastion                    # Jump through bastion
#
# Host bastion
#   HostName 52.1.2.3
#   User ec2-user
#   IdentityFile ~/.ssh/my-key-pair.pem

# Then simply:
# ssh my-web-server
```

```
Alternative: EC2 Instance Connect (no key pair needed)
  - Push a temporary SSH key to the instance metadata
  - Connect via AWS Console or CLI
  - Key is valid for 60 seconds
  - Requires the EC2 Instance Connect agent on the instance

Alternative: AWS Systems Manager Session Manager
  - No SSH, no key pairs, no open ports
  - Uses IAM for authentication
  - All sessions are logged to CloudTrail / S3
  - Works for private instances without public IP
  - Recommended for production environments
```

```bash
# Connect using Session Manager (no SSH needed, no port 22)
aws ssm start-session --target i-0123456789abcdef0
```

---

## 7. EBS (Elastic Block Store)

EBS provides **persistent block-level storage volumes** for EC2 instances. Unlike instance store (ephemeral), EBS volumes persist independently of the instance lifecycle. Think of EBS as a virtual hard drive you attach to your instance.

### 7.1 Volume Types

```
Volume Type  | Name               | IOPS (max)   | Throughput   | Use Case
-------------+--------------------+--------------+--------------+---------------------------
gp3          | General Purpose    | 16,000       | 1,000 MB/s   | Boot volumes, dev/test,
             | SSD                | (baseline    | (baseline    | virtual desktops, most
             |                    |  3,000 free) |  125 MB/s)   | workloads (DEFAULT choice)
-------------+--------------------+--------------+--------------+---------------------------
gp2          | General Purpose    | 16,000       | 250 MB/s     | Legacy — migrate to gp3
             | SSD (legacy)       | (burst based |              | (gp3 is 20% cheaper)
             |                    |  on volume   |              |
             |                    |  size)       |              |
-------------+--------------------+--------------+--------------+---------------------------
io2 Block    | Provisioned IOPS   | 256,000      | 4,000 MB/s   | Databases (Oracle, SQL
Express      | SSD                | (sub-ms      |              | Server), latency-sensitive
             |                    |  latency)    |              | transactional workloads
-------------+--------------------+--------------+--------------+---------------------------
io2/io1      | Provisioned IOPS   | 64,000       | 1,000 MB/s   | High-performance databases
             | SSD                |              |              | requiring sustained IOPS
-------------+--------------------+--------------+--------------+---------------------------
st1          | Throughput         | 500          | 500 MB/s     | Big data, data warehouses,
             | Optimized HDD      |              |              | log processing
             |                    |              |              | (CANNOT be boot volume)
-------------+--------------------+--------------+--------------+---------------------------
sc1          | Cold HDD           | 250          | 250 MB/s     | Infrequently accessed data
             |                    |              |              | lowest cost HDD
             |                    |              |              | (CANNOT be boot volume)

Key points:
  - gp3 is the default and best for most workloads (predictable pricing)
  - gp3 decouples IOPS and throughput from volume size (unlike gp2)
  - io2 for databases needing guaranteed IOPS with 99.999% durability
  - st1/sc1 for sequential access patterns (not random I/O)
  - Only SSD types (gp2, gp3, io1, io2) can be boot volumes
```

```bash
# Create a gp3 volume
aws ec2 create-volume \
  --volume-type gp3 \
  --size 100 \                       # 100 GB
  --iops 3000 \                      # Baseline is free (up to 16,000)
  --throughput 125 \                 # Baseline is free (up to 1,000 MB/s)
  --availability-zone us-east-1a \
  --encrypted \                      # Always encrypt in production
  --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=app-data}]'

# Attach volume to an instance
aws ec2 attach-volume \
  --volume-id vol-0123456789abcdef0 \
  --instance-id i-0123456789abcdef0 \
  --device /dev/xvdf                 # Device name

# After attaching, SSH in and mount:
# sudo mkfs -t xfs /dev/xvdf        # Format (first time only!)
# sudo mkdir /data
# sudo mount /dev/xvdf /data
# echo "/dev/xvdf /data xfs defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Modify volume type/size without downtime (Elastic Volumes)
aws ec2 modify-volume \
  --volume-id vol-0123456789abcdef0 \
  --volume-type gp3 \               # Change from gp2 to gp3
  --size 200 \                       # Increase size (cannot decrease!)
  --iops 6000                        # Increase IOPS
```

### 7.2 Snapshots

EBS snapshots are **point-in-time backups** stored in S3 (managed by AWS). They are incremental — only blocks that changed since the last snapshot are saved.

```bash
# Create a snapshot
aws ec2 create-snapshot \
  --volume-id vol-0123456789abcdef0 \
  --description "Daily backup - 2024-01-15" \
  --tag-specifications 'ResourceType=snapshot,Tags=[{Key=Name,Value=daily-backup}]'

# Create a volume from a snapshot (restore)
aws ec2 create-volume \
  --snapshot-id snap-0123456789abcdef0 \
  --volume-type gp3 \
  --availability-zone us-east-1a

# Copy a snapshot to another region (DR / cross-region replication)
aws ec2 copy-snapshot \
  --source-region us-east-1 \
  --source-snapshot-id snap-0123456789abcdef0 \
  --destination-region eu-west-1 \
  --description "DR copy of production data"

# Create an AMI from a snapshot (for launching instances)
aws ec2 register-image \
  --name "my-custom-ami" \
  --root-device-name /dev/xvda \
  --block-device-mappings "[{\"DeviceName\":\"/dev/xvda\",\"Ebs\":{\"SnapshotId\":\"snap-0123456789abcdef0\"}}]"

# Automate snapshots with Amazon Data Lifecycle Manager (DLM)
aws dlm create-lifecycle-policy \
  --description "Daily snapshots, retain 7 days" \
  --state ENABLED \
  --execution-role-arn arn:aws:iam::123456789012:role/dlm-role \
  --policy-details '{
    "PolicyType": "EBS_SNAPSHOT_MANAGEMENT",
    "ResourceTypes": ["VOLUME"],
    "TargetTags": [{"Key":"Backup","Value":"daily"}],
    "Schedules": [{
      "Name": "DailySnapshot",
      "CreateRule": {"Interval":24,"IntervalUnit":"HOURS","Times":["03:00"]},
      "RetainRule": {"Count":7}
    }]
  }'
```

```
Snapshot key points:
  - Incremental: first snapshot copies all data, subsequent only copy changes
  - Stored in S3 (not visible in your S3 console — managed by AWS)
  - Can create volumes from snapshots in any AZ in the same region
  - Can copy across regions for disaster recovery
  - Can share with other AWS accounts
  - Deleting a snapshot removes only data not needed by other snapshots
  - Use Data Lifecycle Manager (DLM) for automated snapshot policies
```

### 7.3 Encryption

```
EBS Encryption:
  - Uses AWS KMS (Key Management Service) keys
  - Encrypts data at rest, in transit (between instance and volume), and snapshots
  - Minimal impact on latency (handled by EC2 host hardware)
  - Enabled per volume (or enable default encryption for the account)

What gets encrypted:
  ✓ Data at rest inside the volume
  ✓ Data moving between the volume and the instance
  ✓ All snapshots created from the volume
  ✓ All volumes created from those snapshots

Cannot do:
  ✗ Encrypt an existing unencrypted volume directly
  → Workaround: snapshot → copy snapshot with encryption → create new volume
```

```bash
# Create an encrypted volume with default AWS-managed key
aws ec2 create-volume \
  --volume-type gp3 \
  --size 50 \
  --encrypted \                      # Uses default aws/ebs KMS key
  --availability-zone us-east-1a

# Create with a custom KMS key
aws ec2 create-volume \
  --volume-type gp3 \
  --size 50 \
  --encrypted \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/abcd-1234 \
  --availability-zone us-east-1a

# Enable default encryption for all new EBS volumes in the account
aws ec2 enable-ebs-encryption-by-default

# Encrypt an existing unencrypted volume (migration):
# 1. Create snapshot of unencrypted volume
aws ec2 create-snapshot --volume-id vol-unencrypted-id
# 2. Copy snapshot with encryption enabled
aws ec2 copy-snapshot \
  --source-region us-east-1 \
  --source-snapshot-id snap-unencrypted \
  --encrypted \
  --kms-key-id arn:aws:kms:us-east-1:123456789012:key/abcd-1234
# 3. Create new encrypted volume from the encrypted snapshot
aws ec2 create-volume --snapshot-id snap-encrypted --volume-type gp3 --availability-zone us-east-1a
# 4. Swap volumes on the instance (stop → detach old → attach new → start)
```

---

## 8. VPC (Virtual Private Cloud)

A VPC is an **isolated virtual network** you define in AWS. It is your own private section of the AWS cloud where you launch resources. Every EC2 instance runs inside a VPC.

```
VPC Architecture (typical production setup):

  VPC: 10.0.0.0/16 (65,536 IPs)
  ├── AZ us-east-1a
  │   ├── Public Subnet  10.0.1.0/24 (256 IPs)  → ALB, NAT Gateway, Bastion
  │   └── Private Subnet 10.0.3.0/24 (256 IPs)  → EC2 app servers, RDS
  ├── AZ us-east-1b
  │   ├── Public Subnet  10.0.2.0/24 (256 IPs)  → ALB, NAT Gateway (HA)
  │   └── Private Subnet 10.0.4.0/24 (256 IPs)  → EC2 app servers, RDS
  │
  ├── Internet Gateway (IGW)        → public internet access
  ├── NAT Gateway (in public subnet)→ private subnet internet access (outbound only)
  ├── Route Tables                  → route traffic between subnets and internet
  └── Network ACLs                  → subnet-level firewall
```

```bash
# Create a VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=production-vpc}]'

# Enable DNS hostnames (required for public DNS names on instances)
aws ec2 modify-vpc-attribute \
  --vpc-id vpc-0123456789abcdef0 \
  --enable-dns-hostnames '{"Value": true}'
```

### 8.1 Subnets (Public vs Private)

A subnet is a **range of IP addresses** within your VPC. Each subnet lives in exactly one Availability Zone. The key difference between public and private subnets is routing.

```
Public Subnet:
  - Route table has a route to Internet Gateway (0.0.0.0/0 → IGW)
  - Instances CAN have public IPs
  - Directly accessible from the internet (if security group allows)
  - Use for: ALB, NAT Gateway, bastion hosts, public-facing instances

Private Subnet:
  - Route table does NOT have a route to Internet Gateway
  - Route to NAT Gateway for outbound internet (e.g., software updates)
  - Instances do NOT have public IPs
  - NOT directly accessible from the internet
  - Use for: Application servers, databases, internal services

Reserved IPs per subnet (AWS reserves 5):
  10.0.1.0   → Network address
  10.0.1.1   → VPC router
  10.0.1.2   → DNS server
  10.0.1.3   → Reserved for future use
  10.0.1.255 → Broadcast (not supported in VPC but reserved)
  → A /24 subnet gives 256 - 5 = 251 usable IPs
```

```bash
# Create a public subnet
aws ec2 create-subnet \
  --vpc-id vpc-0123456789abcdef0 \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1a}]'

# Enable auto-assign public IP for public subnet
aws ec2 modify-subnet-attribute \
  --subnet-id subnet-0public \
  --map-public-ip-on-launch

# Create a private subnet
aws ec2 create-subnet \
  --vpc-id vpc-0123456789abcdef0 \
  --cidr-block 10.0.3.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1a}]'
```

### 8.2 Internet Gateway vs NAT Gateway

```
Internet Gateway (IGW):
  - Allows instances in PUBLIC subnets to reach the internet (and be reached)
  - One per VPC
  - Horizontally scaled, redundant, highly available (AWS managed)
  - No bandwidth bottleneck
  - FREE (no hourly charge)

NAT Gateway:
  - Allows instances in PRIVATE subnets to reach the internet (outbound only)
  - Instances cannot be reached from the internet
  - Deployed in a PUBLIC subnet (needs IGW)
  - AWS managed, scales to 100 Gbps
  - COSTS money: ~$0.045/hour + $0.045/GB processed
  - Deploy one per AZ for high availability
  - Use for: software updates, API calls, downloading patches

NAT Instance (legacy):
  - EC2 instance acting as NAT (self-managed)
  - Cheaper for low traffic but you manage patching/HA
  - Must disable source/destination check
  - Largely replaced by NAT Gateway

Traffic flow for private instance reaching the internet:
  Private Instance → Private Subnet Route Table → NAT Gateway (public subnet)
    → Public Subnet Route Table → Internet Gateway → Internet
```

```bash
# Create an Internet Gateway and attach to VPC
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=prod-igw}]'
aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-0123456789abcdef0 \
  --vpc-id vpc-0123456789abcdef0

# Allocate an Elastic IP for NAT Gateway
aws ec2 allocate-address --domain vpc

# Create a NAT Gateway in a public subnet
aws ec2 create-nat-gateway \
  --subnet-id subnet-0public-1a \
  --allocation-id eipalloc-0123456789abcdef0 \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=nat-gw-1a}]'
```

### 8.3 Route Tables

Route tables contain **rules (routes)** that determine where network traffic is directed. Each subnet must be associated with a route table.

```
Public Subnet Route Table:
  Destination       | Target
  ------------------+------------------
  10.0.0.0/16       | local              ← VPC internal traffic stays in VPC
  0.0.0.0/0         | igw-xxxxxxxx       ← Everything else goes to internet

Private Subnet Route Table:
  Destination       | Target
  ------------------+------------------
  10.0.0.0/16       | local              ← VPC internal traffic stays in VPC
  0.0.0.0/0         | nat-xxxxxxxx       ← Outbound internet via NAT Gateway

Key concepts:
  - Most specific route wins (longest prefix match)
  - "local" route is mandatory and cannot be removed
  - Main route table = default for subnets not explicitly associated
  - Best practice: explicit route table per subnet type (public, private)
```

```bash
# Create a route table
aws ec2 create-route-table \
  --vpc-id vpc-0123456789abcdef0 \
  --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]'

# Add internet route to the public route table
aws ec2 create-route \
  --route-table-id rtb-0public \
  --destination-cidr-block 0.0.0.0/0 \
  --gateway-id igw-0123456789abcdef0    # Internet Gateway

# Add NAT route to the private route table
aws ec2 create-route \
  --route-table-id rtb-0private \
  --destination-cidr-block 0.0.0.0/0 \
  --nat-gateway-id nat-0123456789abcdef0  # NAT Gateway

# Associate a subnet with a route table
aws ec2 associate-route-table \
  --route-table-id rtb-0public \
  --subnet-id subnet-0public-1a

# View route table
aws ec2 describe-route-tables \
  --route-table-ids rtb-0public \
  --query "RouteTables[0].Routes"
```

### 8.4 VPC Peering

VPC Peering allows **private connectivity between two VPCs** using AWS's internal network. Traffic never traverses the public internet. Works across accounts and regions.

```
VPC Peering:
  VPC A (10.0.0.0/16) ←——peering——→ VPC B (172.16.0.0/16)

  - 1:1 connection between exactly two VPCs
  - NOT transitive: if A↔B and B↔C, A cannot reach C through B
  - CIDR blocks must NOT overlap
  - Must update route tables in BOTH VPCs
  - Cross-region peering: data transfer charges apply
  - Cross-account peering: requires acceptor to approve the request

Use cases:
  - Shared services VPC (logging, monitoring, CI/CD)
  - Multi-account architecture (dev ↔ shared services)
  - Cross-region connectivity
```

```bash
# Create a peering connection (requester)
aws ec2 create-vpc-peering-connection \
  --vpc-id vpc-0requester \
  --peer-vpc-id vpc-0accepter \
  --peer-region eu-west-1 \           # Cross-region (optional)
  --peer-owner-id 987654321098         # Cross-account (optional)

# Accept the peering connection (accepter side)
aws ec2 accept-vpc-peering-connection \
  --vpc-peering-connection-id pcx-0123456789abcdef0

# Add routes in BOTH VPCs
# In VPC A route table: route to VPC B CIDR via peering connection
aws ec2 create-route \
  --route-table-id rtb-vpc-a \
  --destination-cidr-block 172.16.0.0/16 \
  --vpc-peering-connection-id pcx-0123456789abcdef0

# In VPC B route table: route to VPC A CIDR via peering connection
aws ec2 create-route \
  --route-table-id rtb-vpc-b \
  --destination-cidr-block 10.0.0.0/16 \
  --vpc-peering-connection-id pcx-0123456789abcdef0

# Don't forget to update security groups in both VPCs to allow cross-VPC traffic!
```

### 8.5 VPC Endpoints

VPC Endpoints allow you to **privately connect your VPC to AWS services** without using the internet, NAT Gateway, or VPN. Traffic stays on the AWS network.

```
Two types:

1. Gateway Endpoints (FREE):
   - S3 and DynamoDB only
   - Added as a route in your route table
   - No ENI, no security group needed
   - Highly available, redundant

2. Interface Endpoints (PrivateLink) ($0.01/hr + data):
   - Most AWS services (SQS, SNS, KMS, CloudWatch, ECR, etc.)
   - Creates an ENI in your subnet with a private IP
   - Uses security groups for access control
   - DNS resolution to private IPs
   - Can access third-party services via PrivateLink

Why use endpoints:
  - Security: traffic never leaves AWS network
  - Cost: avoid NAT Gateway data processing charges ($0.045/GB)
  - Compliance: some regulations require private connectivity
  - Performance: lower latency, more consistent
```

```bash
# Create a Gateway Endpoint for S3 (free!)
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0123456789abcdef0 \
  --service-name com.amazonaws.us-east-1.s3 \
  --route-table-ids rtb-0private           # Automatically adds route

# Create an Interface Endpoint for SQS
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-0123456789abcdef0 \
  --vpc-endpoint-type Interface \
  --service-name com.amazonaws.us-east-1.sqs \
  --subnet-ids subnet-0private-1a subnet-0private-1b \
  --security-group-ids sg-0endpoint-sg \
  --private-dns-enabled                    # Use default SQS DNS names

# List available endpoint services in your region
aws ec2 describe-vpc-endpoint-services \
  --query "ServiceNames" \
  --output table
```

---

## 9. Elastic Load Balancing

Elastic Load Balancing (ELB) automatically distributes incoming traffic across multiple EC2 instances, containers, or IP addresses. It improves availability and fault tolerance by routing traffic only to healthy targets.

### 9.1 ALB vs NLB vs CLB

```
Feature          | ALB                    | NLB                    | CLB (Legacy)
-----------------+------------------------+------------------------+-------------------
Layer            | 7 (HTTP/HTTPS)         | 4 (TCP/UDP/TLS)        | 4 + 7 (basic)
Protocol         | HTTP, HTTPS, gRPC,     | TCP, UDP, TLS          | HTTP, HTTPS, TCP
                 | WebSocket              |                        |
Routing          | Path, host, header,    | Port-based only        | Basic
                 | query string, method   |                        |
Performance      | Good                   | Millions of req/s,     | Basic
                 |                        | ultra-low latency      |
Static IP        | No (use Global Accel.) | Yes (1 per AZ)         | No
Preserve source  | X-Forwarded-For header | Yes (native)           | X-Forwarded-For
IP               |                        |                        |
SSL termination  | Yes                    | Yes (TLS listener)     | Yes
WebSocket        | Native support         | Works (TCP passthrough)| No
Cost             | ~$0.0225/hr + LCU      | ~$0.0225/hr + NLCU     | ~$0.025/hr + data
Best for         | Web apps, microservices| Gaming, IoT, extreme   | Legacy only
                 | APIs, containers       | performance, static IP | (migrate away)

Decision tree:
  HTTP/HTTPS traffic with routing needs? → ALB
  TCP/UDP, extreme performance, static IP? → NLB
  Legacy application already using it? → CLB (migrate to ALB/NLB)
```

```bash
# Create an Application Load Balancer
aws elbv2 create-load-balancer \
  --name my-web-alb \
  --type application \
  --scheme internet-facing \              # or "internal" for private ALB
  --subnets subnet-0public-1a subnet-0public-1b \
  --security-groups sg-0alb-sg \
  --tags Key=Environment,Value=production

# Create a Network Load Balancer
aws elbv2 create-load-balancer \
  --name my-tcp-nlb \
  --type network \
  --scheme internet-facing \
  --subnets subnet-0public-1a subnet-0public-1b
```

### 9.2 Target Groups

A target group routes requests to one or more registered targets (EC2 instances, IP addresses, Lambda functions, or other ALBs).

```
Target types:
  instance  → route to EC2 instance IDs (most common)
  ip        → route to specific IPs (containers, on-premises via VPN)
  lambda    → route to Lambda function (ALB only)
  alb       → route to another ALB (NLB only, for chaining)

Routing algorithms:
  Round robin          → distribute evenly (default for ALB)
  Least outstanding    → route to target with fewest in-flight requests
  Flow hash            → based on protocol, source/dest IP, port (NLB)
```

```bash
# Create a target group for EC2 instances
aws elbv2 create-target-group \
  --name web-servers-tg \
  --protocol HTTP \
  --port 8080 \                           # Port your app listens on
  --vpc-id vpc-0123456789abcdef0 \
  --target-type instance \
  --health-check-path /health \           # Health check endpoint
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Register EC2 instances with the target group
aws elbv2 register-targets \
  --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/web-servers-tg/... \
  --targets Id=i-0instance1 Id=i-0instance2 Id=i-0instance3

# Create a listener on the ALB (port 443 → target group)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:...:loadbalancer/app/my-web-alb/... \
  --protocol HTTPS \
  --port 443 \
  --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06 \
  --certificates CertificateArn=arn:aws:acm:...:certificate/abcd-1234 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:...:targetgroup/web-servers-tg/...

# Add path-based routing rule (ALB only)
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:...:listener/... \
  --priority 10 \
  --conditions '[{"Field":"path-pattern","Values":["/api/*"]}]' \
  --actions '[{"Type":"forward","TargetGroupArn":"arn:aws:...:targetgroup/api-servers-tg/..."}]'

# Add host-based routing rule
aws elbv2 create-rule \
  --listener-arn arn:aws:elasticloadbalancing:...:listener/... \
  --priority 20 \
  --conditions '[{"Field":"host-header","Values":["api.example.com"]}]' \
  --actions '[{"Type":"forward","TargetGroupArn":"arn:aws:...:targetgroup/api-tg/..."}]'
```

### 9.3 Health Checks

Load balancers continuously check target health and only route traffic to healthy targets.

```
Health Check Parameters:
  Protocol:           HTTP, HTTPS, TCP
  Path:               /health (for HTTP/HTTPS)
  Port:               traffic-port (default) or specific port
  Interval:           30 seconds (how often to check)
  Timeout:            5 seconds (time to wait for response)
  Healthy threshold:  3 (consecutive successes to mark healthy)
  Unhealthy threshold: 2 (consecutive failures to mark unhealthy)
  Success codes:      200 (or 200-299)

Health check states:
  initial    → target just registered, first health check pending
  healthy    → target is passing health checks
  unhealthy  → target is failing health checks → no traffic routed
  draining   → target is deregistering → in-flight requests complete
  unused     → target not registered or AZ not enabled

Best practice for health check endpoint:
  - Dedicated /health route (not your homepage)
  - Check dependencies (database, cache connections)
  - Return 200 if healthy, 503 if unhealthy
  - Keep it lightweight (< 100ms response)
```

```bash
# Check target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/web-servers-tg/...

# Modify health check settings
aws elbv2 modify-target-group \
  --target-group-arn arn:aws:elasticloadbalancing:...:targetgroup/web-servers-tg/... \
  --health-check-path /health \
  --health-check-interval-seconds 15 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --matcher '{"HttpCode":"200"}'
```

### 9.4 SSL/TLS Termination

SSL/TLS termination at the load balancer offloads encryption/decryption from your EC2 instances, improving performance and simplifying certificate management.

```
SSL Termination Options:

1. Terminate at ALB (most common):
   Client --HTTPS--> ALB --HTTP--> EC2
   - ALB handles SSL certificate
   - Backend traffic is unencrypted (within VPC — generally acceptable)
   - Easier certificate management via ACM
   - Less CPU load on EC2 instances

2. End-to-end encryption:
   Client --HTTPS--> ALB --HTTPS--> EC2
   - ALB re-encrypts to backend
   - More secure (required for some compliance standards)
   - More complex: need certs on ALB and EC2

3. Pass-through (NLB only):
   Client --TLS--> NLB --TLS--> EC2
   - NLB passes encrypted traffic directly
   - EC2 handles TLS termination
   - Client IP preserved
   - Use when app needs direct TLS (mutual TLS / mTLS)
```

```bash
# Request a free SSL certificate from ACM
aws acm request-certificate \
  --domain-name example.com \
  --subject-alternative-names "*.example.com" \   # Wildcard
  --validation-method DNS

# After DNS validation, add certificate to ALB listener
aws elbv2 modify-listener \
  --listener-arn arn:aws:elasticloadbalancing:...:listener/... \
  --certificates CertificateArn=arn:aws:acm:...:certificate/abcd-1234

# HTTP → HTTPS redirect (create listener on port 80)
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:...:loadbalancer/app/my-web-alb/... \
  --protocol HTTP \
  --port 80 \
  --default-actions '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","StatusCode":"HTTP_301"}}]'
```

---

## 10. Auto Scaling

Auto Scaling automatically adjusts the number of EC2 instances based on demand. It ensures you have the right number of instances to handle load while minimizing costs.

```
Auto Scaling components:

  Launch Template → WHAT to launch (AMI, instance type, key pair, SG, user data)
  Auto Scaling Group (ASG) → WHERE and HOW MANY (VPC, subnets, min/max/desired)
  Scaling Policies → WHEN to scale (CPU > 70%, request count, schedule)

  Launch Template + ASG + Scaling Policy = Auto Scaling

  +----- Auto Scaling Group -----+
  |  min: 2    desired: 3   max: 6 |
  |                                |
  |  [i-1]  [i-2]  [i-3]         |
  |   AZ-a   AZ-b   AZ-a         |
  +--------------------------------+
      ↑                    ↑
  Scale Out (+1)      Scale In (-1)
  (CPU > 70%)         (CPU < 30%)
```

### 10.1 Launch Templates

A launch template defines the **configuration for instances** that Auto Scaling will launch. It replaces the older Launch Configuration (which is now legacy).

```bash
# Create a launch template
aws ec2 create-launch-template \
  --launch-template-name web-server-lt \
  --version-description "v1 - Nginx + Node.js" \
  --launch-template-data '{
    "ImageId": "ami-0your-custom-ami",
    "InstanceType": "t3.medium",
    "KeyName": "my-key-pair",
    "SecurityGroupIds": ["sg-0app-sg"],
    "UserData": "'$(base64 -w 0 <<'USERDATA'
#!/bin/bash
yum update -y
systemctl start nginx
USERDATA
)'",
    "BlockDeviceMappings": [{
      "DeviceName": "/dev/xvda",
      "Ebs": {
        "VolumeSize": 30,
        "VolumeType": "gp3",
        "Encrypted": true
      }
    }],
    "TagSpecifications": [{
      "ResourceType": "instance",
      "Tags": [{"Key": "Name", "Value": "web-server-asg"}]
    }],
    "Monitoring": {"Enabled": true},
    "MetadataOptions": {
      "HttpTokens": "required",
      "HttpEndpoint": "enabled"
    }
  }'

# Create a new version of the launch template (update AMI)
aws ec2 create-launch-template-version \
  --launch-template-name web-server-lt \
  --source-version 1 \
  --launch-template-data '{"ImageId": "ami-0new-ami-id"}' \
  --version-description "v2 - Updated AMI 2024-01-20"

# Set the default version
aws ec2 modify-launch-template \
  --launch-template-name web-server-lt \
  --default-version 2

# Create an Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name web-server-asg \
  --launch-template LaunchTemplateName=web-server-lt,Version='$Default' \
  --min-size 2 \                          # Minimum instances (never fewer)
  --max-size 6 \                          # Maximum instances (never more)
  --desired-capacity 3 \                  # Start with this many
  --vpc-zone-identifier "subnet-0private-1a,subnet-0private-1b" \
  --target-group-arns "arn:aws:elasticloadbalancing:...:targetgroup/web-servers-tg/..." \
  --health-check-type ELB \               # Use ALB health checks (not just EC2)
  --health-check-grace-period 300 \       # Wait 5 min before checking new instance
  --tags '[{"Key":"Environment","Value":"production","PropagateAtLaunch":true}]'
```

### 10.2 Scaling Policies (Target Tracking, Step, Simple)

```
Scaling Policy Types:

1. Target Tracking (RECOMMENDED — simplest and most effective):
   - You set a target value for a metric
   - ASG automatically adjusts capacity to maintain the target
   - Like a thermostat — "keep CPU at 50%"

2. Step Scaling:
   - Define step adjustments based on alarm thresholds
   - More granular control than simple scaling
   - Example: CPU 60-70% → add 1, CPU 70-80% → add 2, CPU >80% → add 3

3. Simple Scaling:
   - Single adjustment when alarm triggers
   - Waits for cooldown before next adjustment
   - Legacy — use target tracking or step instead

4. Scheduled Scaling:
   - Scale based on a time schedule
   - Example: scale up to 10 instances at 9 AM, down to 2 at 6 PM
   - Good for predictable traffic patterns

5. Predictive Scaling:
   - Uses ML to analyze traffic patterns and pre-scale
   - Proactive: scales BEFORE traffic arrives
   - Best combined with target tracking
```

```bash
# Target Tracking: Keep average CPU at 50%
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name web-server-asg \
  --policy-name cpu-target-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ASGAverageCPUUtilization"
    },
    "TargetValue": 50.0,
    "ScaleInCooldown": 300,
    "ScaleOutCooldown": 60
  }'

# Target Tracking: Keep request count per target at 1000
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name web-server-asg \
  --policy-name request-count-tracking \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ALBRequestCountPerTarget",
      "ResourceLabel": "app/my-web-alb/.../targetgroup/web-servers-tg/..."
    },
    "TargetValue": 1000.0
  }'

# Step Scaling: Graduated response
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name web-server-asg \
  --policy-name cpu-step-scaling \
  --policy-type StepScaling \
  --adjustment-type ChangeInCapacity \
  --step-adjustments '[
    {"MetricIntervalLowerBound":0,"MetricIntervalUpperBound":20,"ScalingAdjustment":1},
    {"MetricIntervalLowerBound":20,"MetricIntervalUpperBound":40,"ScalingAdjustment":2},
    {"MetricIntervalLowerBound":40,"ScalingAdjustment":3}
  ]'

# Scheduled Scaling: Scale up for business hours
aws autoscaling put-scheduled-update-group-action \
  --auto-scaling-group-name web-server-asg \
  --scheduled-action-name scale-up-morning \
  --recurrence "0 9 * * MON-FRI" \        # Cron: 9 AM weekdays
  --min-size 4 \
  --max-size 10 \
  --desired-capacity 6

aws autoscaling put-scheduled-update-group-action \
  --auto-scaling-group-name web-server-asg \
  --scheduled-action-name scale-down-evening \
  --recurrence "0 18 * * MON-FRI" \       # Cron: 6 PM weekdays
  --min-size 2 \
  --max-size 6 \
  --desired-capacity 2
```

### 10.3 Cooldown Periods

```
Cooldown prevents Auto Scaling from launching or terminating instances
before the previous scaling activity takes effect.

Default cooldown:     300 seconds (5 minutes) — applies to simple scaling
Scale-out cooldown:   60 seconds (recommended) — new instances need to be responsive
Scale-in cooldown:    300 seconds — avoid premature scale-in

Why cooldown matters:
  Without cooldown:
    CPU > 70% → add 2 instances
    10 seconds later, CPU still > 70% (new instances not ready) → add 2 more
    → Over-provisioned! Wasted money.

  With cooldown (300s):
    CPU > 70% → add 2 instances
    Wait 300 seconds for new instances to absorb traffic
    Re-evaluate → CPU now at 50% → no action needed

Best practice:
  - Use target tracking (handles cooldown automatically)
  - Scale out fast (short cooldown), scale in slow (long cooldown)
  - Set health check grace period > instance boot time
  - Enable instance warm-up period for target tracking
```

---

## 11. Elastic IP

An Elastic IP (EIP) is a **static, public IPv4 address** that you can allocate and associate with EC2 instances. Unlike dynamic public IPs (which change on stop/start), an EIP remains the same.

```
Elastic IP characteristics:
  - Static: does not change when instance is stopped/started
  - Remappable: can move from one instance to another instantly
  - Regional: allocated in a specific region
  - Charged when NOT associated with a running instance ($0.005/hr)
  - Free when associated with a running instance
  - Limit: 5 per region by default (can request increase)

When to use:
  ✓ Instance needs a fixed public IP (DNS records, whitelisting)
  ✓ Quick failover — remap EIP to a standby instance
  ✓ NAT Gateway (requires an EIP)

When NOT to use:
  ✗ Load-balanced applications (use ALB DNS name instead)
  ✗ Serverless applications
  ✗ Multiple instances (use DNS / load balancer)
```

```bash
# Allocate an Elastic IP
aws ec2 allocate-address --domain vpc
# Returns: AllocationId: eipalloc-0123456789abcdef0, PublicIp: 54.123.45.67

# Associate with an instance
aws ec2 associate-address \
  --allocation-id eipalloc-0123456789abcdef0 \
  --instance-id i-0123456789abcdef0

# Move to a different instance (instant failover)
aws ec2 associate-address \
  --allocation-id eipalloc-0123456789abcdef0 \
  --instance-id i-0new-instance-id \
  --allow-reassociation                   # Move from current instance

# Release an Elastic IP (when no longer needed)
aws ec2 disassociate-address --association-id eipassoc-0123456789abcdef0
aws ec2 release-address --allocation-id eipalloc-0123456789abcdef0
```

---

## 12. Placement Groups

Placement groups control **how instances are physically placed** on underlying hardware. They affect performance, availability, and fault tolerance.

```
Three strategies:

1. Cluster Placement Group:
   ┌─────────────────────────────┐
   │  Same Rack / Close Together │
   │  [i-1] [i-2] [i-3] [i-4]  │
   │       Low latency           │
   │       High throughput       │
   └─────────────────────────────┘
   - All instances in same AZ, same rack
   - 10 Gbps network between instances (enhanced networking)
   - Lowest latency, highest throughput
   - Risk: single rack failure = all instances down
   - Use for: HPC, big data jobs, low-latency applications

2. Spread Placement Group:
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Rack 1  │  │ Rack 2  │  │ Rack 3  │
   │  [i-1]  │  │  [i-2]  │  │  [i-3]  │
   └─────────┘  └─────────┘  └─────────┘
   - Each instance on a different physical rack
   - Max 7 instances per AZ per group
   - Reduces risk of simultaneous failure
   - Use for: critical applications, small number of instances
     where each must be isolated from hardware failure

3. Partition Placement Group:
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │ Partition 1  │  │ Partition 2  │  │ Partition 3  │
   │ [i-1] [i-2]  │  │ [i-3] [i-4]  │  │ [i-5] [i-6]  │
   │ (Rack group) │  │ (Rack group) │  │ (Rack group) │
   └──────────────┘  └──────────────┘  └──────────────┘
   - Instances grouped into partitions (each on different racks)
   - Up to 7 partitions per AZ
   - Hundreds of instances total
   - Partition failure does not affect other partitions
   - Use for: HDFS, HBase, Cassandra, Kafka
     (topology-aware applications)
```

```bash
# Create a cluster placement group
aws ec2 create-placement-group \
  --group-name hpc-cluster \
  --strategy cluster

# Create a spread placement group
aws ec2 create-placement-group \
  --group-name critical-apps \
  --strategy spread \
  --spread-level rack                   # "rack" (default) or "host"

# Create a partition placement group
aws ec2 create-placement-group \
  --group-name kafka-cluster \
  --strategy partition \
  --partition-count 3

# Launch instance into a placement group
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type c5.18xlarge \         # Use same instance type in cluster
  --placement GroupName=hpc-cluster \
  --count 4
```

---

## 13. Pricing Models

EC2 pricing determines how much you pay for compute capacity. Choosing the right pricing model can save 30-90% compared to On-Demand.

### 13.1 On-Demand

```
On-Demand:
  - Pay by the second (Linux) or hour (Windows) with no commitment
  - No upfront cost, no long-term contract
  - Most expensive per-hour rate
  - Start/stop anytime

Best for:
  - Short-term, unpredictable workloads
  - Development and testing
  - Applications being tested on EC2 for the first time
  - Applications with spiky, unpredictable traffic

Example pricing (us-east-1, Linux):
  t3.micro     $0.0104/hr  (~$7.49/month)
  t3.medium    $0.0416/hr  (~$29.95/month)
  m6i.large    $0.096/hr   (~$69.12/month)
  c6i.xlarge   $0.17/hr    (~$122.40/month)
```

### 13.2 Reserved Instances

```
Reserved Instances (RI):
  - Commit to 1 or 3 years → get 30-72% discount vs On-Demand
  - Capacity reservation in a specific AZ (optional)
  - Three payment options:
      All Upfront    → largest discount (~72% off for 3-year)
      Partial Upfront → moderate discount (~60% off)
      No Upfront     → smallest discount (~36% off), monthly payments

  Types:
    Standard RI    → fixed instance type, highest discount
    Convertible RI → can change instance type/family, lower discount (~54% max)

Best for:
  - Steady-state workloads (databases, always-on servers)
  - Known capacity requirements for 1-3 years
  - Applications that need reserved capacity in an AZ

Example savings (m6i.large, 3-year, All Upfront):
  On-Demand:  $0.096/hr  → $2,522/3 years
  Reserved:   $0.037/hr  → $972/3 years  (61% savings!)
```

### 13.3 Spot Instances

```
Spot Instances:
  - Use unused EC2 capacity at up to 90% discount
  - You set a max price; if spot price < your max, you get the instance
  - AWS CAN reclaim your instance with 2-minute warning
  - Price fluctuates based on supply/demand (usually stable)

Key concepts:
  Spot price:       current market price (usually 60-90% off On-Demand)
  Max price:        your ceiling (set to On-Demand to maximize availability)
  Interruption:     2-minute warning via instance metadata / CloudWatch
  Spot Fleet:       request a collection of Spot + On-Demand instances

Best for:
  - Fault-tolerant workloads
  - Batch processing, data analysis
  - CI/CD build servers
  - Stateless web servers (behind ALB with ASG)
  - Big data (EMR, Spark)
  - Container workloads (ECS, EKS)

NOT suitable for:
  - Databases (cannot tolerate interruption)
  - Single critical instances
  - Anything that cannot handle 2-minute shutdown
```

```bash
# Launch a Spot Instance
aws ec2 run-instances \
  --image-id ami-0c02fb55956c7d316 \
  --instance-type c5.xlarge \
  --instance-market-options '{
    "MarketType": "spot",
    "SpotOptions": {
      "MaxPrice": "0.08",
      "SpotInstanceType": "one-time",
      "InstanceInterruptionBehavior": "terminate"
    }
  }'

# Request a Spot Fleet (mix of instance types for better availability)
aws ec2 request-spot-fleet \
  --spot-fleet-request-config '{
    "TargetCapacity": 10,
    "IamFleetRole": "arn:aws:iam::123456789012:role/spot-fleet-role",
    "LaunchSpecifications": [
      {
        "ImageId": "ami-0c02fb55956c7d316",
        "InstanceType": "c5.xlarge",
        "SubnetId": "subnet-1a"
      },
      {
        "ImageId": "ami-0c02fb55956c7d316",
        "InstanceType": "c5a.xlarge",
        "SubnetId": "subnet-1b"
      },
      {
        "ImageId": "ami-0c02fb55956c7d316",
        "InstanceType": "c6i.xlarge",
        "SubnetId": "subnet-1a"
      }
    ],
    "AllocationStrategy": "capacityOptimized"
  }'

# Check current Spot pricing
aws ec2 describe-spot-price-history \
  --instance-types c5.xlarge \
  --start-time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --product-descriptions "Linux/UNIX" \
  --query "SpotPriceHistory[].{AZ:AvailabilityZone,Price:SpotPrice}"

# Handle Spot interruption (check from within the instance)
# curl -s http://169.254.169.254/latest/meta-data/spot/instance-action
# Returns: {"action": "terminate", "time": "2024-01-15T12:00:00Z"}
```

### 13.4 Savings Plans

```
Savings Plans:
  - Commit to a consistent amount of compute usage ($/hr) for 1 or 3 years
  - More flexible than Reserved Instances
  - Two types:

  1. Compute Savings Plans (most flexible, up to 66% off):
     - Applies to ANY instance family, size, AZ, region, OS, tenancy
     - Also applies to Lambda and Fargate
     - Best if workloads may change over time

  2. EC2 Instance Savings Plans (less flexible, up to 72% off):
     - Commit to specific instance family in a specific region
     - Can change size, OS, tenancy within that family
     - Best if you know you'll stay with same instance family

  How it works:
    You commit to e.g., $10/hour of compute usage for 3 years
    Any usage up to $10/hr is billed at the discounted rate
    Any usage ABOVE $10/hr is billed at On-Demand rate

Comparison:
  Flexibility:     Savings Plans > Convertible RI > Standard RI
  Max discount:    Standard RI (72%) > EC2 SP (72%) > Compute SP (66%)
  Applies to:      RI = EC2 only, Compute SP = EC2 + Lambda + Fargate
```

```
Real-world pricing strategy:

  1. Baseline capacity     → Reserved Instances or Savings Plans (cheapest)
  2. Predictable scaling   → Scheduled scaling with On-Demand
  3. Variable scaling      → Auto Scaling with On-Demand
  4. Fault-tolerant batch  → Spot Instances (huge savings)
  5. Dev/test environments → Spot or On-Demand (stop when not in use)

  Example: E-commerce website
    ├── 4x m6i.large (always on)        → 3-year RI = $0.037/hr each
    ├── ASG scales 0-6 more on demand   → On-Demand = $0.096/hr each
    ├── Nightly data processing          → Spot c5.2xlarge = $0.07/hr (vs $0.34)
    └── Dev environment                  → Spot t3.medium, stop after hours
```

---

## 14. Interview Questions & Answers

### Beginner

---

**Q1: What is Amazon EC2 and what are its main benefits?**

Amazon EC2 (Elastic Compute Cloud) is a web service that provides resizable virtual servers (instances) in the cloud. You launch instances with the OS, compute, memory, storage, and networking you need. The main benefits are: **elasticity** (scale up/down in minutes), **complete control** (root access, any OS), **flexible pricing** (On-Demand, Reserved, Spot), **reliability** (99.99% SLA across multiple AZs), and **integration** with other AWS services (VPC, EBS, ELB, IAM, CloudWatch). You pay only for what you use with per-second billing.

---

**Q2: What is the difference between a Security Group and a Network ACL (NACL)?**

Security Groups operate at the **instance level** and are **stateful** — if you allow inbound traffic, the return traffic is automatically allowed. They support only ALLOW rules and evaluate all rules together (most permissive wins). NACLs operate at the **subnet level** and are **stateless** — you must explicitly allow both inbound and outbound traffic. NACLs support both ALLOW and DENY rules and evaluate rules in numbered order (first match wins). In practice, you use NACLs for broad subnet-level blocking (e.g., denying a known malicious IP range) and Security Groups for fine-grained instance-level access control (e.g., only ALB can reach port 8080).

---

**Q3: What is an AMI and why would you create a custom one?**

An AMI (Amazon Machine Image) is a template that contains the operating system, application server, applications, and configurations needed to launch an EC2 instance. You create custom AMIs to **pre-bake** your application and dependencies so new instances launch faster (no need to install software at boot time), to **ensure consistency** (every instance starts identical), and for **security hardening** (bake in patches and compliance settings). This is the "golden image" pattern commonly used with Auto Scaling — when the ASG launches a new instance, it boots from your custom AMI and is ready to serve traffic in seconds rather than minutes.

---

**Q4: What happens when you stop vs. terminate an EC2 instance?**

When you **stop** an instance: the instance shuts down, the public IP is released (unless it has an Elastic IP), the EBS root volume persists, instance store data is lost, and you stop paying for compute (but still pay for EBS storage). When you start it again, it may move to different hardware and gets a new public IP. When you **terminate** an instance: it is permanently deleted, the EBS root volume is deleted by default (configurable with `DeleteOnTermination`), and it cannot be undone. Always enable **termination protection** on production instances to prevent accidental deletion.

---

**Q5: What are the main EBS volume types and when would you use each?**

The four main types are: **gp3** (General Purpose SSD) — the default choice for most workloads including boot volumes, web servers, and dev environments; it provides a baseline of 3,000 IOPS and 125 MB/s which you can increase independently of volume size. **io2** (Provisioned IOPS SSD) — for databases requiring guaranteed, sustained IOPS with sub-millisecond latency (up to 64,000 IOPS). **st1** (Throughput Optimized HDD) — for big data and log processing where high sequential throughput matters (up to 500 MB/s) but not random I/O. **sc1** (Cold HDD) — the cheapest option for infrequently accessed data. Note that only SSD types (gp3, io2) can be used as boot volumes.

---

### Intermediate

---

**Q6: Explain the difference between ALB, NLB, and when to use each.**

**ALB (Application Load Balancer)** operates at Layer 7 (HTTP/HTTPS) and supports advanced routing — path-based (`/api/*` to one target group, `/static/*` to another), host-based (`api.example.com` vs `www.example.com`), header-based, and query string routing. It is ideal for web applications, microservices, and container-based architectures. **NLB (Network Load Balancer)** operates at Layer 4 (TCP/UDP) and is designed for extreme performance — it can handle millions of requests per second with ultra-low latency. NLB provides static IP addresses (one per AZ) and preserves the client's source IP natively. Use NLB for gaming servers, IoT, financial applications, or when you need static IPs. In practice: if your application speaks HTTP, use ALB; if it needs raw TCP/UDP performance or static IPs, use NLB.

---

**Q7: How does Auto Scaling work and what is Target Tracking?**

Auto Scaling maintains a fleet of EC2 instances at the right capacity. It has three components: a **Launch Template** (what to launch), an **Auto Scaling Group** (where and how many — min/max/desired), and **Scaling Policies** (when to scale). **Target Tracking** is the recommended scaling policy — you specify a target value for a metric (e.g., "keep average CPU at 50%"), and ASG automatically adds or removes instances to maintain that target, similar to a thermostat. It handles cooldown internally and creates the CloudWatch alarms for you. It is simpler and more effective than step scaling or simple scaling for most use cases. Common target metrics include CPU utilization, request count per target (from ALB), and custom CloudWatch metrics.

---

**Q8: What is the difference between a public subnet and a private subnet? How does a private instance access the internet?**

The difference is in the **route table**. A public subnet has a route to an **Internet Gateway** (`0.0.0.0/0 → IGW`), allowing instances with public IPs to directly communicate with the internet. A private subnet does **not** have this route, so instances cannot be reached from the internet. For a private instance to access the internet (e.g., for software updates or API calls), traffic flows through a **NAT Gateway**: private instance sends traffic to the NAT Gateway (placed in a public subnet), the NAT Gateway forwards it through the Internet Gateway to the internet, and responses return the same path. The NAT Gateway performs network address translation, so the private instance's private IP is never exposed. NAT Gateway costs about $0.045/hour plus data processing charges.

---

**Q9: How would you design a highly available architecture on EC2?**

A highly available EC2 architecture spans **multiple Availability Zones**: deploy instances in at least 2 AZs using an **Auto Scaling Group** with a minimum of 2 instances. Place an **Application Load Balancer** in front to distribute traffic across AZs — if one AZ fails, the ALB routes traffic to healthy instances in the other AZ. Use **EBS volumes** in each AZ (they are AZ-specific) and automate backups with snapshots that can be restored in another AZ. For databases, use **Multi-AZ RDS** or replicate across AZs. Set proper **health checks** (ELB health check, not just EC2 status) so unhealthy instances are replaced automatically. Use an **Elastic IP** or DNS (Route 53) for a stable endpoint. The ASG should have a health check grace period long enough for instances to boot and pass checks before being considered unhealthy.

---

**Q10: Explain VPC Peering vs VPC Endpoints. When would you use each?**

**VPC Peering** connects two VPCs privately over AWS's network, allowing resources in each VPC to communicate using private IPs as if they were in the same network. It works cross-account and cross-region. Use it for connecting your application VPC to a shared services VPC (logging, monitoring) or connecting dev and staging environments. Key limitations: it is not transitive (A↔B and B↔C does not mean A↔C), and CIDRs cannot overlap.

**VPC Endpoints** connect your VPC to AWS services (S3, DynamoDB, SQS, etc.) privately, without traffic going over the internet. **Gateway endpoints** (for S3 and DynamoDB) are free and added as routes. **Interface endpoints** (for most other services) create ENIs in your subnet with private IPs and cost ~$0.01/hr. Use endpoints when your private instances need to access AWS services without a NAT Gateway (saves the $0.045/GB data processing cost) or when compliance requires traffic to stay on the AWS network.

---

### Advanced

---

**Q11: How would you implement a blue/green deployment strategy on EC2 with Auto Scaling?**

In blue/green deployment, "blue" is the current production environment and "green" is the new version. Here is the approach with EC2:

1. **Create a new Launch Template version** with the updated AMI (green).
2. **Create a new Auto Scaling Group** (green ASG) using the new template, with the same configuration as the blue ASG.
3. **Create a new Target Group** and register the green ASG.
4. **Test the green environment** independently (internal ALB or separate listener).
5. **Switch traffic** by updating the ALB listener to point to the green Target Group — or use weighted target groups to gradually shift traffic (canary: 10% green, then 50%, then 100%).
6. **Monitor** CloudWatch metrics, error rates, and latency after the switch.
7. **Rollback** if issues arise by switching the listener back to the blue Target Group.
8. **Decommission** the blue ASG after confirming the green environment is stable.

An alternative approach uses a single ASG with an **instance refresh**: update the launch template, then start an instance refresh with `MinHealthyPercentage=90` and `InstanceWarmup=300`. The ASG replaces instances in rolling fashion, maintaining availability throughout.

---

**Q12: You have a production EC2 instance with high CPU usage and growing latency. Walk through your troubleshooting approach.**

1. **CloudWatch metrics**: Check CPUUtilization, NetworkIn/Out, DiskReadOps, StatusCheckFailed. Determine if this is a sustained trend or a spike.
2. **SSH into the instance** and run `top` or `htop` to identify the process consuming CPU. Check if it is your application, a background job, or a system process.
3. **Check if the instance is right-sized**: If the application has genuinely outgrown the instance, vertical scaling (larger instance type) or horizontal scaling (add instances behind a load balancer) is needed.
4. **Application-level investigation**: Check application logs, database queries (slow query log), memory usage (`free -m`), disk I/O (`iostat`), and open connections (`netstat`).
5. **Check for instance store or EBS issues**: If EBS, check `VolumeQueueLength` and `VolumeReadOps` — the volume might be throttled. Upgrade from gp2 to gp3 or increase provisioned IOPS.
6. **Check if Enhanced Networking is enabled**: For network-intensive workloads, ensure ENA (Elastic Network Adapter) is enabled.
7. **Short-term fix**: If using Auto Scaling, verify scaling policies are working and the ASG is not at maximum capacity. If single instance, consider an immediate vertical scale (stop, change type, start).
8. **Long-term fix**: Implement proper monitoring/alerting, right-size the instance, optimize the application, and implement Auto Scaling if not already in place.

---

**Q13: Explain the difference between Spot Instances, Spot Fleets, and Spot placement scores. How would you architect a fault-tolerant batch processing system using Spot?**

**Spot Instances** use unused EC2 capacity at up to 90% discount but can be reclaimed with a 2-minute warning. **Spot Fleet** is a collection of Spot (and optionally On-Demand) instances that maintains your target capacity — if one Spot instance is reclaimed, the fleet launches a replacement. The `capacityOptimized` allocation strategy selects pools with the most available capacity, reducing interruptions. **Spot placement scores** (1-10) indicate the likelihood that a Spot request will succeed in a specific region/AZ for a given instance type.

For a fault-tolerant batch processing system:
1. **Diversify instance types**: Use 6+ instance types across 3+ AZs to reduce interruption risk (e.g., c5.xlarge, c5a.xlarge, c6i.xlarge, m5.xlarge, m6i.xlarge).
2. **Use Spot Fleet or ASG with mixed instances policy** and `capacityOptimized` allocation.
3. **Checkpoint work**: Design jobs to save progress periodically so interrupted work can resume, not restart.
4. **Handle interruptions gracefully**: Monitor the instance metadata endpoint (`/latest/meta-data/spot/instance-action`) or use CloudWatch Events for the EC2 Spot Interruption Warning to drain work within 2 minutes.
5. **Use SQS as a job queue**: Workers pull jobs from SQS, process them, and delete the message. If a Spot instance is terminated, the message returns to the queue (visibility timeout) and another worker picks it up.
6. **Mix Spot and On-Demand**: Use an ASG with 80% Spot / 20% On-Demand as a baseline to ensure minimum capacity even during Spot shortages.

---

**Q14: How would you design a VPC for a multi-tier web application that is secure, highly available, and cost-effective?**

```
VPC: 10.0.0.0/16

  ┌─── AZ us-east-1a ────────────────┐  ┌─── AZ us-east-1b ────────────────┐
  │                                   │  │                                   │
  │  Public Subnet 10.0.1.0/24       │  │  Public Subnet 10.0.2.0/24       │
  │  ├── ALB (internet-facing)        │  │  ├── ALB (internet-facing)        │
  │  ├── NAT Gateway                  │  │  ├── NAT Gateway (HA)             │
  │  └── Bastion Host (optional)      │  │  └── (standby bastion)            │
  │                                   │  │                                   │
  │  App Subnet 10.0.3.0/24 (private)│  │  App Subnet 10.0.4.0/24 (private)│
  │  ├── EC2 app servers (ASG)        │  │  ├── EC2 app servers (ASG)        │
  │  └── ECS/EKS containers          │  │  └── ECS/EKS containers          │
  │                                   │  │                                   │
  │  DB Subnet 10.0.5.0/24 (private) │  │  DB Subnet 10.0.6.0/24 (private) │
  │  ├── RDS Primary                  │  │  ├── RDS Standby (Multi-AZ)       │
  │  └── ElastiCache Primary          │  │  └── ElastiCache Replica          │
  │                                   │  │                                   │
  └───────────────────────────────────┘  └───────────────────────────────────┘
```

**Security layers**: (1) NACLs on each subnet tier to block known bad IPs and restrict inter-tier communication. (2) Security Groups: ALB SG allows 80/443 from the internet; App SG allows traffic only from ALB SG on app port; DB SG allows traffic only from App SG on database port. (3) No public IPs on app/DB instances. (4) VPC Flow Logs enabled for auditing. (5) VPC endpoints for S3 and DynamoDB to avoid NAT charges and keep traffic private. (6) Session Manager instead of SSH (no port 22 open).

**High availability**: ALB in 2+ AZs, ASG spanning 2+ AZs with min=2, RDS Multi-AZ, ElastiCache Multi-AZ, NAT Gateway per AZ. **Cost optimization**: Use NAT Gateway in only one AZ for non-critical environments, use VPC endpoints to save NAT data processing costs, right-size subnets (don't use /16 for subnets that need 50 IPs).

---

**Q15: A company is migrating from on-premises to AWS. They have 200 servers of varying sizes, some with bursty workloads and some with steady-state usage. How would you advise them on EC2 instance selection and pricing strategy?**

**Step 1 — Assessment and right-sizing**: Use AWS Migration Hub and the AWS Application Discovery Service to profile existing server utilization (CPU, memory, disk, network). Most on-premises servers are over-provisioned — typically 20-40% average utilization. Map each server to the closest EC2 instance type, then right-size down.

**Step 2 — Instance type mapping**:
- Bursty workloads with low average CPU → **t3/t4g** (burstable instances earn CPU credits when idle, spend them during bursts). If burstable credit model does not fit, use t3 unlimited (pay for extra burst).
- Steady-state web/app servers → **m6i/m7g** (general purpose). Consider **Graviton (m7g)** for 20% cost savings if the application runs on Linux.
- Database servers → **r6i/r7g** (memory optimized) if self-managed; otherwise migrate to RDS.
- Batch/compute jobs → **c6i/c7g** (compute optimized) with Spot for fault-tolerant jobs.

**Step 3 — Pricing strategy**:
- Identify 60-70% of servers that are always on and steady → **Reserved Instances (3-year, Partial Upfront)** or **Compute Savings Plans** for maximum flexibility. This covers baseline capacity at 40-60% savings.
- The remaining 30-40% that scale up/down → **On-Demand** through Auto Scaling.
- Batch processing and non-critical jobs → **Spot Instances** (60-90% savings).
- Dev/test environments → **Spot** or On-Demand with aggressive scheduling (stop instances outside business hours using AWS Instance Scheduler).

**Step 4 — Migration approach**: Start with a pilot of 10-20 servers. Use "lift and shift" first (rehost on EC2 as-is), then optimize (right-size, modernize) in a second phase. Monitor with CloudWatch and AWS Cost Explorer for 2-4 weeks before committing to Reserved Instances. Use the AWS Compute Optimizer recommendations for ongoing right-sizing suggestions.

---

**Q16: Explain how EC2 instance metadata and user data work. What are the security implications of IMDSv1 vs IMDSv2?**

**Instance metadata** is data about your instance available at `http://169.254.169.254/latest/meta-data/` from within the instance. It includes the instance ID, instance type, public/private IP, IAM role credentials, security group IDs, and more. **User data** is a script (bash or cloud-init) you provide at launch time that runs once on first boot (or on every boot if configured) — typically used to install software, configure the instance, or pull application code.

**IMDSv1** (Instance Metadata Service v1) uses simple HTTP GET requests with no authentication. This is a security risk: if an attacker achieves SSRF (Server-Side Request Forgery) on your application, they can query the metadata endpoint and steal IAM role credentials. This was the attack vector in the 2019 Capital One breach.

**IMDSv2** adds a session-based authentication mechanism: the client must first send a PUT request to get a session token (with a TTL you specify), then include that token in the `X-aws-ec2-metadata-token` header on subsequent GET requests. This mitigates SSRF attacks because: (1) most SSRF vulnerabilities only allow GET requests, not PUT, (2) the token header prevents simple proxy-based attacks, and (3) you can set a short hop limit (TTL=1) so the token cannot be forwarded from containers.

**Best practice**: Enforce IMDSv2 by setting `HttpTokens: required` in the launch template. This is now the default for new instances. Additionally, restrict IAM role permissions to the minimum required (least privilege), and use VPC endpoints to reduce reliance on instance metadata for service access.

```bash
# Enforce IMDSv2 on a new instance (launch template)
aws ec2 run-instances \
  --metadata-options "HttpEndpoint=enabled,HttpTokens=required,HttpPutResponseHopLimit=1"

# Enforce IMDSv2 on an existing instance
aws ec2 modify-instance-metadata-options \
  --instance-id i-0123456789abcdef0 \
  --http-tokens required \
  --http-put-response-hop-limit 1

# Using IMDSv2 from within the instance
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
curl -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id
```

---

**Q17: How do Placement Groups affect performance and availability? When would you choose each type?**

**Cluster placement groups** place all instances physically close together (same rack or nearby racks) within a single AZ. This provides the lowest inter-instance latency (sub-millisecond) and up to 10 Gbps of bandwidth between instances using enhanced networking. Use for HPC workloads, tightly-coupled distributed computations, and real-time analytics. The trade-off is availability — a rack failure can impact all instances. Best practice: use the same instance type for all instances, and launch all at once (launching incrementally may fail due to insufficient capacity).

**Spread placement groups** place each instance on separate physical hardware (different racks), limiting risk to 1 instance per rack failure. Maximum of 7 instances per AZ. Use for small clusters of critical instances where each must be isolated (e.g., primary and replica database nodes, ZooKeeper quorum, etcd cluster).

**Partition placement groups** divide instances into logical partitions, each on separate racks. Up to 7 partitions per AZ, hundreds of instances per partition. Hadoop, Cassandra, and Kafka are topology-aware and can use partition information to place replicas on different partitions, ensuring a rack failure only affects one partition. Use for large distributed systems where you need to control failure domain isolation.

---

**Q18: Explain how EBS snapshots work internally. What is the cost and performance impact?**

EBS snapshots are **incremental, point-in-time copies** stored in S3 (AWS-managed, not visible in your console). The first snapshot copies all blocks that have data on the volume. Subsequent snapshots only copy blocks that have changed since the last snapshot — this makes them space-efficient and fast to create. Internally, each snapshot maintains pointers to all blocks needed to reconstruct the volume; deleting a snapshot only removes blocks that no other snapshot references.

**Cost**: You pay for the actual data stored, not the volume size. A 100 GB volume with 30 GB of data costs ~$0.05/GB/month for the first snapshot ($1.50/month). Incremental snapshots only add cost for changed blocks. Use the Data Lifecycle Manager (DLM) to automate creation and deletion policies.

**Performance impact**: Creating a snapshot from a running instance is safe — EBS uses a crash-consistent snapshot mechanism. However, for file system consistency, either unmount the volume, freeze I/O (`fsfreeze`), or stop the instance first. When you create a new volume from a snapshot, the data is lazily loaded from S3 — the first read of each block has higher latency until it is fetched. To avoid this latency, use **EBS Fast Snapshot Restore (FSR)** which pre-warms the volume, or run `dd` / `fio` to read all blocks after creating the volume (called "initialization"). FSR costs ~$0.75/hr per AZ per snapshot.

---

## References

- [AWS EC2 User Guide](https://docs.aws.amazon.com/ec2) — Official EC2 documentation
- [AWS VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide) — VPC networking documentation
- [AWS ELB User Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide) — Load balancer documentation
