# cache-bottle-dependencies

Cache any factory method using a unified config with configurable adapters and ttls.

## Installation

```bash
npm install cache-bottle-dependencies
```

## Usage

```javascript
import Bottle from "bottlejs";

import cacheManager from "cache-manager";
import redisStore from "cache-manager-ioredis";

import cacheBottleDependencies from 'cache-bottle-dependencies';

const bottle = new Bottle();

const adapters = {
  redis: cacheManager.caching({
    store: redisStore,
    host: REDIS_HOST,
    ttl: ms(cacheConfig.defaultTtl),
  }),
  memory: cacheManager.caching({
    store: "memory",
    ttl: ms(cacheConfig.defaultTtl),
  }),
};

const config = {
  defaultTtl: "3h",
  defaultAdapter: "redis",
  container: {
    productsRepository.get: {
      ttl: "10m",
      adapter: "memory",
      version: 2,
    },
    productsRepository.list: true,
  },
};

cacheBottleDependencies({ bottle, adapters, config });
```
