const pino = require('pino');
const { pinoLambdaDestination } = require('pino-lambda');

const logger = pino();

module.exports = { logger };
