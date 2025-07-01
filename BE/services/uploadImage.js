import { bucket } from "../config/firebase.js";

export const uploadImageToFirebase = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.originalname}`;

    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      contentType: file.mimetype,
      public: true,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
    return publicUrl;
  } catch (error) {
    throw new Error("Error uploading file to Firebase: " + error.message);
  }
};
