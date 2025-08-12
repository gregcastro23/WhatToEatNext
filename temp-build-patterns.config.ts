
        const anyConfig: any = process.env.CONFIG;
        console.log('Configuration loaded');
        const dynamicRequire = require(process.env.MODULE);
      