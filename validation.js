const Joi = require('joi');

const createRideContract = Joi.object({
  passengerAmount: Joi.number().integer().min(1).required(),
  carMark: Joi.string().alphanum().min(3).max(30).required(),
  carYear: Joi.number().integer().min(1900).max(2013)
});

const updateRideContract = Joi.object({
  passengerAmount: Joi.number().integer().min(1).optional(),
  carMark: Joi.string().alphanum().min(3).max(30).optional(),
  carYear: Joi.number().integer().min(1900).max(2013).optional()
});

module.exports = { createRideContract, updateRideContract };
