
        const config = require('./some-config');
        const dynamicModule = require(process.env.MODULE_NAME);
        module.exports = { ...config };
      