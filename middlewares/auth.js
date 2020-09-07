const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }
  const token = authorization;
  let payload;
  try {
    payload = jwt.verify(token, 'a2ee16c5379c1de2f488b7dfff5544c20f8c0606893e7370f5d766d5e37659c9');
  } catch (err) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }
  req.user = payload;
  return next();
};
