import 'module-alias/register';
import { addAliases } from 'module-alias';

addAliases({
  '@': `${__dirname}/`,
});

import { createServer } from "@/app";
import config from "@/config";
import 'http';

const startServer = () => {
    const app = createServer();
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
}

startServer();