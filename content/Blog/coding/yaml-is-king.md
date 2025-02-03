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

If you work in the "DevOps" field by now you have used YAML to some extent in tools like Kubernetes, Docker Compose or Ansible, how about some CICD like Github Actions?. Maybe you are one of those psycopaths that write Terraform in either JSON or YAML, it should be ilegal to do that in my opinion.

Either way you have seen YAML and maybe like it, maybe hate it but we cannot deny the fact that it is king for a lot of tools out there with JSON and TOML nearby trying to take the spot.

Now I'm on the middle ground as much YAML helped me when I started with my career in Ansible and later on with Kubernetes since it's easy to write down and understand it's ALSO a nightmare to work with because of it's super helpful but stupid indentantion rules and while you might say, well just use a formatter and stop crying... sure crying is fun but what if the formatter isn't aware of the schema and suddenly puts that item in a different indentantion level?. Well now we both cry together and that is beautiful!.

You may know that I use neovim (btw), so even with a formatter and a great LSP + Linter it all becomes useless if you start spewing out random YAML files so it is imperative your editor is aware of your schema and what goes where which is why things like [schemastore](https://github.com/b0o/SchemaStore.nvim) help out a lot when working with said filetypes, a bit ironic as the schemastore project is mostly for JSON but we can all live hapily together. 

So having a good setup is not exactly easy, a lot of manual intervention is still required. Maybe other editors can do better job, if they do please let me know as I use YAML a lot!.

So what alternative do we have?. Glad you asked.
- Cue: A great open source language that can generate and validate files to be turned into other formats like YAML.
- JSON: Yes it's prolly easier to write since no indentation with the caveat of a ton of quotes around keys but that's maybe better down the road and use a tool to transpile it to YAML.
- HCL: As a terraform enjoyer I like the language and find it easy to understand with the constraint that it's mostly used in Hashicorp Tooling so it's a bit restrictive.
- TOML: Haven't used it much so nothing to say here but I know its a good alternative.

So whatever you end up picking remember there are tools out there to help you make it easy to work with like [yj](https://github.com/sclevine/yj).

YAML is King Change my mind please!

Adios 👋