const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PasswordValidator = require('password-validator');
const User = require('../models/user');

const passValid = new PasswordValidator();
passValid
  .is().min(8)
  .is().max(100)
  .has()
  .not()
  .spaces();

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Ошибка сервера' }));
};
module.exports.getUser = (req, res) => {
  User.findById(req.params.id)
    .orFail(() => { })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Такого пользователя не существует' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный Id' });
      } else { res.status(500).send({ message: 'Ошибка сервера' }); }
    });
};
module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!passValid.validate(password)) {
    res.status(400).send({ message: 'Пароль должен содержать не менее 8 символов' });
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
              res.status(400).send({ message: `Данные не валидны: ${err.message}` });
            } else if (err.name === 'MongoError' && err.code === 11000) {
              res.status(409).send({ message: 'Пользователь с таким email уже существует' });
            } else { res.status(500).send({ message: 'Ошибка сервера' }); }
          });
      })
      .catch(() => { res.status(500).send({ message: 'Ошибка сервера' }); });
  }
};

module.exports.updateUserProfile = (req, res) => {
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
        res.status(403).send({ message: 'Недостаточно прав для этого действия' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Данные не валидны: ${err.message}` });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Такого пользователя не существует' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный Id' });
      } else { res.status(500).send({ message: 'Ошибка сервера' }); }
    });
};

module.exports.updateUserAvatar = (req, res) => {
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
        res.status(403).send({ message: 'Недостаточно прав для этого действия' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Данные не валидны: ${err.message}` });
      } else if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Такого пользователя не существует' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный Id' });
      } else { res.status(500).send({ message: 'Ошибка сервера' }); }
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  return User.findUser(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'a2ee16c5379c1de2f488b7dfff5544c20f8c0606893e7370f5d766d5e37659c9', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
