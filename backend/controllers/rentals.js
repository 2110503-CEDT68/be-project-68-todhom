const Rental = require("../models/Rental");
const Provider = require("../models/Provider");

//@desc Get all rentals
//@route GET /api/v1/rentals
//@access Private
exports.getRentals = async (req, res, next) => {
  let query;
  //General users can see only their appointments!
  if (req.user.role !== "admin") {
    query = Rental.find({ user: req.user.id })
      .populate({
        path: "provider",
        select: "name address telephone",
      })
      .populate({
        path: "user",
        select: "name email telephone",
      });
  } else {
    if (req.params.providerId) {
      console.log(req.params.providerId);

      query = Rental.find({ provider: req.params.providerId })
        .populate({
          path: "provider",
          select: "name address telephone",
        })
        .populate({
          path: "user",
          select: "name email telephone",
        });
    } else
      query = Rental.find()
        .populate({
          path: "provider",
          select: "name address telephone",
        })
        .populate({
          path: "user",
          select: "name email telephone",
        });
  }
  try {
    const rentals = await query;
    res
      .status(200)
      .json({ success: true, count: rentals.length, data: rentals });
  } catch (err) {
    console.log(err.stack);
    return res.status(500).json({
      success: false,
      message: "Cannot find rental",
    });
  }
};

//@desc Get single appointment
//@route GET /api/v1/appointments/:id
//@access PUBLIC
exports.getRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate({
        path: "provider",
        select: "name address telephone",
      })
      .populate({
        path: "user",
        select: "name email telephone",
      });

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: `No rental with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: rental,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Rental" });
  }
};

//@desc Add appointment
//@route POST /api/v1/hospitals/:hospitalid/appointments/
//@access Private
exports.addRental = async (req, res, next) => {
  try {
    //req.body.provider = req.params.providerId;

    const provider = await Provider.findById(req.body.provider);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: `No provider with the id of ${req.body.provider}`,
      });
    }
    console.log(req.body);
    //add user Id to req.body
    req.body.user = req.user.id;
    //Check for existed appointment
    const existedRentals = await Rental.find({ user: req.user.id });
    //If the user is not an admin , they can only create 3 appointment.
    if (existedRentals.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 rentals`,
      });
    }
    const rental = await Rental.create(req.body);
    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create rental" });
  }
};

//@desc Update appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateRental = async (req, res, next) => {
  try {
    let rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: `No appt with id ${req.params.id}` });
    }
    //Make sure user is the appointment owner
    if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this rental`,
      });
    }
    rental = await Rental.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update rental" });
  }
};

//@desc Delete appointment
//@route Delete /api/v1/appointments/:id
//@access Private
exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res
        .status(404)
        .json({ success: false, message: `No appt with id ${req.params.id}` });
    }
    if (rental.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this rental`,
      });
    }
    await rental.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete rental" });
  }
};
