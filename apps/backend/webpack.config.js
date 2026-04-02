module.exports = function (options) {
  return {
    ...options,
    externals: (options.externals || []).map((ext) => {
      if (typeof ext !== 'function') return ext;
      return function (info, callback) {
        if (info.request && info.request.startsWith('@scoreboard/core')) {
          return callback();
        }
        return ext(info, callback);
      };
    }),
    watchOptions: {
      ...options.watchOptions,
      ignored: /node_modules/,
      // Evita múltiplos rebuilds seguidos (reduz race no kill/spawn do nest start --watch)
      aggregateTimeout: 400,
    },
  };
};
