const jwt = require('jsonwebtoken');
const AuthError = require('./errors').AuthError;

const ISSUER = 'datacase.org';
const SECRET = 'qwertyuiopasdfghjklzxcvbnm123456'; // http://jwtbuilder.jamiekurtz.com/

module.exports = (req, resp, next) => {
	if (req.headers.authorization) {
		const auth = req.headers.authorization.split(' ');
		if (auth[0] === 'Bearer') try {
         req.auth = jwt.verify(auth[1], SECRET);
         if (!req.auth) throw new AuthError('authorization token not valid');
         if (req.auth.iss !== ISSUER) throw new AuthError('authorization token not valid');
         if (!req.auth.iat) throw new AuthError('authorization token not valid');
         if (req.auth.iat * 1000 > Date.now()) throw new AuthError('authorization token not valid');
         if (!req.auth.exp) throw new AuthError('authorization token not valid');
         if (req.auth.exp * 1000 < Date.now()) throw new AuthError('authorization token expired');
		} catch (JsonWebTokenError) {
         throw new AuthError('authorization token not valid');
      }
	}

	next();
}
