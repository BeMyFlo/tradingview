import mongoose from "mongoose";
import Profile from "./profile.js";
const { Schema } = mongoose;


const schema = new Schema({
    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    rating : {
        type: Number,
        required: true
    },
    comment : {
        type: String,
        required: true
    }
}, { timestamps: true });

const model = mongoose.model("RatingBooking", schema);
export const ratingBookingModel = model;

//@Function
const create = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const newDocument = new model({
            booking_id: data.bookingId,
            rating: data.rating,
            comment: data.comment
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

  const findOne = (filter) => {
    return new Promise((resolve, reject) => {
        try{
            model
            .findOne({...filter})
            .then((document) => {
                resolve(document)
            })
            .catch((error) => {
                reject(error);
            });
        }catch(error){
            reject(error);
        }
    })
  }

  const find = (filter, fields = null) => {
    return new Promise((resolve, reject) => {
      try {
        let query = model.find({ ...filter });
        
        if (fields) {
          query = query.select(fields);
        }
  
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

/**
 * Lấy danh sách rating kèm profile user
 * @param {Array} bookings - Danh sách booking
 * @returns {Promise<Array>} Danh sách rating kèm profile user
 */
const getRatingsByBookings = async (bookings) => {
  const results = await Promise.all(
      bookings.map(async (booking) => {
          const ratingBooking = await RatingBooking.findOne({ booking_id: booking._id });
          if (!ratingBooking) return null;
          const profile = await Profile.findOne({ userId: booking.user_id });
          return {
              rating_booking: ratingBooking,
              user_profile: profile || null,
          };
      })
  );

  return results.filter(result => result !== null);
};
  
const RatingBooking = {
    create, 
    findOne, 
    find, 
    deleteOne,
    getRatingsByBookings,
};
export default RatingBooking;