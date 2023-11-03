import { default as pino } from 'pino';

export const logger = pino({
    name: 'sevenify-rest',
    level: 'debug',
});
