MultiConsumer Bull
===================

A [multi-consumer queue](https://www.npmjs.com/package/multiconsumer-queue) implementation using [Bull](https://www.npmjs.com/package/bull) queue.


## Installation

```
npm install --save multiconsumer-bull
```

## Usage examples

```typescript
import * as Bull from "bull"
import * as redis from "redis"
import {MultiConsumerBull} from "multiconsumer-bull"

const bus = MultiConsumerBull(new Bull("redis://127.0.0.1:6379"), () => redis.createClient())

// Process "my-topic" for logging
bus.topic("my-topic").process("log", (job, cb) => {
  console.log("got new job in topic \"my-topic\" with data", job.data)
  cb()
})

// Save all "my-topic" messages to database
bus.topic("my-topic").process("save", (job, cb) => {
  console.log("here we're going to save all messages from \"my-topic\" to database", job.data)
  cb()
})

bus.topic("my-topic").add("Hello World!")
```

NOTE: Wrapper implementation is not removing consumer groups from `RedisLiveQueue` so once you're
 not interested anymore for processing topic messages for specific `groupId` -
 you must remove that group and tasks manually

Group can be removed using `MultiConsumerQueueImpl.removeGroup()` method:

```typescript

const bus = MultiConsumerBull(...)

// deploy this to your servers to stop collecting tasks
bus.topic("my-topic").removeGroup("old-process-group")

```

You will still have to manually remove tasks already added for that group, or maybe those may expire, 
this depends on how source `NamedQueue` is implemented.


## Contribute

> Perfection is Achieved Not When There Is Nothing More to Add, 
> But When There Is Nothing Left to Take Away

Fork, Contribute, Push, Create pull request, Thanks. 


## License

All code in this repository is licensed under the Apache License, Version 2.0. See [LICENCE](./LICENSE).
