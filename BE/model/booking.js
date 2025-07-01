import mongoose from "mongoose";
import Payment from "./payment.js";
import RatingBooking from "./rating_booking.js";
const { Schema } = mongoose;

const BOOKING_STATUS_PENDING = 1;
const BOOKING_STATUS_CONFIRMED = 2;
const BOOKING_STATUS_CANCELLED = 3;
const BOOKING_STATUS_COMPLETED = 4;
const BOOKING_STATUS_REJECT = 5;
const BOOKING_STATUS_REVERT = 6;
const BOOKING_WAITING_APPROVE_CANCEL = 7;

const schema = new Schema({
    bar_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bar'
    },
    table_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table'
    }],
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Number,
        required: true
    },
    hour: {
        type: Number,
        required: true
    },
    time_play: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discount',
        default: null,
    },
    status: {
        type: Number,
        required: true,
        default: BOOKING_STATUS_PENDING,
    },
    payment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        default: null,
    },
    payment_method: {
        type: Number,
        required: true,
        default: Payment.PAYMENT_METHOD_CASH
    }
},
    { timestamps: true }
);

const model = mongoose.model("Booking", schema);
export const bookingModel = model;

//@Function
const create = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const newDocument = new model({
            bar_id: data.barId,
            table_id: data.tableId,
            user_id: data.userId,
            date: data.date,
            hour: data.hour,
            price: data.price,
            discount_id: data.discount_id,
            payment_method: data.payment_method,
            time_play: data.time_play
        });
        newDocument
          .save()
          .then((createdDocument) => {
            resolve(createdDocument);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const findOne = (filter, populateFields = [], sortBy = {}) => {
    return new Promise((resolve, reject) => {
      try {
        let query = model.findOne({ ...filter }).sort(sortBy);
  
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
  
        query
          .then((document) => {
            resolve(document);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const find = (filter, populateFields = [], sortBy = {}) => {
    return new Promise((resolve, reject) => {
      try {
        let query = model.find({ ...filter }).sort(sortBy);
    
        populateFields.forEach((field) => {
          query = query.populate(field);
        });
    
        query
          .then((documents) => {
            resolve(documents);
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const deleteOne = (filter) => {
    return new Promise((resolve, reject) => {
      try {
        model
          .deleteOne(filter)
          .then((result) => {
            if (!result.deletedCount) {
              resolve(false);
            } else {
              resolve(true);
            }
          })
          .catch((error) => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateStatusBooking = async (idBooking, status) => {
      const booking = await Booking.findOne({_id: idBooking});
      if (!booking) {
          return false;
      }
      booking.status = status;
      return booking.save();
  };

  const updatePaymentId = async (idBooking, idPayment) => {
      const booking = await Booking.findOne({_id: idBooking});
      if (!booking) {
          return false;
      }
      booking.payment_id = idPayment;
      return booking.save();
  }

/**
 * Thêm thông tin rating vào từng booking
 * @param {Array} bookings - Danh sách booking
 * @returns {Promise<Array>} Danh sách booking kèm rating
 */
const addRatingsToBookings = async (bookings) => {
  return Promise.all(
      bookings.map(async (booking) => {
          const ratingBooking = await RatingBooking.findOne({ booking_id: booking._id });
          return {
              ...booking.toObject(),
              rating_booking: ratingBooking || null,
          };
      })
  );
};

const findBookingsByRangeTime = async (barId, tableId, startDate, endDate) => {
  const bookingsInDate = await model.find({
    bar_id: barId,
    date: { $gte: startDate, $lte: endDate },
  });
  console.log(bookingsInDate);
  
  const matchingBookings = [];

  for (const booking of bookingsInDate) {
    if (booking.table_id && booking.table_id.includes(tableId)) {
      matchingBookings.push(booking);
    }
  }

  return matchingBookings;
};
  
  const Booking = {
    BOOKING_STATUS_PENDING,
    BOOKING_STATUS_CONFIRMED,
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_COMPLETED,
    BOOKING_STATUS_REJECT,
    BOOKING_STATUS_REVERT,
    BOOKING_WAITING_APPROVE_CANCEL,
    create,
    findOne,
    find,
    deleteOne,
    updateStatusBooking,
    updatePaymentId,
    addRatingsToBookings,
    findBookingsByRangeTime,
  };
  export default Booking;