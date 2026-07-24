---
lang: en
title: What is a Forward Deployed Engineer? 8 months in the role
description: I swapped "SRE" for "Forward Deployed Engineer" last November. Here's what the buzzword actually means day to day, and what I'd learn before chasing the role.
pubDate: 2026-07-24
draft: false
tags:
  - meta
---

"Forward Deployed Engineer." That was my new title as of last November, swapped in for "SRE" after I changed jobs. My first reaction? What the hell does that even mean, and what kind of buzzword is this?

After some reading, including [this Pragmatic Engineer piece](https://newsletter.pragmaticengineer.com/p/forward-deployed-engineers), the combination of duties made more sense. But paper never matches the real day-to-day, so here's what it's actually been like being an FDE at SigNoz for the past 8 months.

The TL;DR from the article in my humble opinion: you become a mix of an SRE and a Solutions Engineer, partnering with sales reps to "deploy" a product inside the customer's environment. But you also become the expert on that environment, adapting the product to their business needs.

That's an oversimplification, of course. The role needs deep knowledge of networking, cloud providers, and the deployment patterns used in production. No two customers are alike, which is what makes it interesting: the product runs differently every single time. You also need to know your own product inside and out, so you can explain it and adapt it.

> One thing I keep seeing online is that FDEs mostly work for AI product companies, which is misleading at best. I know the AI hype is strong, but there's plenty of opportunities to execute the role without pushing AI into the mix.

Another big part is being the support person for that customer. Maybe that's unique to my org, maybe it's part of the role itself. In a bigger company this probably lives with a dedicated team, but at a smaller shop you may end up doing support and helping customers actually use the product.

It's not far off from what a Solutions Engineer does: you're the product expert, you know how it was deployed, and you know the workflows it's being used for. Nothing negative about it, but keep it in mind if you're considering this kind of role. Better yet, ask about it in the interview if support isn't the work you want.

Personally, I started my IT career in support, so I'm used to it. It's how I find problems to solve.

## What a day to day looks like
- You will most likely still have your regular standups, depends on how the team/org operates.
- You need to constantly stay on top of customer channels and emails. Make sure nothing new is outstanding or left without a response.
- You have to follow up on existing tickets you created on behalf of customers with engineering teams. Sort of like a product owner.
- To be able to offer support, you will need to read the changelog and commits to validate if the features/fixes/bugs that may affect the customer are solved. Since you are now "embedded" in the product, you need to be able to read the code and see how it affects the customer.


## What about the technical aspect?
So far I've described your typical Solutions Engineer plus support, but what about coding and actually getting down to business? You're wearing multiple hats now, so you're still involved in how the platform operates. You review and produce code, you build tooling to make the customer's life easier, and you still get down and debug all kinds of scenarios. From my experience, the typical SRE work doesn't change that much.

The last big piece is being a bridge between customers and engineers: understanding what the customer wants to do with your product and translating it into a feature or fix engineering can act on, then tracking it and reporting back to the customer. It's why so many postings stress clear communication and the ability to explain concepts simply. That part is real, and it's a big piece of the work.

If you lack experience in cloud, containers, and automation, or in the product itself, you will have a hard time in this role. You also need real tracking discipline on top of it, otherwise things fall through the cracks and the customer ends up feeling forgotten.


## Ok I'm sold how do I start?
Believe it or not, I've gotten a few messages over on Reddit asking what the day to day looks like, or what skills I studied to land this kind of role. Those questions are the main reason I decided to write this post. Hopefully it helps someone out there.

If my ultimate goal was to become an FDE, I would want **a good amount** of experience with:
- Cloud and how it works: You will need to run the product in either containers, VMs, Lambdas, etc. You need to know how those work, from setting them up to securing the environment.
- Networking as a whole: Once the product is up, data needs to go in and out, usually in a secure way. A solid grasp on networking is always ideal.
- Containers and K8s: Almost everything nowadays runs as a container so you will find Kubernetes in the real world. Learn the kubes, embrace the kubes.
- Linux and terminal: You will need to validate or troubleshoot the product at some point. That means remoting into machines and containers, or using the CLI to pull the information you need.
- A good system to track: This one depends heavily on your organization and its requirements. But they can hand you the best tool out there and it still won't work if you don't have the habit of writing down and reviewing your work daily.
- Document everything: A general practice, but here you'll run into a lot of scenarios that end up becoming a product feature or a reusable playbook for the next customer. Do yourself a favor and **just write it down**.
- Communication is key: You'll be talking to engineers and managers from all over, internal and external. Be clear about your intent and assume good intentions. You're representing your company and your product, so keep that in mind. Engineering tends to be full of big egos, so it's always a challenge.


## Conclusion
That's my honest take on the role, the duties, and what I think you need to pursue it.

If all of that sounds good, you know what to go learn. And if none of it appealed to you, that's just as useful: you can drop the role from your job search, because the support and communication side isn't for everyone.

Until the next one!

Adios
