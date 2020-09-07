const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(() => res.status(500).send({ message: 'Ошибка сервера' }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: `Данные не валидны: ${err.message}` });
      } else {
        res.status(500).send({ message: 'Ошибка сервера' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findById(req.params.id)
    .orFail(() => { })
    .populate('owner')
    .then((card) => {
      if (card.owner.id === req.user._id) {
        card.remove()
          .then(() => {
            res.send({ data: card });
          })
          .catch(() => res.status(500).send({ message: 'Ошибка сервера' }));
      } else { res.status(403).send({ message: 'Недостаточно прав для этого действия' }); }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Такой карточки не существует' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный Id' });
      } else { res.status(500).send({ message: 'Ошибка сервера' }); }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => { })
    .then((card) => { res.send({ data: card }); })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Такой карточки не существует' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный Id' });
      } else { res.status(500).send({ message: 'Ошибка сервера' }); }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => { })
    .then((card) => { res.send({ data: card }); })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        res.status(404).send({ message: 'Такой карточки не существует' });
      } else if (err.name === 'CastError') {
        res.status(400).send({ message: 'Некорректный Id' });
      } else { res.status(500).send({ message: 'Ошибка сервера' }); }
    });
};
