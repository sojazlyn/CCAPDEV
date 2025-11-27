// src/models/reservationModel.js

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // Passenger Details
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    trim: true,
    lowercase: true
  },
  passportNumber: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Flight Reference
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: true
  },
  
  selectedSeat: { 
    type: String, 
    required: true,
    uppercase: true,
    trim: true
  },
  mealOption: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  extraBaggage: { 
    type: Number, 
    required: true, 
    default: 2,
    min: 2,
    max: 20
  },
  totalPrice: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  reservedDate: { 
    type: String, 
    required: true 
  },
  
  // Status Field
  status: {
    type: String,
    enum: ['Booked', 'Cancelled', 'Checked-In'],
    default: 'Booked'
  },
  
  // Prevents double booking
  bookingReference: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

reservationSchema.index({ 
  flight: 1, 
  selectedSeat: 1, 
  reservedDate: 1, 
  status: 1 
}, { 
  unique: true, 
  partialFilterExpression: { status: 'Booked' } 
});

reservationSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    this.bookingReference = 'BR' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
