---
title: 'Improving Node.js network performance'
date: 2022-07-04
author: 'bmz'
image: '/img/performance.jpg'
tags: ['nodejs', 'network', 'http', 'performance']
description: "In this post, I’ll walk you through what kind of bottlenecks I've found under high load, and how to address them."
metas:
  title: 'Improving Node.js network performance'
  description: 'In this post, I’ll walk you through what kind of bottlenecks I've found under high load, and how to address them.'
  image: 'img/performance.jpg'

---

## TLDR

- It’s almost a cliché, but never block the event loop
- Use `Keep-Alive` HTTP Agent, even with AWS services (use `agentkeepalive` npm package)
- Use caching when possible

## Inspiration of this article

At my company we have to deal with high network loads, these are the findings how we improved the performance of our services.

So let’s dive in.

## The libuv thread pool

[https://nodejs.org/en/docs/meta/topics/dependencies/#libuv](https://nodejs.org/en/docs/meta/topics/dependencies/#libuv)

Node uses the thread pool to handle operations defined in the following modules:

- **fs**: file system I/O operations
- **dns**: DNS operations
- **zlib**: compression operations
- **crypto**: cryptography operations

These operations appear to be asynchronous in a JavaScript perspective, but they're actually internally implemented as synchronous calls within node's internal libuv threadpool (which by default has only 4 threads). So if we have high traffic, and if you do for an example >4 DNS lookups in parallel then they’re going to block the libuv threadpool, even though they look like async IO.

## The DNS problem

As stated above, DNS resolving is a synchronous task in Node.js handled by the libuv thread pool. It’s not a problem until you have high amount of network traffic. 

Also, there is no DNS caching in Node.js by default.

`dns.lookup()`

This is the function Node.js is using internally for resolving domain names.

It is implemented as a synchronous call to getaddrinfo(3) that runs on libuv's threadpool. Because libuv's threadpool has a fixed size, it means that if for whatever reason the call to getaddrinfo(3) takes a long time, other operations that could run on libuv's threadpool will experience degraded performance.

### Possible solutions

- use DNS caching, use a http client library that is capable of it (https://github.com/sindresorhus/got)
- [https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/](https://kubernetes.io/docs/tasks/administer-cluster/nodelocaldns/)
- use `dns.resolve()`, which is not handled by the thread pool
- apply `Keep-Alive` HTTP Agent
- pro tip: add a `.` to the end of absolute url (`https://facebook.com.`)
    - skip ndots

If you want to understand more deeply how DNS resolving works, check out this DNS zine book.

[https://wizardzines.com/zines/dns/](https://wizardzines.com/zines/dns/)

## Keep-Alive HTTP agent

By default, HTTP creates a new TCP connection for every request.  [HTTP keep-alive](https://en.wikipedia.org/wiki/HTTP_persistent_connection)
allows HTTP clients to re-use connections for multiple requests, and relies on timeout configurations on both the client and target server to decide when to close open TCP sockets.

With implementing `Keep-Alive` we can reuse the connection, therefore the amount DNS lookups are reduced.

### Node

Using keep-alive:

- first install `agentkeepalive` (https://github.com/node-modules/agentkeepalive)

```js
npm i agentkeepalive
```

- apply agent to axios

```js
import KeepAliveAgent from 'agentkeepalive'

const keepAliveAgent = new KeepAliveAgent({ keepAlive: true, timeout: 10000 })

const instance = axios.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'},
  httpAgent: keepAliveAgent,
});
```

`agentkeepalive` will take care of closing the client’s connection before the server does. It eliminates most of the `ECONNRESET` and `socket hang up` errors.

Switching to HTTP 2 in the future will also give a performance boost.

### AWS services

[https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html)

Enabling keep-alive for AWS services is very simple. Just add `AWS_NODEJS_CONNECTION_REUSE_ENABLED=1` env to the service.

Since it is enabled, P99 latency rarely go above 100ms towards AWS.

## Caching

Implement caching whenever possible. You can easily do caching with the library below.
[p-memoize](https://www.npmjs.com/package/p-memoize)


**Knowledge-base**:

[https://connectreport.com/blog/tuning-http-keep-alive-in-node-js/#:~:text=HTTP keep-alive allows HTTP,In Node](https://connectreport.com/blog/tuning-http-keep-alive-in-node-js/#:~:text=HTTP%20keep%2Dalive%20allows%20HTTP,In%20Node).

[https://medium.com/ssense-tech/reduce-networking-errors-in-nodejs-23b4eb9f2d83](https://medium.com/ssense-tech/reduce-networking-errors-in-nodejs-23b4eb9f2d83)

[https://httptoolkit.tech/blog/configuring-nodejs-dns/](https://httptoolkit.tech/blog/configuring-nodejs-dns/)

[https://nodejs.org/api/dns.html](https://nodejs.org/api/dns.html)

[https://medium.com/swlh/solving-node-dns-issues-and-other-things-5051d8526cac](https://medium.com/swlh/solving-node-dns-issues-and-other-things-5051d8526cac)
