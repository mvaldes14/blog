---
lang: en
title: My Homelab Runs on Events
description: Why I put an event bus in front of my homelab, which cloud patterns it copies, and how it grows
pubDate: 2026-11-24
status: published
tags:
  - homelab
  - automation
  - observability
---
GitHub webhooks, OpenTelemetry signals, and other external events now enter my homelab through one Go service. It parses each request and writes records to Redpanda, where consumers process them independently. I built it because managing separate endpoints, tunnels, and n8n workflows was getting annoying.

Each destination used to have its own receiver, authentication, and retry behavior. When something failed, I often lost the payload along with any useful record of what happened.

This is more infrastructure than the traffic needs. I run one eventbus replica and one Redpanda broker, so both are deliberate single points of failure. For now, that is an acceptable tradeoff for having one place where I can follow an event through the system.

> I wrote about some of those automations in [n8n is awesome](https://blog.mvaldes.dev/en/posts/n8n-is-awesome/).

## The point-to-point mess

Every external service needed a public endpoint, tunnel route, or some other path into the lab. Each receiver handled validation, authentication, and retries in its own way.

Adding a second consumer meant changing the producer or chaining more n8n workflows and scripts together. Failed payloads were not retained, so replay was impossible.

## What I built

<figure>
  <img src="https://s3.mvaldes.dev/edh-0.png" alt="Event flow from GitHub, AWS EventBridge, and OTLP clients through Cloudflare Tunnel into the Go eventbus, Redpanda topics, and independent consumers" />
  <figcaption>Producers enter through one tunnel and one ingest service, then fan out across Redpanda topics.</figcaption>
</figure>


The public side is one hostname backed by one ingest service.

Cloudflare proxies the HTTP traffic, then `cloudflared` connects the edge directly to the Kubernetes Service without opening an inbound port. I can apply DDoS protection, WAF rules, and rate limits at the edge, while the Tunnel provides the private path to the origin.

Checks depend on the source. AWS requests use a shared API key. OTLP requests are decoded and filtered by an allowed `service.name`. GitHub deliveries need provider metadata before the service routes them.

Accepted events land in purpose-specific topics. Each consumer group reads at its own pace, so a slow consumer does not block producers or other consumers.

### The Go service

The service validates and decodes each request, chooses a topic and partition key, adds Kafka headers, and publishes synchronously with `acks=all`. It returns success after Redpanda acknowledges the record. Downstream consumers work independently because they are not part of the request path.

Topics are grouped by purpose: `github`, `aws`, `logs`, `traces`, `metrics`, plus a general `events` topic for random things (backup messages, etc.). Webhook records carry the event ID, source, receive time, routing rule, schema version, and trace context in Kafka headers. OTLP records stay in OTLP protobuf format so the Collector's Kafka receiver can decode them directly.

### Consumers

- Separate OpenTelemetry Collector Kafka receivers and consumer groups handle logs, traces, and metrics.
- The Go service filters GitHub deliveries before publishing selected pull request, issue, push, workflow, and secret-scanning events. A notification consumer in n8n reads those records from the `github` topic. I filter them on purpose because GitHub gets noisy quickly.
- Events arriving through an AWS EventBridge API Destination land on the `aws` topic. Another n8n consumer reads them today, though it may become its own microservice later.

## Telemetry

The receiver creates OpenTelemetry spans for requests arriving through the tunnel and for the Redpanda publish. It puts trace context in Kafka headers so an instrumented consumer can continue the trace.

The service also exposes Prometheus metrics for accepted, rejected, dropped, and published events, along with publish latency, payload size, and OTLP filtering.

I used the SigNoz MCP to generate the dashboard from that telemetry. Who wants to build a dashboard manually in 2026, right?

<figure>
  <img src="https://s3.mvaldes.dev/edh-1.png" alt="SigNoz dashboard showing eventbus traffic and publish telemetry" />
  <figcaption>Eventbus traffic and publish telemetry in SigNoz.</figcaption>
</figure>

<figure>
  <img src="https://s3.mvaldes.dev/edh-2.png" alt="SigNoz dashboard section showing GitHub event traffic" />
  <figcaption>Per-source volume, with GitHub split out from the rest.</figcaption>
</figure>


The dashboard displays publish latency, rejected events, errors, throughput, and consumer lag. GitHub produces the most traffic, so it has its own section.

Between the dashboard and retained records, I have one place to inspect incoming traffic without coupling the consumers together.

## How this maps to AWS

Cloudflare and the Go service cover public ingestion and source-specific checks. The source registry, filtering, and routing borrow from EventBridge rules and Pipes. Redpanda is closer to Amazon MSK or Kinesis because it stores partitioned, retained streams with ordering inside each partition. Its topics and consumer groups provide the fan-out and independent processing often built with SNS and SQS.

AWS also sends events back into the lab. An EventBridge API Destination posts selected events to the public ingest service, which publishes them to the `aws` topic for local consumers.

I have been recreating pieces of cloud infrastructure at home for a while. Previous posts covered my [GitOps workflow](https://blog.mvaldes.dev/en/posts/gitops-workflow-homelab/), [self-hosted GitHub alternative](https://blog.mvaldes.dev/en/posts/run-your-own-git/), and the other cloud-like services in [Self-hosted 2026](https://blog.mvaldes.dev/en/posts/selfhosted-2026/), including S3-compatible storage.

## Why it works for me

A new producer needs source-specific checks and routing, plus any new topic and edge policy. Existing consumers stay untouched. A new consumer joins a topic with its own consumer group and requires no producer changes.

Redpanda retains events, so a new consumer can replay recent data instead of waiting for fresh traffic. Kafka headers give webhook consumers a stable metadata contract, while telemetry keeps the standard OTLP protobuf format. Redpanda's Kafka-compatible API also leaves room for another compatible broker, though its configuration and operational behavior would still require migration work.

## Tradeoffs

Delivery is at least once. Senders may retry, so consumers need deduplication or idempotent processing. Retention is finite: the general topic keeps seven days, while source and telemetry topics keep one day. This works well in a homelab, though a heavier environment would need more brokers and possibly longer retention.

Durability is limited by the cluster itself. `acks=all` is the correct producer setting, but one Redpanda broker with replication factor one still means one copy on one machine. A broker or local-disk failure can lose retained events. Events from senders that do not retry can also disappear during an outage.

## Conclusion

A homelab lets me try patterns I encounter at work or online without waiting for a business reason. Building this pipeline gave me practical time with Redpanda and native OpenTelemetry while solving the same integration and observability problems I deal with at work.

AI coding tools make experiments like this much faster to build. This one took hours instead of days or weeks, which probably deserves its own post. If the setup sounds useful, the diagram above is enough to copy the basic flow over a weekend.

Adios!
