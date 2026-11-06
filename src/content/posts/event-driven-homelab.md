---
lang: en
title: My Homelab Runs on Events
description: Why I put an event bus in front of my homelab, what cloud pattern it copies, and how it grows
pubDate: 2026-11-02
status: draft
tags:
  - homelab
  - architecture
  - automation
---

People manage their digital lives in all sorts of ways, but software systems often converge on the same pattern: an event bus. When several services and providers need to work together, the bus gives them one place to exchange events.

That convenience comes with a cost. It adds another system to run and can become a single point of failure. Still, it is a proven pattern, and it solved a mess I had created in my homelab.

Before this, every webhook from GitHub, Google Calendar, Discord, and n8n pointed directly at a different service. The same was true for OpenTelemetry signals and other triggers. Each destination had its own URL, receiver, authentication, and retry behavior. Most of it lived in n8n, and the setup had become painful to maintain.

> I wrote about some of those automations in [[n8n-is-awesome]].

## The point-to-point mess

Each external service needed its own public endpoint, tunnel route, or other path into or out of the lab. Every receiver implemented its own validation, authentication, and retries.

Adding another consumer for an existing webhook meant changing the producer or chaining more n8n workflows and scripts. If something failed, nothing retained the payload. It was gone.

## What I built

![[homelab-event-driven]]

The design is simple: one public endpoint with validation and persistence in front of every event I care about.

The endpoint accepts a defined set of sources and event types. It runs behind a Cloudflare Tunnel, which provides some protection against DDoS attacks and malicious traffic. Requests are rejected by default unless they include the expected authentication or validation data.

After validation, events land in Redpanda topics. Different consumers can subscribe to those topics, so each part of ingestion stays separate and can scale independently.

### The Go proxy

The receiving proxy does most of the work. It verifies signatures or tokens for each source, such as GitHub HMAC signatures and Google Calendar channel tokens. It then normalizes the request into a common envelope, publishes it to the bus, and returns a 2xx response quickly so the producer never waits for a consumer. Each event type has its own topic.

```json
{
  "id": "01JBX7Q2M4ZK8V3N6R9T0WYH5C",
  "source": "github",
  "type": "push",
  "time": "2026-11-02T21:00:00Z",
  "detail": {}
}
```

### Consumers

Consumers subscribe according to the data they handle:

- Logs, traces, and metrics go to an OpenTelemetry Collector using `kafkareceiver`.
- GitHub pull requests, issues, commits, and CI/CD events go to an n8n consumer on the GitHub topic.
- AWS SNS and SQS events go to a Go service.
- Script events, including backup notifications, go to another Go service.

## Results

The pipeline is now centralized, but the part I like most is that I built it with observability in mind. Everything is instrumented with OpenTelemetry, so I can see what entered the system, where it came from, and how it behaved.

I used an MCP to build a SigNoz dashboard from that telemetry. It makes latency, authorization failures, and consumer lag easy to spot. GitHub currently produces the most traffic, so it has its own dashboard section.

I am happy with how it turned out. The bus gives me one place to control incoming traffic while still letting each consumer scale separately.

## EventBridge, only smaller

This is not a new architecture. Cloud providers and many applications use the same pattern. My version borrows from those systems on a much smaller scale.

I have been recreating pieces of cloud infrastructure at home for a while. This event bus is another part of that project. Previous posts covered my [GitOps workflow](https://blog.mvaldes.dev/en/posts/gitops-workflow-homelab/), [self-hosted GitHub alternative](https://blog.mvaldes.dev/en/posts/run-your-own-git/), and the other cloud-like services in [Self-hosted 2026](https://blog.mvaldes.dev/en/posts/selfhosted-2026/), including S3-compatible storage.

## Why it works for me

Adding a producer means adding a validator to the proxy. Existing consumers do not need to change. Adding a consumer means subscribing it to an existing topic without changing producers.

Retained events also allow a new consumer to replay old data instead of waiting for fresh events. The common envelope acts as the contract, so I can replace the broker, n8n, or another consumer without changing the rest of the pipeline.

## Tradeoffs

Nothing is synchronous anymore, so I have to accept eventual consistency. Debugging across several hops requires tracing and correlation IDs, which I send through OpenTelemetry into SigNoz.

Consumers must also be idempotent because duplicate delivery will happen. On top of that, the event bus is another service I need to run, monitor, and alert on.

## What I learned

A homelab gives me room to try patterns I encounter at work without waiting for a business reason. This project let me spend time with Redpanda and native OpenTelemetry, two technologies I had wanted to explore. It also fits my day-to-day work: integrating systems and making sure I can observe them when something goes wrong.

So yes, I built an event bus to receive notifications from GitHub, Discord, and a handful of scripts. It may be excessive, but now I can see every step when one of those notifications fails.

Adios!
