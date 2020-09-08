const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordValidator = require('password-validator');
const User = require('../models/user');
const UnauthorizedError = require('../errors/unauthorizedError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const ConflictError = require('../errors/conflictError');
const NotFoundError = require('../errors/notFoundError');

const { NODE_ENV, JWT_SECRET } = process.env;

const passValid = new PasswordValidator();
passValid
  .is().min(8)
  .is().max(100)
  .has()
  .not()
  .spaces();

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};
module.exports.getUser = (req, res, next) => {
  User.findById(req.params.id)
    .orFail(() => { })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такого пользователя не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};
module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!passValid.validate(password)) {
    throw new BadRequestError('Пароль должен содержать не менее 8 символов');
  } else {
    bcrypt.hash(password, 10)
      .then((hash) => {
        User.create({
          name, about, avatar, email, password: hash,
        })
          .then((user) => res.send({
            _id: user._id,
            name: user.name,
            about: user.about,
            avatar: user.avatar,
            email: user.email,
          }))
          .catch((err) => {
            if (err.name === 'ValidationError') {
              throw new BadRequestError('Данные не валидны');
            } else if (err.name === 'MongoError' && err.code === 11000) {
              throw new ConflictError('Пользователь с таким email уже существует');
            } else { next(err); }
          })
          .catch(next);
      })
      .catch((err) => next(err));
  }
};

module.exports.updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .orFail(() => { })
    .then((user) => {
      if (user.id === req.user._id) {
        res.send({ data: user });
      } else {
        throw new ForbiddenError('Недостаточно прав для этого действия');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Данные не валидны');
      } else if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такого пользователя не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};

module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .orFail(() => { })
    .then((user) => {
      if (user.id === req.user._id) {
        res.send({ data: user });
      } else {
        throw new ForbiddenError('Недостаточно прав для этого действия');
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Данные не валидны');
      } else if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такого пользователя не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUser(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : '654gfqwg46q5q69qw4frf654', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(() => {
      throw new UnauthorizedError('Необходима авторизация');
    })
    .catch(next);
};
