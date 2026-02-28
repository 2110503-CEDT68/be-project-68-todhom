const express = require("express");
const {
  getRentals,
  getRental,
  addRental,
  updateRental,
  deleteRental,
} = require("../controllers/rentals");

const router = express.Router({ mergeParams: true });

const { protect , authorize} = require("../middleware/auth");

router.route("/").get(protect, getRentals).post(protect , authorize('admin','user'), addRental);
router
  .route("/:id")
  .get(protect, getRental)
  .put(protect , authorize('admin','user'),updateRental)
  .delete(protect , authorize('admin','user'),deleteRental);

module.exports = router;
