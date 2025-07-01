import mongoose from "mongoose";
const { Schema } = mongoose;


const schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới bảng User
        required: true
    },
    name: {
        type: String,
        required: false
    },
    role: {
        type: String,
        required: false,
        enum: ['user', 'admin', 'owner'],
        default: 'user'
    },
    email: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
}, { timestamps: true });

const model = mongoose.model("Profile", schema);
export const profileModel = model;

//@Function
const create = (data) => {
    return new Promise((resolve, reject) => {
      try {
        const newDocument = new model({
          userId: data.userId,
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
const update = (filter, updateData) => {
    return new Promise((resolve, reject) => {
      try {
        model.findOneAndUpdate(filter, updateData, { new: true })
          .then((updatedDocument) => {
            resolve(updatedDocument);
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

const updateUserInfo = async (data) => {
  const profile = await Profiles.findOne({ userId: data.userId });
  if (!profile) {
    return false;
  }

  if (data.email) {
    profile.email = data.email;
  }

  if (data.name) {
    profile.name = data.name;
  }

  if (data.phone) {
    profile.phone = data.phone;
  }

  if (data.address) {
    profile.address = data.address;
  }

  if (data.imageUrl) {
    profile.imageUrl = data.imageUrl;
  }

  await profile.save();
  return profile;
}
  
const Profiles = {
  update, 
  create, 
  findOne,
  updateUserInfo,
};
export default Profiles;
