const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  flightId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  passengerName: {
    type: String,
    required: true
  },
  passengerEmail: {
    type: String,
    required: true
  },
  passengerPassport: {
    type: String,
    required: true
  },
  // Enhanced optional packages
  mealOption: {
    name: {
      type: String,
      default: 'None'
    },
    price: {
      type: Number,
      default: 0
    }
  },
  baggage: {
    quantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    }
  },
  seat: {
    number: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      default: 0
    }
  },
  totalCost: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Cancelled'],
    default: 'Confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
