---
title: My SelfHosted Journey in [2022]
date: 2022-03-24
description: What I'm currently running in the homelab 2022 edition
status: "Complete"
---

Back in 2020 I started the beautiful journey of running services in my gaming rig, a Dell SFF computer and a Raspberry Pi 3b and due to the pandemic I had plenty of time at home to start playing with tech that I described back in this [post](https://blog.mvaldes.dev/docker-home-setup.html) but much has changed since then, so I figured I would share where that journey has taken me.

At the begging I was only fooling around with services or platforms that I used at work cause I wanted to learn more but at some point the entire focus shifted when I started listening to the self-hosted podcast as well as visiting the r/self-hosted subreddit, boy was I amazed by the amount of things you could host in your own network and the amount of things I could in theory replace that I was paying for… looking at you google drive/photos.

So as of writing this here’s everything that I'm running in my “home-lab”.

First image shows the entire environment composed of my actual machines running and the second shows the stacks that in total run **38 containers**.

{% image src="docker_env.png" alt="docker environment" /%}

Some of the stacks in my environment.

{% image src="docker_stack.png" alt="docker stack" /%}

Most of my containers are managed via Portainer which is an excellent tool if you don't want to keep tabs of the compose files for each service on multiple machines. All of the manifests are backed up to my personal Git server so in case of issues I can always get back up quickly.

Another thing to note is that I’m running everything in docker swarm, which I know is not ideal and mostly everyone would tell me to use kubernetes but still… got the feel it’s an overkill for something so small.

As you will see in the service list below, I’ve replaced couple services that I was paying for...looking at you Google Drive...and now I keep my own data in my own network, which is probably a bit risky given that my backups are still kept at home so in case of a disaster I will lose everything so eventually I’ll need to figure out the 3-2-1 strategy, but that comes in the near future.

Back to the services, here’s what I have replaced so far.

- Nextcloud takes over Dropbox and Google Drive
- Photoprism takes over Google Photos
- Gitea replaces some functionality from GitHub, still use it but only for really external stuff.
- Minio replaces what little use I had in AWS S3. Works as a backup location.
- Jellyfin replaces Plex, which I really never paid for but its OSS, has hardware transcoding out of the box, it's really great.
- Wallabag replaced pocket and any other bookmark URL service

On top of that I’m also running several services to keep Ads away, manage media and monitor my entire stack of computers. Some of the highlight services are.

- Grafana + Prometheus to monitor everything
- WikiJS to store notes of everything I’m learning
- Pihole as explained in this other post
- Uptime Kuma to be notified if a service is down or not working
- Fileflow to convert media from various formats into a standard HEVC x265

Another important aspect that recently changed is the networking, as I used to have a port forwarded from my router to a machine listening (80/443) for HTTP/S traffic mostly, that lead to DNS leaks and privacy concerns so I’ve recently switched to using Cloudflared tunnels, which allow me to still reach my services from outside my network and keep my IP private. On top of that I’ve got Cloudflared managing some of the DNS requests with some rule sets so everything is secure and somewhat controlled.

For internal services not exposed that I need to access while away; I’ve got a Wireguard VPN setup done so every time my phone is not on my WIFI network it auto connects to the VPN which gives me full access to everything in my home network on the go (this is done via Tasker), that gives me the use of features like that pihole to keep my internet experience somewhat safe. And since all of my traffic goes through the VPN I can feel safe when browsing or using public networks.

I’m hoping to expand my home-lab a little bit more this year, would love to get a rack and some real enterprise servers but deep down that will be a bit too much and the wife will most likely complain about it, also I'm confident I will not use all of the resources those big machines offer; But for sure I’m in dire need of a NAS to keep all of my data backed up and available to all devices, right now I’ve got stuff mounted via samba but its just not ideal so a real NAS hooked up directly in the network will help. Also a bigger server with more CPU and Memory as the Dell SFF and Pi are reaching capacity.

My Dell SFF sometimes peaks at 100% CPU when updating the packages so, I end up forcefully rebooting it and stop some services before updating the whole stack.

Most of the media I’ve got is transformed to HEVC 265 containers (checkout fileflow, it's a pretty damn awesome tool) but some of the clients do not support that format so my little SFF has to execute media transcoding, which causes some CPU heavy workloads and as explained above can have some terrible outcomes, ideally the next machine I acquire would have a graphics card capable of encoding said formats or at least a CPU with the capacity to transcode the formats I need, so any Intel Gen 7 and above basically. I know my gaming rig with a GTX 3080 would do it, but that machine is only used for gaming, which as a parent of 2 kids doesn’t happen as often as I would like.

Finally I’m sort of reaching a point were I think I’ve got everything I always wanted running locally for now... because this think is an addiction trust me, there's still a big piece annoying me called authentication which I need to figure out (testing authentik right now to cover OAUTH and Proxy Auth) so maybe that will become a post in the future.

Hopefully this little write up either motivates you to take back control over your data or gives you the nudge you needed to grab that old laptop/computer and turn it into a small server. The learning curve is a fun ride and long term it may even help you land a job in IT!.

If you have any questions on why or how I'm doing some of these things please reach out.

Adios 👋
