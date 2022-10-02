const pino = require('pino');

const logger = pino();

class ServerError extends Error {
  constructor(msg) {
    super(msg);
    this.type = 'ServerError';
    this.status = 500;
  }
}

class ValidationError extends Error {
  constructor(msg) {
    if (Array.isArray(msg)) {
      super('ValidationArrayError');
      this.errors = msg;
    } else {
      super(msg);
    }
    this.type = 'ValidationError';
    this.status = 400;
  }
}

module.exports = { logger, ValidationError, ServerError };
