const cardsRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { urlValidator } = require('../validations/urlValidator');

Joi.objectId = require('joi-objectid')(Joi);

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

cardsRouter.get('/', getCards);

cardsRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(urlValidator),
  }),
}), createCard);

cardsRouter.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), deleteCard);

cardsRouter.put('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), likeCard);

cardsRouter.delete('/:id/likes', celebrate({
  params: Joi.object().keys({
    id: Joi.objectId(),
  }),
}), dislikeCard);

module.exports = { cardsRouter };
