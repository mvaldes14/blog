---
lang: en
title: ClickHouse Map vs JSON for OpenTelemetry attributes
description: I benchmarked ClickHouse Map and JSON storage for OpenTelemetry logs, found a clear query winner, and then realized the schemas were not a clean type comparison.
pubDate:
status: draft
tags:
  - clickhouse
  - observability
  - opentelemetry
  - homelab
---

I have been playing with ClickHouse native `JSON` columns for OpenTelemetry data in my homelab. The question sounded simple enough: should I store OTel attributes as `Map(String, String)` or use the native `JSON` type?

ClickHouse has used maps for this kind of data for a long time. They are flexible, predictable, and supported by the OpenTelemetry ClickHouse exporter. Native `JSON`, however, stores paths as columnar subcolumns instead of packing every key and value into arrays. That sounds perfect for telemetry, where most queries only touch a couple attributes out of a much larger object.

So I did what any reasonable person with a Kubernetes cluster and spare storage would do: sent the same logs into two tables and benchmarked them.

Then I discovered I was not benchmarking exactly what I thought I was benchmarking.

## The setup

My test ran on ClickHouse 26.8.2 using the first-party ClickHouse operator. An OpenTelemetry Collector daemonset read host syslog files and exported the same records into two tables:

- `homelab.log_map`, using the exporter default Map schema
- `homelab.log_json`, using the exporter with `json: true`

Both pipelines received the same OTLP data. I used a frozen ten-day window from October 1 through October 10, 2026, disabled the query cache, optimized those partitions, and ran each query 25 times with `clickhouse-benchmark`.

The tables held about 18.4 million rows each. Map had 7,726 extra rows, a difference of 0.042%. Not perfect, but small enough for directional query testing.

## JSON was faster for attribute queries

The first query filtered on one log attribute:

```sql
SELECT count()
FROM homelab.log_json
WHERE Timestamp >= toDateTime64('2026-10-01 00:00:00', 9)
  AND Timestamp < toDateTime64('2026-10-11 00:00:00', 9)
  AND LogAttributes.`log.file.name` = 'syslog'
SETTINGS use_query_cache = 0;
```

The equivalent Map query used:

```sql
LogAttributes['log.file.name'] = 'syslog'
```

Results:

| Query | JSON p50 | Map p50 | Winner |
|---|---:|---:|---|
| Single attribute filter | 917 ms | 2,064 ms | JSON, 2.25x faster |
| Two attribute filters | 1,861 ms | 2,790 ms | JSON, 1.50x faster |
| Group by attribute | 979 ms | 1,909 ms | JSON, 1.95x faster |
| Full object read | 9,217 ms | 7,351 ms | Map, 1.25x faster |

JSON won the queries I care about for dashboards and log exploration. Filtering or grouping on a known path was between 1.5 and 2.25 times faster.

Map won when reading every column and reconstructing the full object. That result makes sense. Native JSON works best when ClickHouse can read a specific subcolumn. Asking for the whole object removes that advantage and adds reconstruction work.

## Read bytes lied to me

The odd part was that JSON read more data while finishing faster.

For the single attribute filter, JSON read 548 MiB while Map read 338 MiB. JSON still finished in less than half the time and used about half the peak memory.

My first reaction was that something had to be wrong. It was not.

With JSON, `log.file.name` is a columnar path that ClickHouse can read directly. With Map, ClickHouse has to work through key and value arrays for each row to find the requested key. The Map query read fewer compressed bytes but did more CPU work.

This is a good reminder not to declare a benchmark winner from `read_bytes`. Query duration, CPU behavior, memory, rows read, and bytes read all matter. Users waiting on a dashboard mostly care about the first one.

## Storage was almost identical

I expected a larger storage difference, but both tables compressed to roughly the same size.

| Table | Compressed | Compressed per row | Uncompressed per row |
|---|---:|---:|---:|
| JSON | 538.13 MiB | 30.64 B | 512.11 B |
| Map | 545.19 MiB | 31.03 B | 496.12 B |

JSON was slightly smaller when compressed. Map was slightly smaller before compression. For this dataset, storage would not decide the format for me.

The dataset matters here. These were sparse host syslog records with only two useful log attributes: `log.file.name` and `log.file.path`. Kubernetes container logs with pod, namespace, node, deployment, and label attributes should give JSON more opportunities to benefit from path-level reads.

## The benchmark had a confounder

Here is where the test became more interesting.

The OpenTelemetry ClickHouse exporter does not produce identical schemas with one column type changed. Map mode and JSON mode use different optimization strategies.

Map mode creates materialized columns for several common Kubernetes resource attributes. JSON mode creates key arrays and bloom-filter indexes. The attribute columns differ, but so do other parts of the schema.

That means these results compare exporter Map mode against exporter JSON mode. They do not isolate `Map` versus `JSON` as ClickHouse data types.

I almost missed this because both tables came from the same exporter and received the same data. Same input does not guarantee a controlled schema comparison.

There is another gotcha: ClickHouse does not automatically rewrite a Map attribute lookup to use one of the generated materialized columns. The query has to reference that materialized column directly. A benchmark using `ResourceAttributes['k8s.namespace.name']` may leave an available optimization unused.

## What I would choose today

For this homelab log workload, I would use exporter JSON mode.

Most of my queries filter or group by individual attributes. JSON was consistently faster for those queries, used less memory for the single-key filter, and had no meaningful compressed-storage penalty. Map still makes sense when workloads frequently read or return the complete attribute object.

This is not a universal answer. It is a result for sparse syslog data and the schemas generated by the OpenTelemetry ClickHouse exporter.

## The follow-up test

I still want the answer to the original question, so the next test removes the schema differences:

- Hand-write matching table definitions with identical `ORDER BY`, indexes, and materialized columns
- Change only the attribute column types
- Feed richer Kubernetes container logs through both pipelines
- Freeze a matching window and verify row counts before benchmarking
- Repeat the same filter, group, full-object, memory, and storage measurements

That should produce a real Map type versus JSON type comparison. Until then, the honest result is simpler: for my OpenTelemetry exporter setup, JSON mode made targeted attribute queries much faster, while Map mode remained better at full-object scans.

<!-- TODO before publishing:
- Replace or supplement syslog results with matched-DDL v3 results.
- Add architecture diagram or table schema excerpts.
- Verify benchmark numbers against Resources/clickhouse-json-map-test.md.
- Add links to ClickHouse JSON and OTel exporter documentation.
-->