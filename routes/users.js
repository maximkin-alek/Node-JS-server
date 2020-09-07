const userRouter = require('express').Router();

const {
  getUsers, getUser, updateUserProfile, updateUserAvatar,
} = require('../controllers/users');

userRouter.get('/', getUsers);
userRouter.get('/:id', getUser);
userRouter.patch('/me', updateUserProfile);
userRouter.patch('/me/avatar', updateUserAvatar);

module.exports = userRouter;
