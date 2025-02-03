---
title: Yaml is King change my mind, please!
date: 2025-02-02
draft: false 
tags: 
- coding
- kubernetes
- iac
---

Got a short one for you this week.

If you work in the "DevOps" field, by now you have used YAML to some extent in tools like Kubernetes, Docker Compose, or Ansible. How about some CI/CD like GitHub Actions? Maybe you are one of those psychopaths who write Terraform in either JSON or YAML—it should be illegal to do that, in my opinion.

Either way, you have seen YAML and maybe like it, maybe hate it, but we cannot deny the fact that it is king for a lot of tools out there, with JSON and TOML nearby, trying to take the spot.

Now, I'm on the middle ground. As much as YAML helped me when I started my career in Ansible and later on with Kubernetes—since it's easy to write and understand—it's ALSO a nightmare to work with because of its super helpful but stupid indentation rules. And while you might say, "Well, just use a formatter and stop crying..." Sure, crying is fun, but what if the formatter isn't aware of the schema and suddenly puts that item at a different indentation level? Well, now we both cry together, and that is beautiful!

You may know that I use Neovim (btw), so even with a formatter and a great LSP + linter, it all becomes useless if you start spewing out random YAML files. So, it is imperative that your editor is aware of your schema and what goes where, which is why things like schemastore help out a lot when working with these filetypes. A bit ironic, as the SchemaStore project is mostly for JSON, but we can all live happily together.

Setting up a good workflow is not exactly easy—a lot of manual intervention is still required. Maybe other editors do a better job. If they do, please let me know, as I use YAML a lot!

So what alternatives do we have? Glad you asked.

- Cue: A great open-source language that can generate and validate files to be turned into other formats like YAML.
- JSON: Yes, it's probably easier to write since there's no indentation, with the caveat of a ton of quotes around keys, but that might be better in the long run. You can always use a tool to transpile it to YAML.
- HCL: As a Terraform enjoyer, I like the language and find it easy to understand, with the constraint that it's mostly used in HashiCorp tooling, so it's a bit restrictive.
- TOML: Haven't used it much, so nothing to say here, but I know it's a good alternative.

Whatever you end up picking, remember there are tools out there to help make it easier to work with, like yj.

YAML is King. Change my mind, please!

Adios 👋