import ms from "ms";
import objectHash from "object-hash";

export interface MethodCacheConfig {
  ttl?: string;
  adapter?: string;
  version?: number;
}

export interface ContainerConfig {
  [key: string]: MethodCacheConfig;
}

export interface Config {
  defaultTtl: string;
  defaultAdapter: string;
  container: ContainerConfig;
}

export default ({
  bottle,
  config,
  adapters,
}: {
  bottle: any;
  config: Config;
  adapters: any;
}) => {
  const defaultCacheAdapter = adapters[config.defaultAdapter];

  Object.entries(config.container).forEach(([key, methodConfig]) => {
    const cacheAdapter = methodConfig?.adapter
      ? adapters[methodConfig.adapter]
      : defaultCacheAdapter;

    const ttl =
      ms(methodConfig?.ttl ? methodConfig.ttl : config.defaultTtl) / 1000;
    const [containerKey, method] = key.split(".");

    bottle.decorator(containerKey, (service) => {
      if (!service[method]) {
        throw new Error(
          `[cache] Not found ${containerKey}.${method} in dependency container`
        );
      }

      const originalMethod = service[method].bind(service);

      service[method] = (...args) => {
        const serializedArguments = objectHash(args);
        const cacheKey = [
          key,
          ...(methodConfig?.version ? [`v${methodConfig.version}`] : []),
          ttl,
          serializedArguments,
        ].join("_");

        return cacheAdapter.wrap(cacheKey, () => originalMethod(...args), {
          ttl,
        });
      };

      return service;
    });
  });
};
