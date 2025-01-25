---
title: Bye Elastic, Hola Victoria
date: 2025-01-24
draft: false 
tags:
- homelab
- logging
- elastic
---

It is no secret that I'm a Elasticsearch aficionado, try to use it for a lot of things like storing my twitch chat messages or [visualize](https://mvaldes.dev/archive/speedtest-kibana) data (you can do a lookup for elastic on this blog and find 3-4 posts about it), hell I even get paid to manage couple clusters at work and it's been pretty close and deep in my heart, so much that when I stood up my homelab cluster and wanted to monitor the workloads (docker and now Kubernetes).I went all in with metricbeat/filebeat for the collection of pretty much everything. As this progressed and with upgrades and restarts to update packages in the underlying infrastructure it became a bit of a pain that sometimes some nodes would lock up and prevent me from starting the service causing delays and overall problems and headaches I get paid to fix, but in this case since its my own homelab I didn't want to endure. 

Most probably caused by something wrong on my Ansible scripts to do those maintenance tasks but it is a known fact that maintaining an Elasticsearch cluster isn't exactly easy. 

> [!tip]
> If you look at Linkedin or similar platform you will find dedicated positions just to maintain/upgrade and run Elastic. So if you like it and are good at it you may be able to find a good paying job!

After some back to back issues and alerts I grew tired of it and started looking for a replacement that would have the following checklist:
- [ ] Easy to install, a single binary if possible
- [ ] Receives data from open source agents/clients. Beats are great but mostly locked for Elastic products which makes sense.
- [ ] Easy to configure and manage, don't need to modify 2-3 different configuration files to get it to work
- [ ] OTEL Compatible, I know Elastic recently adopted this but again hard to run
- [ ] Has to be blanzingly fast, I'm an impatient person
- [ ] Query language easy to use, Lucene is easy to learn but is limited compared to something like Splunk.
- [ ] Easy way to setup data retention and rollout

After looking and testing some tools like Grafana [[Loki]] which covers most of the boxes, with some caveats and are mostly me being extra special:
- I'm not super fond of the PromQL language 
- Requires some config options for backend storage
- Promtail only does logs and ideally I want one agent doing both metrics and logs down the road

## I ended up going with VictoriaLogs

Even tho the product just reached GA and it's missing some features I definitely would want like compression and specific data retention based on filters, which seems to be in the roadmap but sadly an Enterprise Feature.

**NOTE:** Do have to disclose I recently used VictoriaMetrics extensively and really liked how easy it is to setup and how the ecosystem is pretty well connected, documentation is superb and deploying was a breeze even without using the provided Helm Charts. My current setup can be found [here](https://github.com/mvaldes14/k8s-app/victorialogs) if you want to see how easy it was.

Now does it cover everything in my checklist? - Nope
Are all of the features ready and free to use? - Nope

Going with victorialogs allowed me to also test and play with [[vector]] which is a super wide and powerful agent that can do a lot of things with several different backends.

So i will keep testing VL and see how it works. Granted I already had an issue with it not having a signed plugin with Grafana which makes the installation a bit complex and the queries I want to execute won't run, already raised an [issue](https://github.com/VictoriaMetrics/victorialogs-datasource/issues/212) with them and is actively being worked on which makes me happy.

Overall I'm happy with the setup and how it performs with my limited amount of logs in the Homelab so we will see how it behaves in the long run.

So goodbye Elastic, you were great but it's not you, it's me

<img src="https://s3.mvaldes.dev/blog/bye-elastic.png" alt="Bye Elastic"  width=500px />
