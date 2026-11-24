
const User = require('../models/user');
const passport = require('passport');
const { ApiError, asyncHandler } = require('../utils/errors');

// POST /api/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  // Validate required fields
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password
  ) {
    throw new ApiError(400, 'All fields required', {
      code: 'VALIDATION_ERROR'
    });
  }

  // Create user using the existing schema
  const user = new User({
    name: name.trim(),
    email: email.trim(),
    password: ''
  });

  // Hash password using the existing user model
  user.setPassword(password);

  // Database errors are forwarded to the API error handler
  await user.save();

  // Generate a token after successful registration
  const token = user.generateJWT();

  return res.status(201).json({ token });
});

// POST /api/login
const login = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return next(
      new ApiError(400, 'Email and password required', {
        code: 'VALIDATION_ERROR'
      })
    );
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next(
        new ApiError(401, 'Invalid email or password', {
          code: 'UNAUTHORIZED'
        })
      );
    }

    try {
      const token = user.generateJWT();
      return res.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

module.exports = {
  register,
  login
};
