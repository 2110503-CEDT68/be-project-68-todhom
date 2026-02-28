const Rental = require("../models/Rental");
const Provider = require("../models/Provider");

//@desc Get all appointments
//@route GET /api/v1/appointments
//@access Private
exports.getAppointments = async (req, res, next) => {
  let query;
  //General users can see only their appointments!
  if (req.user.role !== "admin") {
    query = Rental.find({ user: req.user.id }).populate({
      path: "hospital",
      select: "name province tel",
    });
  } else {
    if (req.params.hospitalId) {
      console.log(req.params.hospitalId);

      query = Rental.find({ hospital: req.params.hospitalId }).populate({
        path: "hospital",
        select: "name province tel",
      });
    } else
      query = Rental.find().populate({
        path: "hospital",
        select: "name province tel",
      });
  }
  try {
    const appointments = await query;
    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    console.log(err.stack);
    return (
      res.status(500),
      json({
        success: false,
        message: "Cannot find Appointment",
      })
    );
  }
};

//@desc Get single appointment
//@route GET /api/v1/appointments/:id
//@access PUBLIC
exports.getRental = async (req, res, next) => {
  try {
    const appointment = await Rental.findById(req.params.id).populate({
      path: "hospital",
      select: "name description tel",
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: `No appointment with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Appointment" });
  }
};

//@desc Add appointment
//@route POST /api/v1/hospitals/:hospitalid/appointments/
//@access Private
exports.addRental = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId;

    const hospital = await Provider.findById(req.params.hospitalId);
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: `No hospital with the id of ${req.params.hospitalId}`,
      });
    }
    console.log(req.body);
    //add user Id to req.body
    req.body.user = req.user.id;
    //Check for existed appointment
    const existedAppointments = await Rental.find({ user: req.user.id });
    //If the user is not an admin , they can only create 3 appointment.
    if (existedAppointments.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments`,
      });
    }
    const appointment = await Rental.create(req.body);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create appointment" });
  }
};

//@desc Update appointment
//@route PUT /api/v1/appointments/:id
//@access Private
exports.updateRental = async (req, res, next) => {
  try {
    let appointment = await Rental.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: `No appt with id ${req.params.id}` });
    }
    //Make sure user is the appointment owner
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`,
      });
    }
    appointment = await Rental.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Appointment" });
  }
};

//@desc Delete appointment
//@route Delete /api/v1/appointments/:id
//@access Private
exports.deleteRental = async (req, res, next) => {
  try {
    const appointment = await Rental.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: `No appt with id ${req.params.id}` });
    }
    if (
      appointment.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`,
      });
    }
    await appointment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error.stack);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Appointment" });
  }
};
