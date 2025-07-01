import mongoose from "mongoose";
const { Schema } = mongoose;

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Category", schema);
export const CategoryModel = model;

//@Function
const create = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const newDocument = new model({
        name: data.name,
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
    try {
      model
        .findOne({ ...filter })
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

const find = (filter) => {
  return new Promise((resolve, reject) => {
    try {
      model
        .find({ ...filter })
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

const findByIdAndDelete = (id) => {
  return new Promise((resolve, reject) => {
    try {
      model
        .findByIdAndDelete(id)
        .then((result) => {
          if (!result) {
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
}

const Categorys = {
  create,
  findOne,
  find,
  deleteOne,
  findByIdAndDelete,
};
export default Categorys;
