/*
 * Copyright (c) 2017 by The Bull MultiConsumer Project Developers.
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as Bull from "bull"
import * as redis from "redis"
import { createStringsLiveSet } from "redis-liveset"
import {
  DynamicallyNamedQueue, EventBus, EventBusImpl, MultiConsumerQueueImpl,
  NamedQueue, NamedQueueWrap, ProcessCallback, Queue
} from "multiconsumer-queue"

class BullNamedQueue implements NamedQueue<Bull.Job> {

  constructor(private readonly _out: Bull.Queue) {
  }

  add(name: string, data: any): void {
    this._out.add(name, data)
  }

  process(name: string, fn: ProcessCallback<Bull.Job>, n: number = 1): void {
    this._out.process(name, n, fn)
  }
}

/**
 * Build new multi-consumer queue
 */
export function MultiConsumerBull(queue: Bull.Queue,
                                  redis: () => redis.RedisClient,
                                  liveSetKey: (topic: string) => string = (topic) => `bullConsumerGroups/${topic}`): EventBus<Bull.Job> {
  return new EventBusImpl((topic: string) => {
    const kQueue = new BullNamedQueue(queue)
    const src: Queue<Bull.Job> = new NamedQueueWrap(topic, kQueue)
    const dest: NamedQueue<Bull.Job> = new DynamicallyNamedQueue((groupId) => `${topic}/${groupId}`, kQueue)
    const groups = createStringsLiveSet(liveSetKey(topic), redis(), redis())

    return new MultiConsumerQueueImpl(src, dest, groups, (job) => job.data)
  })
}

export default MultiConsumerBull
