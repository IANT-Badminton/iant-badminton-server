//  external imports
const jwt = require('jsonwebtoken');

//  internal imports
const User = require('../models/user.model');

const userAuth = async (req, _res, next) => {
  const cookies = Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  //  if no cookies available
  if (!cookies) {
    return next('No cookies, Authorization failed!');
  }

  //  if auth cookie not available
  if (!cookies[process.env.COOKIE_NAME]) {
    return next('Auth cookie unavailable, Authorization failed!');
  }

  try {
    const token = cookies[process.env.COOKIE_NAME];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      $and: [{ _id: decoded.id }, { email: decoded.email }, { phone: decoded.phone }]
    });

    //  if cookie token invalid
    if (!user?.id) {
      return next('Not a valid cookie, authorization failed!');
    }

    //  if everything ok
    req.user = user;
    return next();
  } catch (err) {
    next(err.message);
  }
};

module.exports = userAuth;
