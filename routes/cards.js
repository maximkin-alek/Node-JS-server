const cardsRouter = require('express').Router();
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
// Joi.objectId = require('joi-objectid')(Joi);
const BadRequestError = require('../errors/badRequestError');

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

const urlValidator = (link) => {
  if (!validator.isURL(link)) {
    throw new BadRequestError('Данные не валидны');
  } else {
    return link;
  }
};

cardsRouter.get('/', getCards);

cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(urlValidator),
    // owner: Joi.objectId(),
    // likes: Joi.objectId(),
  }),
}), createCard);

cardsRouter.delete('/:id', deleteCard);
cardsRouter.put('/:id/likes', likeCard);
cardsRouter.delete('/:id/likes', dislikeCard);

module.exports = { cardsRouter, urlValidator };
