const { Schema, model } = require('mongoose');

const postAdSchema = new Schema({
  brand: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  photos: { type: [String], default: [] }, // optional array of image URLs/base64
  coverPhotoIndex: { type: Number, default: null },
  location: {
    state: { type: String },
    city: { type: String },
    neighbourhood: { type: String },
  },
  profileImage: { type: String }, // base64 or URL
  name: { type: String },
  mobile: { type: String },
  isMobileValid: { type: Boolean },
}, {
  timestamps: true // adds createdAt and updatedAt
});

const PostAd = model('PostAd', postAdSchema);
module.exports = PostAd;
