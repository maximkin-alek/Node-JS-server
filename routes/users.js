const userRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { urlValidator } = require('../validations/urlValidator');

const {
  getUsers, getUser, updateUserProfile, updateUserAvatar,
} = require('../controllers/users');

userRouter.get('/', getUsers);
userRouter.get('/:id', getUser);

userRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateUserProfile);

userRouter.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(urlValidator),
  }),
}), updateUserAvatar);

module.exports = userRouter;
