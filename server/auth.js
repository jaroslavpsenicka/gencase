const jwt = require('jsonwebtoken');
const AuthError = require('./errors').AuthError;
const log4js = require('log4js');

const logger = log4js.getLogger('auth')

const ISSUER = 'datacase.org';
const SECRET = 'qwertyuiopasdfghjklzxcvbnm123456'; // http://jwtbuilder.jamiekurtz.com/

const auth = (req, resp, next) => {
  if (req.headers.authorization) {
    logger.debug('authorization', req.headers.authorization);
		const auth = req.headers.authorization.split(' ');
		if (auth[0] === 'Bearer') try {
      req.auth = jwt.verify(auth[1], SECRET);
      logger.debug('token', JSON.stringify(req.auth, null, 0));
      if (!req.auth) throw new AuthError('authorization token not valid');
      if (req.auth.iss !== ISSUER) throw new AuthError('authorization token not valid');
		} catch (err) {
      logger.error(err.message, auth.length > 0 ? auth[1] : req.headers.authorization);
      throw new AuthError(err.message);
    }
	}

	next();
}

const aud = (req) => {
  return req.auth ? req.auth.aud : undefined;
}

const sub = (req) => {
  return req.auth ? req.auth.sub : undefined;
}

module.exports = { auth, aud, sub }
