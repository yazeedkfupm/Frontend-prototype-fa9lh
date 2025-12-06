const { AppError } = require('./errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertString(value, field, options = {}){
  const {
    trim = true,
    minLength,
    maxLength,
    email = false,
    lowercase = false,
    optional = false,
  } = options;

  if (value == null){
    if (optional) return undefined;
    throw AppError.badRequest(`${field} is required`);
  }
  if (typeof value !== 'string'){
    throw AppError.badRequest(`${field} must be a string`);
  }
  let output = trim ? value.trim() : value;
  if (minLength && output.length < minLength){
    throw AppError.badRequest(`${field} must be at least ${minLength} characters`);
  }
  if (maxLength && output.length > maxLength){
    throw AppError.badRequest(`${field} must be at most ${maxLength} characters`);
  }
  if (email && !EMAIL_REGEX.test(output)){
    throw AppError.badRequest(`${field} must be a valid email address`);
  }
  if (lowercase){
    output = output.toLowerCase();
  }
  return output;
}

function assertNumber(value, field, options = {}){
  const { min, max, integer = false, optional = false } = options;
  if (value == null || value === ''){
    if (optional) return undefined;
    throw AppError.badRequest(`${field} is required`);
  }
  const num = Number(value);
  if (!Number.isFinite(num)){
    throw AppError.badRequest(`${field} must be a number`);
  }
  if (integer && !Number.isInteger(num)){
    throw AppError.badRequest(`${field} must be an integer`);
  }
  if (min != null && num < min){
    throw AppError.badRequest(`${field} must be greater than or equal to ${min}`);
  }
  if (max != null && num > max){
    throw AppError.badRequest(`${field} must be less than or equal to ${max}`);
  }
  return num;
}

function assertBoolean(value, field, { optional = false } = {}){
  if (value == null){
    if (optional) return undefined;
    throw AppError.badRequest(`${field} is required`);
  }
  if (typeof value === 'boolean'){
    return value;
  }
  if (value === 'true' || value === 'false'){
    return value === 'true';
  }
  throw AppError.badRequest(`${field} must be true or false`);
}

function assertEnum(value, field, allowed, { optional = false } = {}){
  if (value == null){
    if (optional) return undefined;
    throw AppError.badRequest(`${field} is required`);
  }
  if (!allowed.includes(value)){
    throw AppError.badRequest(`${field} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

function assertObject(value, field, { optional = false } = {}){
  if (value == null){
    if (optional) return undefined;
    throw AppError.badRequest(`${field} is required`);
  }
  if (typeof value !== 'object' || Array.isArray(value)){
    throw AppError.badRequest(`${field} must be an object`);
  }
  return value;
}

module.exports = {
  assertString,
  assertNumber,
  assertBoolean,
  assertEnum,
  assertObject,
};
