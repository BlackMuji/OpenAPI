const path = require('path');

module.exports = {
    webpack: {
        alias: {},
        plugins: [],
        configure: (webpackConfig) => {
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                stream: require.resolve('stream-browserify'),
                timers: require.resolve('timers-browserify'),
            };
            return webpackConfig;
        },
    },
};
