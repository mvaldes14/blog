---
lang: en
title: Self Hosted in 2026
description: Consolidating Hardware and Software for the Homelab
pubDate: 2026-08-04
draft: false
tags:
  - homelab
---

It's that time of the year again and this year the lab actually got smaller. I consolidated and removed devices and services that were simply not needed while also replacing some others for alternatives that I'll showcase. 

So what changed in the lab?

## Hardware
- The Unifi 8 port 60W POE switch was basically too small for newer devices added this year so I made the jump to a 24 port switch, same Unifi with POE, this helped consolidate both switches (8 port + flex) that were part of the Frankenstein switch setup. 
- Replaced the In-Wall HD Access Point with more Access Points HD, POE powered as those extra ports on the IHWD were not being used at all and my toddler kept trying to put stuff into them so it was time to let it go. My home now runs on 3 Access points, 1 per floor.
- My NAS had a horrible accident, one of the drives decided to die so I had to replace it and learn the big lesson of why you need to have good drives (don't cheap on them) while also picking the right RAID arrangement to have redundancy and performance.
	- On this particular incident in 2023 I had the goal of improving this and seems like I completely ignored my own advice and paid for it 3 years later, ultimately I moved on from RAID 0 to RAID 1.
	- And if you are curious how much time it took me to restore my lost media? A day or two as the Arrs kept a list of what was available and what was missing.
	- Granted this isn't a backup and I still have no clue how to backup that amount of data reliably and following the 3-2-1 principle, so something to keep pondering about. The one thing I do regularly backup is my PSQL databases so it's not much but it's honest work.
- One of the SFF computers had an extra slot of RAM open so browsing marketplace I found a cheap DDR3 stick so now the Homelab machines are buffed to 32GB of RAM which for the workloads I have seems to be plenty. Can always extend them further but as you read later on, current compute is enough.
- A left over item from 2024, I finally have VLANs created for the IoT devices so they are fully isolated.

> Machine wise I still run eva01-04 along with the old trusty Raspberry Pi 3b. No more compute is needed for the workloads I run today.

## Services
Now this is the meat and potatoes of the lab and it keeps changing and now with AI some "services" became products [I am developing and running locally](https://blog.mvaldes.dev/en/posts/task-manager-blog/). 

If you are ever curious and want to see what I run throughout the year, [the repository is public](https://github.com/mvaldes14/k8s-apps) and well maintained.

This year I'll break it down by category/functionality. If you want to compare what I had before check out [2024](https://blog.mvaldes.dev/en/posts/selfhosted-2024/), or go further back to [2022](https://blog.mvaldes.dev/en/posts/selfhosted-2022/).


### Observability
As someone who works in this area my tools change very often and I'm always trying different flavors of platforms, the only directive I follow lately is that it needs to be **OpenTelemetry** compatible which lets me just include a new endpoint and have my data into a new tool.

- This year my tool of choice is SigNoz, it has all the signals I need, gives me decent dashboards and alerts and even has an MCP which lets me ask questions about my lab pretty easily. **Disclaimer:** I work at SigNoz so it may sound biased but trust me over the years I have tried every single tool out there and I really like ours.
- Ingestion is purely based on OpenTelemetry collectors, some run as deployments, some as daemonsets and they all have different purposes, so again this is a core principle for me to have things in code and OpenTelemetry friendly.
- Grafana is still up and running and I use it with a ClickHouse backend that also collects telemetry so I can always stay up to date with other tools in the space.

### Media
- The Arrs still take over to find and acquire media files. The collection is composed of Sonarr, Radarr, Prowlarr + FlareSolverr, Bazarr.
- Jellyfin is the best media player and it runs on a dedicated machine (eva04) that has QuickSync for transcoding, whenever that machine feels like staying up (more on that later). Has some nice TV and Phone apps that can be used anywhere so I take my media on the go.

### Automation, Documentation and Management
This area became very prominent for me in 2025 and so far this year.
- n8n is a fantastic tool every person with a machine should have up and running, it is incredibly simple to run and lets anyone come up with workflow automations.
- Paperless-ngx is my document management solution which allows me to directly feed data from my phone as well as my emails so any invoice, paper mail or random documents I need end up there.
- Home Assistant we don't even need to discuss this one right? We all know what it does and its purpose. If you have cameras, light switches or anything that is "smart" you will most likely be able to connect it to HA.
- NocoDB is one of those tools that I rarely use but when I do it definitely pays off, my main usage for this is to have a visual "database" that isn't Excel/Google Sheets that I can run and manage, incredibly useful to either capture data with forms or to simply keep track of things you need in a sheet. 
    - One "crazy" use I have of it is as a "database" backend for a silly app I made for my friends during the 2026 World Cup and it worked amazingly, why spin up PostgreSQL if you can do it in a single click am I right?!
- For the first time in years I'm taking security seriously so I added HashiCorp Vault mid 2025 and Authentik mid 2026. Both of these let me handle my secrets for all of my k8s applications as well as having authentication in front of apps that are OIDC/SSO compatible so the services that are exposed are more secure and are easier to open up to friends and family.
- Garage is my new S3 solution, I run it for its simplicity and it has been solid so far. It mostly stores backups and random files I need to access. This is the one service that I actually would pay for and keep outside my domain, I cannot and will never have the same reliability big clouds have.
- Like [I wrote about before](https://blog.mvaldes.dev/en/posts/gitops-workflow-homelab/) in Gitops land, I mostly run FluxCD but.... this year also marked the beginning of my adventures with ArgoCD.
	- You may be wondering why switch or run 2 tools that do the same thing? Well it has 2 main reasons. 1. I wanted to learn it, it is what a lot of companies out there use so the lab is always the perfect spot to test drive products and 2. I'm going to be vibe coding some projects that will require some sort of control from another individual as to when to "upgrade" so a UI was required.
	- This does not mean I'm moving entirely to Argo as both tools have their own merit so I simply take advantage of those particular features they don't overlap on.

### Core Services
These are ones I simply forget they exist but I use every single day and when they go down I feel hurt.
- SearXNG became the default search engine for all my computers/phones/tablets, it simply gives me some extra privacy when browsing the web.
- Excalidraw is my go to when I need to materialize an idea into something visual.
- Pihole is still my main DNS based solution for keeping Ads away as well as letting me manage my internal records for non internet exposed services.
- Not something I host myself and could but totally should.... [Tailscale](https://blog.mvaldes.dev/en/posts/tailscale-is-cool/) is how I get into my home network while away.
- Cilium took over as the network layer of the cluster this year. I never think about it until something can't reach something else, and it throws out a ton of traffic metrics I'm barely starting to use.
- CloudNativePG took over the PostgreSQL pods I used to create by hand. Now the operator deals with them for me and I get metrics out of it too.
- Umami is still my choice to generate links, track site activity and have insights into what I'm posting or publishing and sharing online.
- Atlantis is still what makes the IaC automation magic happen, don't see myself removing that one.
- Gotify became my go to notification service, it's simple, easy to use and has a great UI. Works on my desktop and mobile devices.
- Last but not least the Cloudflare tunnel, a lot of these services wouldn't be available without it like I [shared before](https://blog.mvaldes.dev/en/posts/cloudflare-tunnels/).

### Retired
Stuff that was running last year and is now gone from the lab:
- Elastic Stack and VictoriaMetrics: Elastic went first, there's memes in SRE land about operating it for a reason. VictoriaMetrics took its place since it's lightweight and easy to run and I [wrote a whole post on why I made that switch](https://blog.mvaldes.dev/en/posts/victoria-over-elastic/). Now VictoriaMetrics is out too, amazing product BUT the lack of a dedicated UI or easy alerting pushed me over to SigNoz. Something definitely worth revisiting in the future.
- Nextcloud: Was too bulky and complex for my use case to store documents.
- Minio: The license drama just rubbed me the wrong way, migrated to Garage.
- Shlink: Umami added a link feature recently so Shlink is now fully gone.
- Windmill: Had a short tenure in the lab and it looked like a promising app but n8n came in hard.

## Future
What future me would like to improve or add:
- Replace eva02 which is the older machine processor and memory wise for something smaller like a NUC, it's also the biggest one case wise so it eats up a lot of space in the rack.
- Buy another NUC/SFF with at least a 10th gen Intel processor to have as a backup for Jellyfin, eva04 tends to "die" a lot requiring a reboot.
- Lock down more services I still use outside of the cloud like:
    - No secrets outside of my vault, looking at you Doppler.
    - Authentik to become the default entrypoint for all my internal and external apps.
    - Update terraform to feed and use Vault for secrets and my local S3 for state and not HashiCorp Cloud.
- Maybe think about running some small LLM models locally to trim my dependency with Claude.
- Expand the observability of the services I run, especially the newer additions like Cilium and CloudNativePG which produce a lot of metrics I'm not looking at yet.
- Biggest one... to finally tidy up the cables on the rack. It's been 2 years and they still look nasty AF.
- Acquired a decent amount of AWS credits to potentially work on a "hybrid lab". I know it goes against the whole self hosting movement but if you already have the credits.... why not right?

Overall I'm happy with the state of the lab, it is now treated as production and things run smoothly. It still provides a lot of room to play and learn.

If you have a service you trust your life with, do share with me. I'm always browsing the Self Hosted Subreddit looking for more to run.

Adios!

