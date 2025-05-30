---
title: My Home Docker Setup[2020]
date: 2020-03-04
description: A rundown of what i have in my homelab in 2020
draft: false 
tags: 
- container
---

Recently decided to migrate all of the things that I run on my personal computer and a little server I got for Xmas (originally for PLEX) as well as my raspberry pi to docker containers so that I could experiment more with it and boy, not as easy as I thought it was going to be.

Most of the applications had specific configuration files in a location that needed to be mounted somewhere, then I had to think of which apps to move to which node cause of the resources on each node, setup the permissions and respective volumes depending on the usage, all in all, it was fun and I learned a lot.

One last thing was that I knew very little how the networking aspect worked so I had to create networks between some of these so that I could have communication between them. For instance, the Kibana instance for my elastic cluster has a cross-cluster search so I can visualize the data from both clusters in a single pane so I had to figure out how to make these connections to each other.

**NOTE: Everything in here is using Docker SWARM, so make sure you have your swarm setup.**

## Containers:

**Elasticsearch clusters**

- Home cluster - for things I play with (trump twitter data, couple indices that are used for an app I’m working on, etc.). The home cluster comes with an instance of Logstash and Kibana respectfully.

- Server cluster - for reading data that is being generated by a script I made (mostly to keep track of my internet speed, pihole logs), this cluster consists of a gateway node and a data node. One receives the traffic, the other one keeps the data.

**Guacamole**

- Used to remote access my servers that are online 24/7.

**Kafka & Zookeeper**

- Been playing with it a lot lately, not much else to say. Definitely a cool tool.

**LDAP**

- I wanted to have some of my services use this as an authentication backend but haven’t had the time to create the schemas and add users, but its running.

**Media**

- Couple containers to keep track of series and TV shows I watch ( sonarr, radarr, jackett )

**MySQL**

- Local database so I can dump data sets for me to play with.

**Organizr**

- An excellent application that allows you to manage all of your bookmarks, so now I can just click on an icon and I’m taken to a container.

**Portainer**

- Used to manage most of my stack, sometimes the GUIs are better than the terminal.

**Prometheus & Grafana**

- To collect and graph all of the metrics from my systems.

**Traefik**

- Reverse proxy for my containers, no longer have to remember IPs and ports.

Got couple more services running on the servers but due to hardware constraints, mostly video decoding for plex, those remain as system processes that I can turn on/off when needed.

Same as my PiHole, I found that its easier to just keep it running on my raspberry pi. Might move it to a container soon using mcvlan.

## Setup

Most containers need couple gigs of storage and some don’t require a thing as long as they have a mount for the config file so based on that I ended up creating a couple of mount points as follows:

1. `/opt/elasticsearch` `50GB` on both home and server nodes to allocate the index data.
2. `/opt/prometheus` `1GB` to hold the `prometheus.yml` required for the scrape targets as well as hosting the time series data collected, by default I have it to only collect a week worth of metrics.
3. `/opt/kafka` `500MB` for all of the topic data, couple gigs, nothing special.
4. `/opt/grafana` `150MB` to hold the configuration data, one key thing for this one is that the mount point has to be owned by a unique ID for it to work properly, something odd but to be on the lookout for.
5. `/opt/media` `250MB` for all of the configurations created by the containers cause I didn't want to setup APIs every time i needed those services.
6. `/opt/mysql` `500MB` to hold all of my local databases.

### Networks

The final step was to figure out a way for some of these to talk to each other, was going to use NGINX but kept seeing “Traefik” in Reddit so I figured I’d give it a shot…. after couple hours of trying and reading, got it to work in a way that makes sense to me and best of all I could integrate it perfectly with `organizr`.

Traefik requires you to run all of the containers you want to route the traffic to be on the same network, which is easy with docker.

    docker network create traefik-proxy --driver overlay

With that setup, all you have to do is define the network in your compose files.

### Compose Files

Since I have a bunch of containers and to give you an idea I’m only going to show you couple examples, if you would like to see all configs feel free to reach out on social media (details at the bottom).

As a reminder, I got 3 Nodes in Docker Swarm mode with node labels so that I can force docker to run the containers on specific nodes based on the hardware requirements behind them.

    $ docker node inspect manjaro-server | jq .[0].Spec.Labels.name
    "server"
    $ docker node inspect manjaro-home | jq .[0].Spec.Labels.name
    "home"
    $ docker node inspect pi | jq .[0].Spec.Labels.name
    "pi"

**Traefik**

The documentation suggests you run traefik on your master node so it can control and view all of the container events so I've forced it to run on the manager node all the time.

    version: "3.7"
    services:
      traefik:
        image: traefik:v2.0
        networks:
          - traefik-proxy
        command:
          - --entrypoints.metrics.address=:8082
          - --entrypoints.http.address=:80
          - --api.dashboard=true
          - --api.insecure=true
          - --providers.docker
          - --providers.docker.swarmMode=true
          - --providers.docker.exposedByDefault=false
        ports:
          - 80:80
          - 8080:8080
          - 8082:8082
        volumes:
          - /var/run/docker.sock:/var/run/docker.sock
        deploy:
          placement:
            constraints:
              - node.role == manager

    networks:
      traefik-proxy:
        external: true

**Guacamole**

Running this as well on the node that is 24/7 so i can access it remotely whenever i want.

    version: "3.7"
    services:
      guacamole:
        image: oznu/guacamole
        volumes:
          - /opt/guacamole:/config
        networks:
          - traefik-proxy
        deploy:
          placement:
            constraints:
              - node.labels.name == server
          labels:
            - "traefik.enable=true"
            - "traefik.http.routers.guacamole.entrypoints=http"
            - "traefik.http.routers.guacamole.rule=Host(`guacamole.local.net`)"
            - "traefik.http.services.guacamole.loadbalancer.server.port=8080"
            - "traefik.docker.network=traefik-proxy"

    networks:
      traefik-proxy:
        external: true

## Conclusion

With a couple compose files pushed to a private GIT repo (mostly for sensitive data on the configurations, need to learn how to use docker secrets) my stack is fully automated, now with an ansible playbook I can have the same setup in minutes.

Again, this was a long task and I did learn a lot on how to debug and troubleshoot mostly networking problems with containers and being my first real project that used docker-compose it was good fun.

I hope you liked it, until next time, Adios.
