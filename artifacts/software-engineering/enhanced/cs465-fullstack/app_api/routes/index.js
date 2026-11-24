const express = require('express'); // Express app
const router = express.Router();    // Router logic

const { ApiError } = require('../utils/errors');

// This is where we import the controllers we will route
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

// Method to authenticate our JWT

function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Check whether an authorization header was provided
    if (!authHeader) {
        return next(
            new ApiError(401, 'Authorization header required', {
                code: 'UNAUTHORIZED'
            })
        );
    }

    // Validate the Bearer token format
    const parts = authHeader.split(' ');

    if (parts.length !== 2 ||
        parts[0] !== 'Bearer' ||
        !parts[1]) {
        return next(
            new ApiError(401, 'Invalid authorization header', {
                code: 'UNAUTHORIZED'
            })
        );
    }

    const token = parts[1];

    // Verify the JSON Web Token
    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return next(
                new ApiError(401, 'Invalid or expired token', {
                    code: 'UNAUTHORIZED'
                })
            );
        }

        // Store verified token information
        req.auth = verified;

        // Continue to the protected route
        next();
    });
}




// define route for our trips endpoint
router
    .route('/trips')
    .get(tripsController.tripsList) // GET method routes tripsList
    .post(authenticateJWT, tripsController.tripsAdd); // POST method routes tripsAdd


// GET Method routes tripsFindByCode - requires parameter
// PUT Method routes tripsUpdateTrip - requires parameter
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip);
    
// define route for our authentication endpoint
router
    .route('/register')
    .post(authController.register);

 // define route for login endpoint
router
    .route('/login')
    .post(authController.login);

module.exports = router;