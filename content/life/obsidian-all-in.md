---
title: How I Use Obsidian for Everything (Almost)
date: 2026-01-26
tags:
  - blog
  - personal
draft: true
---
## One App to Rule them all
It's been almost a 2 years since I moved everything into a single little application you may have heard about, called Obsidian. The initial migration was just to move all of my wiki entries on tech stuff I'm currently learning or using like my Kubernetes/Docker/Linux notes as well as entries related to concepts like Event Driven Design, TDD or programming languages I'm learning like Go/TS/Lua/Rust.

After migrating 50 or so notes, everything was done and ready to use within Obsidian, then the Neovim itch started,  soon discovered there is an amazing plugin that let's you do plenty of actions you want from within our beloved editor with the __ONE BIG CAVEAT__ that in order to sync the data (I actually pay for Sync as a way to appreciate the dev's work) you need to open up the application which kind of defeats the purpose of running your vault from your text editor.

Which led me to an amazing realization, Neovim is good but you shouldn't do everything on it.
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Repeat after me. Not everything has to be done from Neovim.</p>&mdash; Miguel Valdes (@mr_mvaldes) <a href="https://twitter.com/mr_mvaldes/status/2011546158129393958?ref_src=twsrc%5Etfw">January 14, 2026</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

Once that pill went through my system one afternoon which led to me crying myself to sleep that day, it eventual led me organize my vault within the application which tends to make people go into the rabbit hole that is spending more time organizing your vault instead of actually using it. Not gonna lie that hole became my prison for a week or two until the whole system finally clicked as I could use some plugins from the community and the base editor, mostly bases.

## Bases are amazing
Before bases the organization and finding documents experience was a bit painful as my whole structure went through several productivity frameworks, from pure GTD to PARA and even a crazy one called Johny Decimal. In the end I have a mix of the frameworks that makes putting notes into a reliable and efficient system which greatly benefits from bases that allow me to visualize and see everything in the vault dashboard.

> Having a set of standardized properties into different types of notes also help with an easy vault management and use, here are some examples on some of my bases for big projects I’m tracking.

1. Vault organization that mixes PARA, GTD and a bit of Johny-Decimal.
<img src="https://s3.mvaldes.dev/blog/obsidian-vault.png" alt="Obsidian Vault" />
2. Dashboard using bases to see all of my tickets/tasks
<img src="https://s3.mvaldes.dev/blog/obsidian-dashboard.png" alt="Obsidian Dashboard" />
3. How this blog is written and organized as well
<img src="https://s3.mvaldes.dev/blog/obsidian-blog.png" alt="Obsidian Blog" />


## Task management is still disappointing
One big aspect of dumping my entire life into Obsidian was organizing my tasks, which again Bases help out a lot but it is simply not the same.

I know there are several plugins that allow you to do task management within the tool, but I feel they lack some key features which are mandatory in my opinion in any task application:
- Notifications
- Repetitive tasks
- Sub tasks
- Calendar synchronization

For years I have used and paid for Todoist but after recent drama of focusing on AI features and price hikes seems like the company is focused on something that I simply don't like nor enjoy. So I'm trying to use a mix of Apple reminders and Obsidian.

## Use of AI
We couldn't wrap this up without mentioning the ever increasing topic of AI within your vault, there are again a number of plugins available but a lot of people out there are simply using things like `opencode` or `claude code` to organize, update or review the contents on their vaults which is something that caught my attention, so of course I allowed AI into my notes to standardize couple things like:

- Tag redundancy, went from 70 tags to 43
- Missing properties in documents
- Introduction and use of aliases to refer to topics easier

Another big aspect is that my vault is backed up as a git repository I can also run cron jobs using Github Actions +  AI to create weekly reviews of my tasks or help me organize the inbox automatically while keeping my properties, tags and way of organizing consistent.

> I know giving your entire life to AI isn't ideal but at least it's not reading my emails/calendar or chat history.... looking at you clawdbot users.

## In the end, it doesn't even matter
Ultimately my Obsidian vault is something that will keep evolving and changing but couple things are here to stay:

- Use of AI to organize and keep consistency, ideally make those interactions run within my environment so providers do not have my entire vault at their disposal.
- Use Obsidian directly instead of patching things via Neovim
- Keep trying to find the perfect balance and setup for task management while reducing the dependency on several apps for it

Hope you enjoyed it.
Adios 👋
