const express = require('express'); // Express app
const router = express.Router();    // Router logic


// This is where we import the controllers we will route
const tripsController = require('../controllers/trips');
const authController = require('../controllers/authentication');
const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
    // console.log('In Middleware');
    const authHeader = req.headers['authorization'];

    // console.log('Auth Header: ' + authHeader);
    if (authHeader == null) {
        console.log('Auth Header Required but NOT PRESENT!');
        return res.sendStatus(401);
    }

    let headers = authHeader.split(' ');

    if (headers.length !== 2 || headers[0] !== 'Bearer') {
        console.log('Invalid Authorization Header');
        return res.sendStatus(401);
    }

    const token = headers[1];

    if (token == null) {
        console.log('Null Bearer Token');
        return res.sendStatus(401);
    }

    // Verify the JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return res.status(401).json('Token Validation Error!');
        }

        req.auth = verified; // Set the auth parameter to the decoded object
        next(); // Continue only after successful verification
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