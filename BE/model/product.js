import mongoose from "mongoose";
const { Schema } = mongoose;

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    prevention: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Product", schema);
export const ProductModel = model;

//@Function
const create = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const newDocument = new model({
        name: data.name,
        origin: data.origin,
        price: data.price,
        prevention: data.prevention,
        image: data.image,
        category: data.category,
        link: data.link,
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

const addTableIdForBar = async (barId, tablesList) => {
  try {
    const tablesInfo = await Promise.all(tablesList);
    const bar = await BarModel.findOne({ _id: barId });
    bar.tables = tablesInfo;
    await bar.save();
    return tablesInfo;
  } catch (error) {
    throw error;
  }
};

const updateTotalTable = async (barId, totalTable) => {
  try {
    const bar = await BarModel.findOne({ _id: barId });
    bar.amount_table = totalTable;
    await bar.save();
  } catch (error) {
    throw error;
  }
};

const updateType = async (barId, amountTableTypeHole, amountTableTypeCarom) => {
  try {
    const bar = await BarModel.findOne({ _id: barId });
    if (amountTableTypeHole >= amountTableTypeCarom) {
      bar.type = Bars.TYPE_HOLE;
    } else {
      bar.type = Bars.TYPE_CAROM;
    }
    await bar.save();
  } catch (error) {
    throw error;
  }
};

const Products = {
  create,
  findOne,
  find,
  deleteOne,
  addTableIdForBar,
  updateTotalTable,
  updateType,
};
export default Products;
