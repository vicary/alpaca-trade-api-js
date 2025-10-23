"use strict";

const joi = require("joi");

const apiError = (statusCode = 500, message = "Mock API Error") => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

// deals with Express not handling modern js very well.
// Just wraps async api methods in a try/catch,
// and lets them return results to the client with `return`.
// This is only to be used for express endpoints, not for middlewares.
const apiMethod = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res, next);
    if (!res.headersSent) res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// validates input against a joi schema. Throws an apiError if it does not pass.
const assertSchema = (value, schema, options) => {
  const result = joi.object(schema).validate(value, options);
  if (result.error) {
    throw apiError(422, result.error);
  }
  return result.value;
};

module.exports = {
  apiError,
  apiMethod,
  assertSchema,
};
