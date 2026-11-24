const mongoose = require('mongoose');
const Trip = require('../models/travlr'); // Register model
const Model = mongoose.model('trips');
const { ApiError, asyncHandler } = require('../utils/errors');

// Pick only the fields a client is allowed to set
const tripFields = (body) => ({
    code: body.code,
    name: body.name,
    length: body.length,
    start: body.start,
    resort: body.resort,
    perPerson: body.perPerson,
    image: body.image,
    description: body.description
});

// GET: /trips - lists all the trips
// An empty collection is a valid result, so it returns 200 with [].
// Database failures are thrown and handled by the central API error handler.
const tripsList = asyncHandler(async (req, res) => {
    const trips = await Model.find({}).exec();

    return res
        .status(200)
        .json(trips);
});

// GET: /trips/:tripCode - lists a single trip
// findOne() returns a document or null (find() always returns an array,
// even when nothing matches, so `!q` was never true).
const tripsFindByCode = asyncHandler(async (req, res) => {
    const trip = await Model
        .findOne({ code: req.params.tripCode })
        .exec();

    if (!trip) {
        throw ApiError.notFound(
            `Trip '${req.params.tripCode}' not found`,
            { code: 'TRIP_NOT_FOUND' }
        );
    }

    return res
        .status(200)
        .json(trip);
});

// POST: /trips - adds a new Trip
// Validation errors -> 400 VALIDATION_ERROR, duplicate code -> 409 DUPLICATE_KEY
// (both translated by the central error handler)
const tripsAdd = asyncHandler(async (req, res) => {
    const newTrip = new Model(tripFields(req.body));
    const saved = await newTrip.save();

    return res
        .status(201)
        .json(saved);
});


// PUT: /trips/:tripCode - updates an existing trip
const tripsUpdateTrip = asyncHandler(async (req, res) => {
    const updated = await Model
        .findOneAndUpdate(
            { code: req.params.tripCode },
            tripFields(req.body),
            {
                new: true,           // return the updated document
                runValidators: true  // update queries skip schema validation by default
            }
        )
        .exec();

    if (!updated) {
        throw ApiError.notFound(
            `Trip '${req.params.tripCode}' not found`,
            { code: 'TRIP_NOT_FOUND' }
        );
    }

    return res
        .status(200)
        .json(updated);
});

module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAdd,
    tripsUpdateTrip
};