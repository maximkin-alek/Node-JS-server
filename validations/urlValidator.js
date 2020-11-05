const validator = require('validator');
const BadRequestError = require('../errors/badRequestError');

const urlValidator = (link) => {
  if (!validator.isURL(link)) {
    throw new BadRequestError('Ссылка не валидна');
  } else {
    return link;
  }
};

module.exports = { urlValidator };
