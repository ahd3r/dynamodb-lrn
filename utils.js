const pino = require('pino');
const { pinoLambdaDestination } = require('pino-lambda');

const logger = pino(
  // {
  //   transport: {
  //     target: 'pino-pretty'
  //   }
  // },
  pinoLambdaDestination()
);

module.exports = { logger };
