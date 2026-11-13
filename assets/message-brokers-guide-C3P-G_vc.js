const e=`# Message Brokers: Kafka and RabbitMQ — Interview Guide

A message broker sits between the services that produce messages and the services that consume them, so neither has to be up, fast or even known to the other at the same moment. **Apache Kafka** and **RabbitMQ** are the two brokers backend interviews ask about most, and the most common question is the comparison: **when would you pick each?** This guide covers both, side by side.

How brokers fit into a microservice design (sync vs async calls, sagas, the outbox pattern) is in the [Microservices guide](/backend/microservices#4-communication-sync-vs-async); Redis Streams, the lightweight option, is in the [Redis guide](/backend/redis#8-pubsub-and-streams). The things interviewers probe hardest: **partitions and ordering** (§4), **consumer groups and offsets** (§5), **delivery guarantees** (§7), **acknowledgements** (§12) and **dead-letter queues** (§13).

## Table of Contents

1. [Why a Message Broker](#1-why-a-message-broker)
2. [Two Models: the Queue and the Log](#2-two-models-the-queue-and-the-log)
3. [Kafka Architecture](#3-kafka-architecture)
4. [Partitions, Keys and Ordering](#4-partitions-keys-and-ordering)
5. [Consumer Groups and Offsets](#5-consumer-groups-and-offsets)
6. [Replication and Durability in Kafka](#6-replication-and-durability-in-kafka)
7. [Delivery Guarantees](#7-delivery-guarantees)
8. [Retention, Compaction and Replay](#8-retention-compaction-and-replay)
9. [Queues for Kafka: Share Groups](#9-queues-for-kafka-share-groups)
10. [RabbitMQ Architecture](#10-rabbitmq-architecture)
11. [Exchanges, Bindings and Routing Keys](#11-exchanges-bindings-and-routing-keys)
12. [Acknowledgements, Prefetch and Durability](#12-acknowledgements-prefetch-and-durability)
13. [Retries and Dead-Letter Queues](#13-retries-and-dead-letter-queues)
14. [Kafka vs RabbitMQ: When to Choose Each](#14-kafka-vs-rabbitmq-when-to-choose-each)
15. [Real-World Patterns](#15-real-world-patterns)
16. [Interview Questions and Answers](#16-interview-questions-and-answers)
17. [Tricky Questions](#17-tricky-questions)
18. [Cheat Sheet](#18-cheat-sheet)
19. [References](#19-references)

---

## 1. Why a Message Broker

Without a broker, the order service calls the email, inventory and analytics services directly. If any of them is slow or down, checkout is slow or fails. With a broker, the order service publishes one \`OrderPlaced\` message and returns.

What a broker buys you:

- **Decoupling in time**: the consumer can be down; messages wait.
- **Load levelling**: a burst of 10,000 orders a second is absorbed by the broker, and workers drain it at the rate they can handle.
- **Fan-out**: one event reaches many independent consumers, and adding a consumer doesn't change the producer.
- **Retries and isolation**: a failing consumer retries its own messages without affecting the producer or other consumers.

What it costs: another system to run, **eventual consistency** (the email arrives a second after checkout, not inside its transaction), duplicate messages you must handle, and harder debugging, because a request no longer has one call stack.

> [!KEY]
> Use a broker when the caller doesn't need the result to answer its own request. If the user is waiting on the answer (a price, a permission check), a synchronous call is simpler.

---

## 2. Two Models: the Queue and the Log

Most of the Kafka-vs-RabbitMQ differences follow from one design choice.

| Aspect | Queue (RabbitMQ) | Log (Kafka) |
|---|---|---|
| What the broker stores | Messages waiting to be processed | An ordered, append-only file per partition |
| When a message is removed | When a consumer acknowledges it | When retention expires (time or size), whether read or not |
| Who tracks progress | The broker, per message | The consumer, as an offset (a position in the log) |
| Several consumers on one queue/partition | Compete: each message goes to one of them | In one group, one consumer per partition; other groups read independently |
| Replay old messages | No (once acked, gone) | Yes: move the offset back |
| Routing | Rich, in the broker (exchanges, bindings) | None: producers choose the topic and partition |

RabbitMQ is often described as a **smart broker with simple consumers**: it routes, tracks every message and redelivers. Kafka is a **simple broker with smart consumers**: it appends and serves bytes in order, and consumers decide where to read from. Both have since grown toward each other (RabbitMQ streams are a log; Kafka share groups are a queue), but the default models still drive most design answers.

---

## 3. Kafka Architecture

\`\`\`mermaid
flowchart LR
  P1[Producer] --> T0
  P2[Producer] --> T1
  P2 --> T2
  subgraph Topic orders
    T0[Partition 0]
    T1[Partition 1]
    T2[Partition 2]
  end
  T0 --> C1[Consumer A1]
  T1 --> C1
  T2 --> C2[Consumer A2]
  T0 --> D1[Consumer B1]
  T1 --> D1
  T2 --> D1
\`\`\`

In the diagram, group A has two consumers sharing three partitions; group B has one consumer reading all three, independently of group A.

- **Broker**: a Kafka server. A cluster has several, and each stores some partitions.
- **Topic**: a named stream of records, such as \`orders\`.
- **Partition**: a topic is split into partitions, each an ordered, append-only log stored on disk as segment files. Partitions are the unit of parallelism, ordering and replication.
- **Offset**: a record's position in its partition (0, 1, 2…). Offsets never change and are never reused.
- **Record**: a key (optional), a value, a timestamp and headers. Kafka treats key and value as bytes; serialisation (JSON, Avro, Protobuf) is the client's job, often with a schema registry.
- **Controller**: the brokers that manage cluster metadata (which broker leads which partition). Since **Kafka 4.0 (March 2025)** this is **KRaft only**, Kafka's own Raft-based quorum; ZooKeeper is no longer supported. Older material that mentions ZooKeeper describes Kafka 3.x and earlier.

Kafka is fast because it writes sequentially to an append-only log, leans on the OS page cache rather than its own cache, batches and compresses records, and sends data from disk to the network without copying it through the application (zero-copy \`sendfile\`).

---

## 4. Partitions, Keys and Ordering

**Kafka guarantees order only within a partition.** There is no ordering across partitions of a topic.

The producer picks the partition:

- **With a key**: \`hash(key) % numberOfPartitions\` (the Java client uses murmur2). Every record with key \`order-1001\` lands in the same partition, so events for one order stay in order.
- **Without a key**: the producer spreads records across partitions, filling a batch for one partition before moving to the next (the sticky partitioner), for better batching.

\`\`\`js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'orders-api', brokers: ['localhost:9092'] });
const producer = kafka.producer({ idempotent: true });

async function publishOrderEvent(order, type) {
  await producer.connect();
  await producer.send({
    topic: 'orders',
    acks: -1, // -1 means acks=all
    messages: [
      // Same key → same partition → events for this order stay in order.
      { key: String(order.id), value: JSON.stringify({ type, order }) },
    ],
  });
}
\`\`\`

Choosing the key is choosing the unit of ordering. Key by \`orderId\` if each order's events must be in order; key by \`customerId\` if all of a customer's events must be. A key that is too coarse (one tenant with most of the traffic, or a constant key) makes a **hot partition** that one consumer has to handle alone.

**How many partitions?** Enough for the parallelism you need, since a group can't have more active consumers than partitions; a common starting point is your expected peak consumer count with room to grow. Too many partitions cost metadata, open files and longer leader elections.

> [!TRAP]
> You can add partitions to a topic later, but \`hash(key) % partitions\` then sends existing keys to different partitions. New events for \`order-1001\` land in a new partition while old ones are still being consumed from the old one, so per-key ordering breaks during the change. Size partitions up front for keyed topics, or migrate to a new topic.

---

## 5. Consumer Groups and Offsets

A **consumer group** is a set of consumers sharing a \`group.id\` that divides a topic's partitions between them. Each partition is read by **exactly one** consumer in the group; each group gets every record.

- 6 partitions, 3 consumers: each consumer reads 2 partitions.
- 6 partitions, 6 consumers: one each.
- 6 partitions, 8 consumers: 2 consumers sit idle.
- Two groups (\`billing\` and \`analytics\`) on the same topic: each reads everything, independently.

**Offsets.** The consumer records how far it has got by **committing** an offset per partition to the internal topic \`__consumer_offsets\`. The committed offset is the *next* offset to read. After a restart or a rebalance, consumption resumes from the committed offset.

- **Auto-commit** (\`enable.auto.commit=true\`, the default in the Java client, every 5 seconds) commits in the background. If the consumer crashes after processing records but before the next commit, they are processed again. If your code hands records to another thread and auto-commit runs before that thread finishes, a crash **loses** them.
- **Manual commit after processing** gives at-least-once delivery: process, then commit. A crash between the two means a redelivery, so processing must be idempotent.

\`\`\`js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({ clientId: 'billing', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'billing' });

async function charge(event) {
  // Stand-in for real work. It must be idempotent: the same event can arrive twice.
  return event;
}

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: false });
  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      await charge(JSON.parse(message.value.toString()));
      // Commit the NEXT offset to read, only after the work succeeded.
      const next = (BigInt(message.offset) + 1n).toString();
      await consumer.commitOffsets([{ topic, partition, offset: next }]);
    },
  });
}
\`\`\`

**Rebalancing** reassigns partitions when a consumer joins, leaves, or is considered dead. A consumer is considered dead if it stops heartbeating (\`session.timeout.ms\`) or doesn't call \`poll\` again within \`max.poll.interval.ms\` (5 minutes by default), which happens when processing one batch takes too long.

- The classic **eager** protocol stopped every consumer during a rebalance. **Cooperative incremental** rebalancing only moves the partitions that need to move.
- **Static membership** (\`group.instance.id\`) lets a restarting consumer rejoin with its old partitions without triggering a rebalance, which helps rolling deploys.
- Kafka 4.0 made the **new consumer group protocol** (KIP-848, \`group.protocol=consumer\`) generally available. It moves assignment to the broker and rebalances incrementally, so one slow consumer no longer stalls the whole group.

**Consumer lag** is the gap between the latest offset in a partition and the group's committed offset. It is the main health metric for a consumer: growing lag means consumers can't keep up.

---

## 6. Replication and Durability in Kafka

Each partition has a **replication factor** (typically 3): one **leader** replica, on one broker, handles all reads and writes for the partition, and **followers** on other brokers copy it.

- The **ISR** (in-sync replicas) is the set of replicas fully caught up with the leader. A follower that falls too far behind (\`replica.lag.time.max.ms\`) drops out of the ISR.
- The **high watermark** is the highest offset copied to every ISR member. Consumers only see records up to it, so they never read a record that could disappear in a failover.
- If the leader fails, a new leader is chosen from the ISR. \`unclean.leader.election.enable=false\` (the default) forbids electing an out-of-sync replica, choosing unavailability over data loss.

The producer's \`acks\` setting decides when a write counts as done:

| \`acks\` | The producer waits for | Can lose data when |
|---|---|---|
| \`0\` | Nothing | Any failure; fire-and-forget |
| \`1\` | The leader to write it | The leader dies before followers copy it |
| \`all\` (\`-1\`, the default since Kafka 3.0) | Every replica currently in the ISR | Only if the ISR has shrunk to the leader alone and it dies |

\`acks=all\` depends on **\`min.insync.replicas\`**. With the default of 1, the ISR can shrink to just the leader and \`acks=all\` then means "the leader has it", the same as \`acks=1\`. The durable configuration is:

\`\`\`text
replication.factor=3
min.insync.replicas=2        # a write needs the leader + at least one follower
acks=all                     # producer
enable.idempotence=true      # producer (default since 3.0)
\`\`\`

With these settings, losing one broker leaves writes working; losing two makes writes fail with \`NotEnoughReplicas\` rather than accepting writes that only one machine holds.

---

## 7. Delivery Guarantees

| Guarantee | Meaning | How you get it |
|---|---|---|
| At most once | Never duplicated, may be lost | Commit (or ack) before processing |
| At least once | Never lost, may be duplicated | Process, then commit/ack; the default target |
| Exactly once | Effect happens once | Idempotent processing, or Kafka transactions for Kafka-to-Kafka |

**Duplicates come from both ends.** A producer retries a send whose acknowledgement was lost, so the broker gets the record twice. A consumer processes a record and crashes before committing, so it gets the record again.

**Kafka's idempotent producer** (\`enable.idempotence=true\`, the default since 3.0) removes the producer side: each producer has an ID and numbers its records per partition, and the broker drops a retried duplicate. It also keeps order intact with up to 5 in-flight requests per connection.

**Kafka transactions** make "read from topic A, process, write to topic B, and commit A's offsets" atomic. The producer uses a \`transactional.id\`; consumers downstream set \`isolation.level=read_committed\` so they never see records from aborted transactions (the default, \`read_uncommitted\`, does). Kafka Streams turns this on with \`processing.guarantee=exactly_once_v2\`.

**Exactly-once stops at Kafka's edge.** If processing sends an email, charges a card or writes to Postgres, a Kafka transaction can't roll that back. For side effects outside Kafka, the answer is always **at-least-once delivery plus an idempotent consumer**:

- Store a processed-message ID (or the business key, such as \`paymentId\`) with a unique constraint, in the same database transaction as the effect.
- Make the operation naturally idempotent (\`UPSERT\`, "set status to PAID" rather than "add 10").
- Pass an idempotency key to the external API.

> [!KEY]
> "Exactly once" in practice means at-least-once delivery plus idempotent processing. Kafka's exactly-once semantics only cover reading from and writing to Kafka itself.

---

## 8. Retention, Compaction and Replay

Kafka keeps records whether or not anyone has read them, until a retention rule removes them:

- **Delete policy** (\`cleanup.policy=delete\`, the default): drop whole segments older than \`retention.ms\` (7 days by default) or beyond \`retention.bytes\`.
- **Compaction** (\`cleanup.policy=compact\`): keep at least the **latest record for each key** and remove older ones in the background. A record with a null value (a **tombstone**) deletes the key, and is itself removed after \`delete.retention.ms\`. A compacted topic is a changelog: replaying it rebuilds the current state of every key. \`__consumer_offsets\` is a compacted topic.

**Replay** is the log's superpower. A new service can read the topic from the beginning to build its own view; a buggy consumer can be fixed and its group's offsets reset to reprocess:

\`\`\`text
kafka-consumer-groups.sh --bootstrap-server localhost:9092 \\
  --group billing --topic orders \\
  --reset-offsets --to-datetime 2026-11-12T00:00:00.000 --execute
\`\`\`

(The group must have no active consumers while you reset it.)

---

## 9. Queues for Kafka: Share Groups

Classic consumer groups can't have more consumers than partitions, and one slow record blocks the rest of its partition. **Share groups** (KIP-932, "Queues for Kafka") add queue semantics on top of topics: early access in Kafka 4.0, preview in 4.1 and **generally available in Kafka 4.2 (February 2026)**.

- Many consumers in a share group can read the **same partition**; records are handed out individually.
- Each record is **acknowledged individually** (accept, release for redelivery, or reject), like a RabbitMQ ack.
- A record is redelivered if its lock times out, and the number of delivery attempts is capped so a poison message can't loop forever.
- The trade-off: **no ordering guarantee** within a share group, and they don't take part in Kafka transactions.

Share groups make Kafka a reasonable choice for job-queue workloads it used to handle badly, but RabbitMQ still has the richer routing, priorities and per-message features.

---

## 10. RabbitMQ Architecture

RabbitMQ implements **AMQP 0-9-1** (and, since RabbitMQ 4.0, AMQP 1.0 natively, plus MQTT and STOMP through plugins).

\`\`\`mermaid
flowchart LR
  P[Producer] -->|routing key order.paid.eu| X{{Topic exchange: events}}
  X -->|binding order.*.eu| Q1[Queue: eu-billing]
  X -->|binding order.#| Q2[Queue: audit]
  X -.->|no match| N[dropped unless mandatory]
  Q1 --> C1[Consumer]
  Q2 --> C2[Consumer]
\`\`\`

- **Producers never publish to a queue.** They publish to an **exchange** with a **routing key**.
- An **exchange** routes each message to zero or more queues according to its type and **bindings**.
- A **binding** is a rule linking an exchange to a queue (with a binding key or header match).
- A **queue** stores messages until a consumer acknowledges them.
- A **connection** is one TCP connection; a **channel** is a lightweight session multiplexed over it. Open one connection per process and a channel per thread, not a connection per message.
- A **virtual host** (vhost) is an isolated namespace of exchanges, queues and permissions, like a database in Postgres.

**Queue types (as of RabbitMQ 4.x):**

| Type | What it is | Use for |
|---|---|---|
| Classic | A single-node queue (not replicated) | Temporary, non-critical or per-client reply queues |
| Quorum | Replicated across nodes with the Raft consensus protocol; always durable | Anything you can't lose; the default choice for important work |
| Stream | An append-only, replicated log with replay by offset (since 3.9) | Large fan-out, replay, Kafka-like use inside RabbitMQ |

**Classic mirrored queues were removed in RabbitMQ 4.0** after years of deprecation; quorum queues replace them for high availability. An answer that says "use mirrored queues for HA" is out of date.

---

## 11. Exchanges, Bindings and Routing Keys

| Exchange type | Routes a message to | Example |
|---|---|---|
| **Direct** | Queues whose binding key equals the routing key exactly | Routing key \`pdf\` → the \`pdf-jobs\` queue |
| **Fanout** | Every bound queue; ignores the routing key | Broadcast \`cache.invalidate\` to every app instance |
| **Topic** | Queues whose binding pattern matches the dotted routing key | \`order.*.eu\`, \`order.#\` |
| **Headers** | Queues whose binding matches message headers (\`x-match: all\` or \`any\`) | Route by \`format=pdf\` and \`region=eu\` |

**Topic patterns:** the routing key is words separated by dots. \`*\` matches **exactly one** word; \`#\` matches **zero or more** words.

| Routing key | \`order.*.eu\` | \`order.#\` | \`*.paid.*\` |
|---|---|---|---|
| \`order.paid.eu\` | Yes | Yes | Yes |
| \`order.paid\` | No | Yes | No |
| \`order.paid.eu.retry\` | No | Yes | No |
| \`refund.paid.us\` | No | No | Yes |

**The default exchange** (named \`""\`) is a direct exchange that every queue is bound to by its own name, which is why \`channel.sendToQueue('jobs', …)\` seems to publish straight to a queue.

\`\`\`js
import amqp from 'amqplib';

async function setUp() {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createConfirmChannel();

  await ch.assertExchange('events', 'topic', { durable: true });
  await ch.assertQueue('eu-billing', { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  await ch.bindQueue('eu-billing', 'events', 'order.*.eu');

  const body = Buffer.from(JSON.stringify({ orderId: 1001 }));
  ch.publish('events', 'order.paid.eu', body, { persistent: true, mandatory: true });
  await ch.waitForConfirms(); // the broker has taken responsibility for the message
  return ch;
}
\`\`\`

> [!TRAP]
> If no binding matches, the exchange **silently drops** the message and the publish still "succeeds". Publish with \`mandatory: true\` to get unroutable messages returned (\`basic.return\`), or configure an **alternate exchange** that catches them.

---

## 12. Acknowledgements, Prefetch and Durability

**Consumer acknowledgements.** With manual acks, RabbitMQ keeps a delivered message as *unacked* until the consumer replies:

- \`ack\`: done; the message is removed.
- \`nack\`/\`reject\` with \`requeue: true\`: put it back in the queue (it may be redelivered immediately, to any consumer).
- \`nack\`/\`reject\` with \`requeue: false\`: discard it, or dead-letter it if a dead-letter exchange is set (§13).
- If the consumer's channel or connection closes with unacked messages, RabbitMQ requeues them and marks them \`redelivered\`.

With **automatic ack** (\`noAck: true\`) a message counts as delivered as soon as it is written to the socket, so a consumer crash loses everything in flight. Use manual acks for real work.

**Prefetch** (\`basic.qos\`) limits how many unacked messages a consumer may hold. Without it, RabbitMQ pushes the whole queue to the first consumer as fast as the network allows: one consumer holds thousands of messages in memory while the others sit idle. A prefetch of 10–100 is typical; use 1 for long, uneven jobs so they spread fairly.

\`\`\`js
import amqp from 'amqplib';

async function resize(job) {
  // Stand-in for real work; must be idempotent, since a message can be redelivered.
  return job;
}

async function work() {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.prefetch(10); // at most 10 unacked messages for this consumer
  await ch.consume('image-jobs', async (msg) => {
    if (msg === null) return; // the queue was deleted or the consumer cancelled
    try {
      await resize(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch {
      ch.nack(msg, false, false); // don't requeue; goes to the dead-letter exchange
    }
  }, { noAck: false });
}
\`\`\`

**Not losing messages takes three things together:**

1. **A durable, replicated queue**: a quorum queue (or at least \`durable: true\` for a classic queue, so the queue definition survives a restart).
2. **Persistent messages** (\`persistent: true\`, delivery mode 2), so a classic queue writes them to disk. Quorum queues always persist.
3. **Publisher confirms**: the broker acks the *publish* once it has stored (and, for quorum queues, replicated) the message. Without confirms, a message in flight when the broker dies is lost and the producer never knows.

Plus **manual consumer acks**, so a consumer crash doesn't lose what it was working on.

**Ordering.** A single queue is FIFO, but with several consumers, or after a requeue, messages are processed out of order. When order matters per entity, use **single active consumer** on the queue (only one consumer receives at a time, the others are standby), or split work into several queues by a hash of the entity ID (the consistent-hash exchange plugin does this).

---

## 13. Retries and Dead-Letter Queues

A **dead-letter exchange (DLX)** is an ordinary exchange that a queue sends messages to when they "die". A message is dead-lettered when:

- a consumer rejects or nacks it with \`requeue: false\`;
- its **TTL** expires (\`x-message-ttl\` on the queue, or \`expiration\` on the message);
- the queue is over its length limit (\`x-max-length\`) with the \`reject-publish-dlx\` or default drop-head overflow behaviour;
- a quorum queue's **delivery limit** is exceeded (RabbitMQ 4.0 set a default limit of 20 deliveries, so a poison message no longer requeues forever).

Configure it with a **policy** rather than queue arguments, so you can change it without deleting the queue:

\`\`\`text
rabbitmqctl set_policy dlx "^image-jobs$" \\
  '{"dead-letter-exchange":"dlx","dead-letter-routing-key":"image-jobs.dead"}' \\
  --apply-to queues
\`\`\`

**Retry with back-off**, without blocking the work queue:

\`\`\`mermaid
flowchart LR
  W[Queue: jobs] -->|nack, no requeue| R{{retry exchange}}
  R --> D[Queue: jobs.retry.30s<br/>TTL 30 s, DLX = work exchange]
  D -->|TTL expires| X{{work exchange}}
  X --> W
  W -->|x-death count over 5| P[Queue: jobs.parking-lot]
\`\`\`

1. The consumer fails and nacks without requeue, or republishes to a retry exchange.
2. The message waits in a retry queue that has no consumers, only a TTL and a DLX pointing back at the work exchange.
3. When the TTL expires it goes back to the work queue.
4. The \`x-death\` header counts how many times it died; after N attempts the consumer sends it to a **parking-lot queue** for a human or a repair job.

Use one retry queue per delay (\`retry.10s\`, \`retry.1m\`, \`retry.10m\`) for exponential back-off, because a per-message TTL only expires at the head of a queue (see Tricky Q6).

**In Kafka** there is no built-in DLQ for consumers. A failing record blocks its partition if you keep retrying it, so the usual pattern is **retry topics**: publish the failed record to \`orders.retry.1m\`, \`orders.retry.10m\`, and finally \`orders.dlt\` (dead-letter topic), commit the original offset and move on. Spring Kafka and Kafka Connect provide this out of the box. Accept that a retried record is then processed out of order relative to its key.

---

## 14. Kafka vs RabbitMQ: When to Choose Each

| Need | Kafka | RabbitMQ |
|---|---|---|
| Model | Partitioned log | Queues with broker-side routing |
| Throughput | Very high (millions of records a second per cluster) by batching sequential writes | High (tens of thousands a second per queue); fine for most apps |
| Ordering | Per partition, by key | Per queue, with one consumer |
| Replay and retention | Yes, days to forever | No for queues (streams yes) |
| Many independent consumers of the same events | Natural: one consumer group each | One queue per consumer, fan-out exchange |
| Routing by content | None: choose topics up front | Direct, topic, headers exchanges |
| Per-message features | Few (share groups add per-record acks) | TTLs, priorities, DLX, delayed retries |
| Typical latency | Low milliseconds, tuned for throughput | Sub-millisecond to low milliseconds |
| Consumer scaling | Up to the partition count (share groups lift that) | Add consumers freely |
| Operating it | Heavier: partitions, retention, rebalancing; KRaft simplified it | Lighter for small setups |

**Choose Kafka** for event streaming: events that several teams consume independently, analytics and data pipelines, change-data capture, event sourcing, audit logs, anything you'll want to replay, and very high throughput.

**Choose RabbitMQ** for task queues and commands: background jobs, work that needs per-message acks, retries with back-off, priorities or TTLs, request/reply, and routing by type, region or tenant without creating topics for every combination.

> [!FOLLOWUP]
> Can you use both in one system?
>
> Yes, and many companies do: Kafka as the backbone of business events (OrderPlaced, PaymentCaptured) consumed by many services and analytics, and RabbitMQ (or a cloud queue such as SQS) inside a service for its own background jobs. Each tool does what its model is good at.

**Managed alternatives** worth naming: Amazon SQS/SNS and Google Pub/Sub (queue and fan-out, no servers), Amazon Kinesis and Azure Event Hubs (Kafka-like streams), Confluent Cloud and Amazon MSK (managed Kafka), and Redis Streams for something small (see the [Redis guide](/backend/redis#8-pubsub-and-streams)).

---

## 15. Real-World Patterns

**The dual-write problem and the outbox.** A service that writes to its database and then publishes to the broker can crash between the two, leaving the database updated and the event never sent (or the event sent for a transaction that rolled back). The **transactional outbox** fixes it: write the event to an \`outbox\` table in the **same database transaction** as the business change, and have a separate relay (a poller, or change-data capture with Debezium reading the database log) publish it. Delivery is then at least once, so consumers stay idempotent. The [Microservices guide](/backend/microservices#8-sagas-and-the-outbox-pattern) covers the outbox with sagas.

**Idempotent consumer.** Record each processed message ID (or business key) in a table with a unique constraint, inside the same transaction as the effect; a duplicate violates the constraint and is skipped.

\`\`\`sql
BEGIN;
INSERT INTO processed_messages (message_id) VALUES ('evt-8f2c');  -- fails on a duplicate
UPDATE orders SET status = 'PAID' WHERE id = 1001;
COMMIT;
\`\`\`

**Ordering per entity.** Kafka: key by the entity ID. RabbitMQ: single active consumer, or a consistent-hash exchange spreading entities over several queues with one consumer each.

**Backpressure.** When consumers can't keep up, lag (Kafka) or queue depth (RabbitMQ) grows. Alert on it, autoscale consumers on it (KEDA does this on Kubernetes), and for RabbitMQ set queue length limits, because a queue that grows without limit eventually triggers the memory alarm that blocks all publishers.

**Event-carried state vs notification.** A thin event (\`OrderPlaced { id }\`) makes consumers call back for details, coupling them to the producer's API. A fat event carrying the data the consumers need avoids that, at the cost of a contract you must version (a schema registry with compatibility rules helps).

**Request/reply over RabbitMQ.** Publish with \`reply_to\` (a reply queue) and a \`correlation_id\`; the server publishes its answer to that queue with the same ID. Use it sparingly: it is a synchronous call with more moving parts.

---

## 16. Interview Questions and Answers

**Q1: What is the core difference between Kafka and RabbitMQ?**

Kafka is a distributed, partitioned **log**: records are appended to partitions and kept for a retention period whether or not they've been read, and each consumer group tracks its own position as an offset, so many groups read the same data independently and can replay it. RabbitMQ is a **queue broker**: producers publish to exchanges that route messages into queues, the broker tracks each message, and a message is removed once a consumer acknowledges it. That one difference explains the rest: Kafka gives replay, very high throughput and ordering per partition; RabbitMQ gives flexible routing, per-message acks, TTLs, priorities and dead-lettering. Kafka 4.2's share groups and RabbitMQ streams narrow the gap, but the default models still decide most designs.

**Q2: How do partitions and consumer groups work together in Kafka?**

A topic is split into partitions, and within a consumer group each partition is assigned to exactly one consumer, while each consumer may own several partitions. That makes the partition count the ceiling on parallelism for one group: with 6 partitions, a seventh consumer is idle. Different groups are independent, so \`billing\` and \`analytics\` each receive every record. When consumers join, leave or miss heartbeats, the group rebalances and partitions are reassigned; consumers then resume from each partition's last committed offset. Ordering is guaranteed only within a partition, which is why records that must stay in order share a key.

**Q3: What are offsets, and what happens if you commit them before versus after processing?**

An offset is a record's position in a partition, and a consumer group commits the next offset it wants to read, per partition, to \`__consumer_offsets\`. Committing **after** processing gives at-least-once: a crash between processing and committing replays those records, so the handler must be idempotent. Committing **before** processing gives at-most-once: a crash after the commit skips records that were never processed. Auto-commit commits on a timer, so its behaviour depends on timing; it is safe for at-least-once only if all processing finishes inside \`poll\` before the next commit, and it loses records if work is handed off to another thread.

**Q4: Explain \`acks\`, replication factor, ISR and \`min.insync.replicas\`. What's the durable configuration?**

Each partition has a leader and followers (replication factor, typically 3); the ISR is the set of replicas fully caught up with the leader. \`acks=0\` doesn't wait, \`acks=1\` waits for the leader only, and \`acks=all\` waits for every replica currently in the ISR. \`min.insync.replicas\` sets how small the ISR may get before \`acks=all\` writes are refused; at the default of 1, the ISR can shrink to the leader and \`acks=all\` silently becomes \`acks=1\`. The durable configuration is replication factor 3, \`min.insync.replicas=2\`, \`acks=all\` and the idempotent producer, with unclean leader election disabled, so one broker can fail without losing writes or availability.

**Q5: What delivery guarantees do Kafka and RabbitMQ give, and how do you achieve "exactly once"?**

Both support at-most-once (ack or commit before processing) and at-least-once (process, then ack or commit), and at-least-once is the normal target. Kafka adds an idempotent producer that removes duplicates caused by producer retries, and transactions that make consume-transform-produce between Kafka topics atomic, with downstream consumers reading \`read_committed\`. But neither broker can make an external side effect, like charging a card or writing to Postgres, happen exactly once. That takes an idempotent consumer: store processed message IDs or a business key with a unique constraint in the same transaction as the effect, or make the operation naturally idempotent. So exactly-once in practice is at-least-once delivery plus idempotent processing.

**Q6: How does Kafka guarantee ordering, and how can you break it?**

Ordering holds within a partition: records with the same key go to the same partition (by hashing the key), and one consumer in a group reads that partition in offset order. You break it by: sending related records without a key or with different keys; increasing the partition count, which remaps keys; enabling retries without the idempotent producer while allowing several in-flight requests, so a retried batch lands after a later one; processing a partition's records concurrently inside the consumer; or moving a failed record to a retry topic while later records for the same key carry on. The idempotent producer (default since 3.0) keeps order with up to 5 in-flight requests.

**Q7: Explain RabbitMQ exchanges, queues, bindings and routing keys.**

Producers publish to an exchange with a routing key, never directly to a queue. Bindings connect exchanges to queues with a binding key or header match, and the exchange type decides how routing works: direct matches the key exactly, fanout copies to every bound queue, topic matches dotted keys against patterns where \`*\` is one word and \`#\` is zero or more, and headers matches on message headers. Queues hold messages until consumers acknowledge them. The default exchange routes by queue name, which is what \`sendToQueue\` uses. If nothing matches, the message is dropped unless it was published as mandatory or the exchange has an alternate exchange.

**Q8: How do acknowledgements and prefetch work in RabbitMQ?**

With manual acks, a delivered message stays unacked until the consumer acks it (removed), nacks or rejects it with requeue (back in the queue) or without requeue (discarded or dead-lettered). If the channel closes with unacked messages, RabbitMQ requeues them and marks them redelivered, which is why consumers must be idempotent. Prefetch (\`basic.qos\`) caps how many unacked messages a consumer can hold; without it, RabbitMQ pushes as many as it can to the first consumer, which hoards them while others idle and can run out of memory. Auto-ack removes messages as soon as they're sent, so a crash loses whatever was in flight.

**Q9: How do you make sure RabbitMQ never loses a message?**

Cover every hop. The queue must survive a broker failure, so use a quorum queue, which is durable and replicated with Raft (classic mirrored queues were removed in 4.0). Messages must be persistent so classic queues write them to disk. The producer must use publisher confirms, so it knows the broker stored the message and can retry if no confirm arrives; and it should publish with \`mandatory\` or use an alternate exchange so unroutable messages aren't silently dropped. Consumers must use manual acks and ack only after the work succeeds. With all four, a crash anywhere causes redelivery, not loss, so consumers deduplicate.

**Q10: What is a dead-letter queue, and how do you build retries with back-off?**

A dead-letter queue holds messages that couldn't be processed, so one bad message doesn't block or loop forever. In RabbitMQ a queue's dead-letter exchange receives messages that are rejected without requeue, expire by TTL, overflow a length limit, or exceed a quorum queue's delivery limit (20 by default since 4.0). For back-off, route failures to retry queues with a TTL per delay (10 s, 1 min, 10 min) and no consumers, whose DLX points back at the work exchange; count attempts with the \`x-death\` header and send the message to a parking-lot queue after N attempts. Kafka has no consumer-side DLQ, so applications publish failures to retry topics and finally a dead-letter topic, then commit the offset and move on.

**Q11: What triggers a Kafka consumer rebalance, and how do you reduce its impact?**

A consumer joining or leaving, a consumer missing heartbeats for \`session.timeout.ms\`, a consumer not calling \`poll\` within \`max.poll.interval.ms\` because processing a batch took too long, and topic or partition changes. Reduce the impact with the cooperative (incremental) assignor so only moved partitions pause, static membership (\`group.instance.id\`) so a restarting pod gets its partitions back without a rebalance, smaller batches (\`max.poll.records\`) or a longer \`max.poll.interval.ms\` for slow work, and committing offsets in the rebalance callback so the next owner doesn't redo work. Kafka 4.0's new consumer group protocol (KIP-848) moves assignment to the broker and makes rebalances incremental by default.

**Q12: What is log compaction, and when would you use it?**

Compaction (\`cleanup.policy=compact\`) keeps at least the latest record for each key and removes older records for that key in the background; a record with a null value is a tombstone that deletes the key after \`delete.retention.ms\`. The topic then works as a changelog: a new consumer can read it from the start and rebuild the current state of every key without the full history. Use it for state such as user profiles, product prices or configuration, for change-data-capture topics that mirror a table, and for Kafka Streams state stores. Kafka's own \`__consumer_offsets\` is compacted. Don't use it for events where each occurrence matters, such as payments, because older records for a key are removed.

**Q13: What is the dual-write problem and how does the outbox pattern solve it?**

A service that commits to its database and then publishes an event can fail between the two steps, so the database and the broker disagree: an order saved with no \`OrderPlaced\` event, or an event for a transaction that rolled back. You can't make the database and the broker commit atomically. The transactional outbox writes the event into an \`outbox\` table in the same database transaction as the business change, so both happen or neither does; a relay then publishes outbox rows to Kafka or RabbitMQ, either by polling or by change-data capture such as Debezium reading the database log. The relay can publish a row twice, so consumers must be idempotent.

**Q14: When would you choose Kafka over RabbitMQ, and the other way round?**

Choose Kafka when events are facts that several independent consumers need, when you need replay or long retention, for very high throughput, for data pipelines, change-data capture, event sourcing and audit logs, and when ordering per entity key matters at scale. Choose RabbitMQ for task and command queues: background jobs with per-message acks, retries with back-off and dead-lettering, priorities, TTLs, request/reply, and routing by content without designing topics up front. If the team is small and the need is "run these jobs reliably", RabbitMQ or a managed queue such as SQS is far simpler to operate. Many systems use both: Kafka for business events between services, a queue inside a service for its jobs.

---

## 17. Tricky Questions

**Q1: A topic has 6 partitions. To process faster, you scale the consumer group from 6 to 12 pods. Throughput doesn't change. Why?**

Within one consumer group, each partition is assigned to exactly one consumer, so at most 6 consumers can be active; the other 6 pods join the group, get no partitions and sit idle as standbys. Throughput is capped by the partition count. Fixes: increase the partitions (which remaps keys, so plan it for keyed topics), process each partition's records concurrently inside a consumer while keeping per-key order (for example a pool keyed by record key), or, on Kafka 4.2+, use a share group, which lets many consumers read the same partition at the cost of ordering.

**Q2: The producer uses \`acks=all\` and the topic has replication factor 3, yet a broker failure lost acknowledged records. How?**

\`acks=all\` means "every replica currently in the ISR", not "all three replicas". With \`min.insync.replicas=1\` (the default), slow followers can drop out of the ISR until it contains only the leader, and \`acks=all\` then succeeds once the leader alone has the record. If that leader then dies, the records are gone, or, with unclean leader election enabled, an out-of-sync replica becomes leader and its log wins. Set \`min.insync.replicas=2\` so writes fail with \`NotEnoughReplicas\` instead of being accepted by a single broker, and keep \`unclean.leader.election.enable=false\`.

**Q3: A consumer with auto-commit hands each record to a thread pool and returns immediately. After a crash, some orders were never processed. Why?**

Auto-commit commits the offsets returned by the last \`poll\` on a timer, without knowing whether your thread pool finished them. The consumer polled records, handed them off, auto-committed their offsets, then crashed while the pool still had them queued. On restart the group resumes after the committed offset, so those records are skipped: at-most-once by accident. Disable auto-commit and commit an offset only when every record before it in that partition has completed, or keep processing synchronous inside the poll loop.

**Q4: Every few minutes the consumer group logs a rebalance, lag spikes, and the same records are processed again. Processing occasionally calls a slow external API. What's happening?**

When one \`poll\` batch takes longer than \`max.poll.interval.ms\` (5 minutes by default) to process, the consumer is considered stuck and is removed from the group, triggering a rebalance. Its partitions go to another consumer, which resumes from the last committed offset and reprocesses the uncommitted batch; the original consumer then fails its commit with a \`CommitFailedException\` and rejoins, causing another rebalance. Lower \`max.poll.records\` so a batch finishes in time, add timeouts to the external call, raise \`max.poll.interval.ms\` if the work is genuinely slow, or move slow work out of the poll loop while pausing the partitions.

**Q5: Events for each order are published with the order ID as key and were always in order. After the team increased the topic from 12 to 24 partitions, some consumers see \`OrderShipped\` before \`OrderPaid\`. Why?**

The partition for a key is \`hash(key) % partitionCount\`. Changing 12 to 24 sends about half of the existing keys to a different partition. \`OrderPaid\` for an order may already be sitting unprocessed in its old partition while \`OrderShipped\` for the same order is written to the new partition and consumed first by another consumer. Kafka only orders within a partition, and the key no longer maps to one. For keyed topics, size partitions generously up front, or create a new topic with more partitions and switch producers over after draining the old one.

**Q6: A RabbitMQ queue holds messages with per-message TTLs: the first message has a 10-minute TTL and the ones behind it have 5 seconds. The 5-second messages aren't dead-lettered for 10 minutes. Why?**

Per-message expiry is only checked when a message reaches the **head** of the queue. The 5-second messages are behind one with a 10-minute TTL, so they wait until it expires or is consumed, and only then are they found expired and dead-lettered. A queue-wide TTL (\`x-message-ttl\`) doesn't have this problem, because every message in the queue has the same TTL. That is why delayed retries use one queue per delay (\`retry.5s\`, \`retry.10m\`), not one queue with mixed per-message TTLs.

**Q7: Two consumers share a RabbitMQ queue. One is busy with thousands of messages in memory while the other is idle, even though both are healthy. Why?**

No prefetch limit was set. Without \`basic.qos\`, RabbitMQ delivers messages to a consumer as fast as the network allows, with no cap on unacked messages, so whichever consumer connected first received most of the queue's backlog into its client buffer. The second consumer gets only new messages. Set a prefetch (\`channel.prefetch(10)\`, or 1 for long, uneven jobs) so each consumer holds a bounded number of unacked messages and the rest stay in the queue for whichever consumer is free.

**Q8: A consumer catches every error and calls \`nack(msg, false, true)\`. One malformed message pins a CPU core and the queue stops making progress. Why?**

\`requeue: true\` puts the message straight back in the queue, often at the front, so it is redelivered immediately, fails again and is requeued again in a tight loop: a poison message. Every other message waits behind it or competes with it. Requeue only for errors that may be temporary, and nack with \`requeue: false\` for errors that will always fail (bad payloads), with a dead-letter exchange configured so the message is kept for inspection. Quorum queues also cap redeliveries with a delivery limit (20 by default since RabbitMQ 4.0) and then dead-letter or drop the message.

**Q9: A producer publishes \`invoice.created\` to a topic exchange and the call succeeds, but the invoice service never receives it. The queue exists and has consumers. What do you check?**

Whether any binding matches. Publishing to an exchange succeeds even if the exchange routes the message to no queue, in which case it is silently discarded. Likely causes: the queue is bound with \`invoices.*\` or \`invoice.created.*\` (a \`*\` needs exactly one word, so \`invoice.created.*\` doesn't match a two-word key), the binding is on a different exchange or vhost, or the routing key has a typo. Publish with \`mandatory: true\` to have unroutable messages returned to the producer, add an alternate exchange to catch them, and check the exchange's bindings in the management UI.

**Q10: The service uses Kafka transactions for exactly-once processing, reads \`payments\`, charges the card with a payment API and writes to \`receipts\`. Customers are occasionally charged twice. How?**

Kafka transactions make the consumed offsets and the records written to \`receipts\` commit atomically, but the payment API call is outside Kafka. If the process charges the card and then crashes or the transaction aborts (a rebalance, a timeout), the transaction rolls back, the input record is read again, and the card is charged a second time. Exactly-once semantics only cover Kafka-to-Kafka. Pass an idempotency key derived from the payment ID to the payment provider, or record the charge in a database with a unique constraint on the payment ID before calling out, so a retry is recognised.

**Q11: A downstream consumer reads a topic written with Kafka transactions and sees records from transactions that were later aborted. Why?**

The consumer's \`isolation.level\` defaults to \`read_uncommitted\`, which returns every record as soon as it is written, including records from transactions that later abort. Set \`isolation.level=read_committed\`: the consumer then only sees committed records and stops at the last stable offset, waiting for open transactions to finish. The trade-off is a little extra latency, because records written inside a long-running transaction aren't visible until that transaction commits.

---

## 18. Cheat Sheet

**Models**

1. Queue (RabbitMQ): broker routes and tracks each message; acked = gone.
2. Log (Kafka): append-only partitions; consumers track offsets; replay by moving the offset.

**Kafka**

3. Ordering only within a partition; same key → same partition (\`hash(key) % partitions\`).
4. Adding partitions remaps keys: per-key order breaks during the change.
5. One consumer per partition per group; extra consumers sit idle.
6. Commit after processing = at-least-once; before = at-most-once.
7. Auto-commit with async handoff can lose records.
8. \`max.poll.interval.ms\` (5 min) exceeded → consumer kicked → rebalance + reprocessing.
9. Cooperative assignor, static membership, KIP-848 (GA in 4.0) reduce rebalance pain.
10. Durable: RF 3, \`min.insync.replicas=2\`, \`acks=all\`, idempotent producer, no unclean election.
11. \`acks=all\` + \`min.insync.replicas=1\` = \`acks=1\` when the ISR shrinks.
12. Idempotent producer (default since 3.0) removes retry duplicates, keeps order with ≤5 in flight.
13. Transactions + \`read_committed\` = exactly-once Kafka-to-Kafka only.
14. Retention by time/size, or compaction (latest per key; tombstone = null value).
15. KRaft only since 4.0; ZooKeeper is gone.
16. Share groups (GA in 4.2): queue semantics, per-record acks, no ordering.

**RabbitMQ**

17. Publish to an exchange with a routing key; bindings route to queues.
18. Direct (exact), fanout (all), topic (\`*\` one word, \`#\` zero or more), headers.
19. No matching binding = silently dropped; use \`mandatory\` or an alternate exchange.
20. Manual acks; unacked messages requeue when the channel closes.
21. Always set prefetch; unlimited prefetch makes one consumer hoard the queue.
22. No loss = quorum queue + persistent messages + publisher confirms + manual acks.
23. Classic mirrored queues removed in 4.0; quorum queues are the replicated type.
24. DLX on reject without requeue, TTL expiry, length overflow, delivery limit (20 by default in 4.0).
25. Per-message TTL expires only at the head of the queue: one retry queue per delay.
26. Order per entity: single active consumer or consistent-hash exchange.

**Both**

27. Exactly-once in practice = at-least-once + idempotent consumer.
28. Outbox table in the same DB transaction fixes dual writes.
29. Monitor lag (Kafka) and queue depth (RabbitMQ); autoscale on them.
30. Kafka for event streams, replay and scale; RabbitMQ for task queues and routing.

---

## 19. References

- [Apache Kafka documentation](https://kafka.apache.org/documentation/) — design, configuration and operations.
- [KIP-932: Queues for Kafka](https://cwiki.apache.org/confluence/display/KAFKA/KIP-932%3A+Queues+for+Kafka) and [KIP-848: The next generation of the consumer rebalance protocol](https://cwiki.apache.org/confluence/display/KAFKA/KIP-848%3A+The+Next+Generation+of+the+Consumer+Rebalance+Protocol)
- [Confluent: Exactly-once semantics in Kafka](https://www.confluent.io/blog/exactly-once-semantics-are-possible-heres-how-apache-kafka-does-it/)
- [RabbitMQ documentation](https://www.rabbitmq.com/docs) and [AMQP 0-9-1 model explained](https://www.rabbitmq.com/tutorials/amqp-concepts)
- [Consumer acknowledgements and publisher confirms](https://www.rabbitmq.com/docs/confirms) and [Consumer prefetch](https://www.rabbitmq.com/docs/consumer-prefetch)
- [Quorum queues](https://www.rabbitmq.com/docs/quorum-queues) and [Dead letter exchanges](https://www.rabbitmq.com/docs/dlx)
- [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html) — microservices.io.
`;export{e as default};
