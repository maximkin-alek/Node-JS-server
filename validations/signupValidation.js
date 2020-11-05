const { celebrate, Joi } = require('celebrate');
const { urlValidator } = require('./urlValidator');

const signupValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().custom(urlValidator),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports = { signupValidator };
