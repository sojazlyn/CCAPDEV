const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservation');
const Flight = require('../models/flight');

// CREATE - Book a new reservation with packages
router.post('/book', async (req, res) => {
  try {
    const { 
      flightId, 
      passengerName, 
      passengerEmail, 
      passengerPassport, 
      mealOption, 
      extraBaggage, 
      selectedSeat, 
      totalCost 
    } = req.body;

    // Parse meal option (format: "Meal Name|Price")
    const mealParts = mealOption.split('|');
    const mealName = mealParts[0];
    const mealPrice = parseInt(mealParts[1]) || 0;

    const newReservation = new Reservation({
      flightId,
      passengerName,
      passengerEmail,
      passengerPassport,
      mealOption: {
        name: mealName,
        price: mealPrice
      },
      baggage: {
        quantity: parseInt(extraBaggage) || 0,
        price: (parseInt(extraBaggage) || 0) * 500
      },
      seat: {
        number: selectedSeat,
        price: 0 // Basic seat selection is free in this example
      },
      totalCost: parseInt(totalCost)
    });

    await newReservation.save();

    // Update available seats
    await Flight.findByIdAndUpdate(flightId, { $inc: { seatsAvailable: -1 } });

    res.redirect('/my-reservations');
  } catch (err) {
    console.error("Error booking flight:", err);
    res.status(500).send('Server Error');
  }
});

// READ - Get reservation details for editing packages
router.get('/edit/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('flightId')
      .lean();
    
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    res.render('edit_reservation', {
      layout: 'main',
      reservation: reservation
    });
  } catch (err) {
    console.error("Error getting reservation:", err);
    res.status(500).send('Server Error');
  }
});

// UPDATE - Modify reservation packages
router.post('/update/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { mealOption, extraBaggage, selectedSeat } = req.body;

    // Get current reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    // Parse meal option
    const mealParts = mealOption.split('|');
    const mealName = mealParts[0];
    const mealPrice = parseInt(mealParts[1]) || 0;

    // Update packages
    reservation.mealOption = {
      name: mealName,
      price: mealPrice
    };
    reservation.baggage = {
      quantity: parseInt(extraBaggage) || 0,
      price: (parseInt(extraBaggage) || 0) * 500
    };
    reservation.seat.number = selectedSeat;

    // Recalculate total cost (base fare + packages)
    const baseFare = 5000; // Your base fare
    reservation.totalCost = baseFare + mealPrice + (reservation.baggage.price);

    await reservation.save();
    res.redirect('/my-reservations');
  } catch (err) {
    console.error("Error updating reservation packages:", err);
    res.status(500).send('Server Error');
  }
});

// UPDATE - Remove specific package (e.g., remove meal)
router.post('/remove-package/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { packageType } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    // Remove specific package
    switch (packageType) {
      case 'meal':
        reservation.mealOption = { name: 'None', price: 0 };
        break;
      case 'baggage':
        reservation.baggage = { quantity: 0, price: 0 };
        break;
      case 'seat':
        // Can't remove seat, but can change it
        break;
    }

    // Recalculate total
    const baseFare = 5000;
    reservation.totalCost = baseFare + reservation.mealOption.price + reservation.baggage.price;

    await reservation.save();
    res.redirect('/my-reservations');
  } catch (err) {
    console.error("Error removing package:", err);
    res.status(500).send('Server Error');
  }
});

// DELETE - Cancel reservation
router.post('/cancel/:id', async (req, res) => {
  try {
    const reservationId = req.params.id;
    
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).send('Reservation not found');
    }

    reservation.bookingStatus = 'Cancelled';
    await reservation.save();
    
    // Return seat to available pool
    await Flight.findByIdAndUpdate(reservation.flightId, { $inc: { seatsAvailable: 1 } });

    res.redirect('/my-reservations');
  } catch (err) {
    console.error("Error cancelling reservation:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
