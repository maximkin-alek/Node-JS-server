const Card = require('../models/card');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const NotFoundError = require('../errors/notFoundError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError(`Данные не валидны: ${err.message}`));
      } else {
        next(err);
      }
    })
    .catch(next);
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.id)
    .orFail(() => { })
    .populate('owner')
    .then((card) => {
      if (card.owner.id === req.user._id) {
        card.remove()
          .then(() => {
            res.send({ data: card });
          })
          .catch(next);
      } else { throw new ForbiddenError('Недостаточно прав для этого действия'); }
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такой карточки не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => { })
    .then((card) => { res.send({ data: card }); })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такой карточки не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => { })
    .then((card) => { res.send({ data: card }); })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Такой карточки не существует');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный Id');
      } else { next(err); }
    })
    .catch(next);
};
