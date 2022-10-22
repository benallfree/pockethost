<h1>pockethost.io</h1>

This is the open source monorepo for pockethost.io, the hosting platform for PocketBase.

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Introduction](#introduction)
- [Development](#development)
  - [Just the frontend (Svelte)](#just-the-frontend-svelte)
  - [All our base](#all-our-base)
- [Release History](#release-history)

<!-- /code_chunk_output -->

# Introduction

https://pockethost.io hosts your PocketBase projects so you don't have to. Create a project like you would in Firebase and Supabase and let PocketHost do the rest.

**Focus on your app**

Get a live PocketBase instance in 10 seconds with no backend setup:

1. Create an account at pockethost.io
2. Provision your first PocketBase instance
3. Connect from anywhere

```ts
const client = new PocketBase(`https://harvest.pockethost.io`)
```

**Batteries Included**

Here's all the Linux/devops stuff that PocketHost does for you:

- Docker
- Email and DKIM+SPF and more
- DNS jargon: MX, TXT, CNAME
- SSL cert provisioning and management
- Storage
- Volume mounts
- Could computing or VPS deployment
- CDN and static asset hosting
- Aamzon AWS
- Lots more - scaling, firewalls, DDoS defense, user security, log rotation, patches, updates, build tools, CPU architectures, multitenancy, on and on

This monorepo contains the entire open source stack that powers pockethost.io. You can use it to run your own private or public multitenant platform.

**Questions?**

Join us in the discussion area.

# Development

## Just the frontend (Svelte)

This is the easiest setup.

```bash
git clone git@github.com:benallfree/pockethost.git
cd pockethost
yarn
yarn dev:www
```

That's it. You're in business. Your local Svelte build will talk to the `pockethost.io` mothership and connect to that for all database-related tasks.

## All our base

The entire pockethost.io stack is dockerized to make it as easy as possible to mimic a production environment.

**Prerequisites**

- Docker
- Local SSL wildcard domain - [local domain setup instructions](./docs/local-domain-setup.md)

_OS X Tip - In Docker Desktop > Beta Features, enable the Virtualization framework and VirtioFS. These settings make a huge performance difference with the volume mounts used frequently with development mode._

**Running in dev mode**

The following will run the Docker stack in dev mode. Dev mode links all code to the host repo and everything will rebuild/relaunch upon modification.

```bash
git clone git@github.com:benallfree/pockethost.git
cd pockethost/docker
cp .env-template .env-local  # Edit as needed - defaults should work
cd ..
docker-compose -f docker/docker-compose.dev.yaml build
docker-compose -f docker/docker-compose.dev.yaml up
open https://pockethost.test
```

# Release History

**next**

- [ ] Improved realtime support in proxy
- [ ] Updated developer docs
- [x] Improved Docker support for dev and prod

* [x] Complete UX redesign
* [x] Idle/running status for PB instance now shows in green
* [x] Ability to run separate versions of PocketBase per instance for custom cases including beta/dev

**Icebox**

- [ ] JS/TS cloud functions ([PBScript](https://github.com/benallfree/pbscript))
- [ ] Litestream support
- [ ] fly.io deployment support
- [ ] Provision outgoing email config for new instances while hiding root credentials

**0.2.0**

- 100% dockerized
- Completely rewritten daemon proxy that launches PocketBase instances on demand

**0.0.1**

- Initial release
