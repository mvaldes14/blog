---
title: I built my own task manager
tags:
  - ai
draft: false
date: 2026-04-07
---
# Just build it bro
It all started on a night out with my buddies; a friend of mine showed me he is building a little todo app by purely prompting it like a pro, the following day after a good hang over I thought to myself, what if instead of renewing my Todoist sub at an elevated price and use 10/50 features they offer. What if I build my own app with a 10x developer guy I know "Claude"?. He will not complain or ask for revenue once we ship it 😂.

After debating it internally for maybe 30 seconds I started a new Obsidian document and started to write some technical specs of what features I wanted (you know the AI bros call it Spec Driven Development); What the design was going to look like and overall define the few features I've seen in tools over the years so I can replicate and adjust them to work for me.

After a little while, these were the list of **must have items** for me in any task manager:
- NLP parsing so I can type my notes naturally, like "write a blog post next week at 10am" and it understand what that truly means and schedule it.
- Being able to link tasks to external systems and access them in a click, dislike opening up a task and scrolling to find artifacts that are relevant like links.
- Keyboard shortcuts so I can navigate around the application, did I mention I use nvim btw?
- UI/UX that works on both Desktop and Mobile, I tend to add a lot of my tasks on the go.
- Display and sync tasks to and from calendars.
- Show some stats on how I'm doing, nothing motivates me more than seeing pretty graphs.

# It was time to build
With the requirements laid out, a good beer and couple extra prompts and a good framework to do testing and deployment in a fast cycle between Claude and myself had a good MVP built in an hour. Over time...or the next hours and the following days I kept thinking of new features that I would write down in Obsidian while in bed/working out/walking outside with enough requirements and constraints so they could be added later.

After a week of prompting like a mad man and running out of credits having to spend extra $27.45 out of my wallet in extra usage, the app went live on my Homelab. Showed it to my wife and friends and because of that some extra new features were added like:
- Ability to assign tasks to users.
- Have shared projects people can add tasks to.
- Easier UI for more non-technical people to understand and use.

The original plan was for this to be a solo user app, but having more people use your software is always an amazing feeling, had to start thinking about features that could benefit others too, see how easily I became a product owner?.

- Is this the best app ever?. No
- Does it not have bugs?. Hell yeah!.
- Is it sloppy and the code is ugly? Yes and I don't care.
- Does it suit my needs and makes me 100% sure to drop Todoist?. Damn right, already canceled my upcoming renewal

>If you want to see how it works, features and some screenshots, take a peek at the [repository](https://github.com/mvaldes14/task-manager). It is open source, keeps getting features so it's pretty unstable and sloppy, but that's how AI works.

## A Few Thoughts on AI Slop
- Being capable of building and replacing your software subscription software and tailor it to YOUR needs is an amazing feeling.
- I still think and believe **YOU VIBE CODER NEED** some level of experience to be able to produce something that is of good quality and minimize the number of potential security issues, we have all seen stories of people vibe coding entire apps with API back-ends that require no credentials or checks at all exposing all of your data.
- The development speed is unmatched, I could've written the backend and maybe take couple days to finalize it before even thinking of building the User Interface.
- I have **ZERO** react knowledge so having built an entire app that works both in mobile and desktop as a native app without knowing anything front end related is just fascinating.

# Conclusion
My own task manager is now everything I ever wanted, it runs locally so no one sees my data and it has all of the integrations I need, hell it's even OTEL compatible so I can build pretty dashboards in my observability tool.

Some parting takes:
- You can replace any subscription software you're paying for in this era of AI. While this is good for the general user, deploying and keeping the software online is still somewhat of a challenge.
- Always challenge and validate what it produces for you.
- Security should be always present in your designs and specs, even if it's a dummy application you want to share over the internet, someone out there WILL try to exploit it, so keep your secrets secure.
- Embrace AI to aid you in the areas you are weak or have no experience on and be honest while co-working.
- I did in fact ask Claude after the initial deployment and release for some feedback based on his experience working with me, quality of prompts and being able to provide guidance when things broke and not gonna lie, felt pretty good with what I got.
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">You gotta buy me dinner first Claude, but this is a good start. <a href="https://t.co/Pxw5Th4G3g">pic.twitter.com/Pxw5Th4G3g</a></p>&mdash; Miguel Valdes (@mr_mvaldes) <a href="https://twitter.com/mr_mvaldes/status/2032226940975804834?ref_src=twsrc%5Etfw">March 12, 2026</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

