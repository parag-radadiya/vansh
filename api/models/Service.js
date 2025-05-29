const mongoose = require('mongoose');

/**
 * ServiceFAQ Schema
 */
const ServiceFAQSchema = new mongoose.Schema({
  quw: { type: String },
  ans: { type: String },
}, { _id: false });

/**
 * SubService Schema
 */
const subserviceSchema = new mongoose.Schema({
  title: String,
  des: String,
  img: String,
  overview: String,
  documentsRequired: String,
  eligibility: String,
  interestRates: String,
  servicefaq: [
    {
      que: String,
      ans: String
    }
  ]
},{ _id: true });

/**
 * Service Schema
 */
const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  icon: {
    url: String,
    publicId: String
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  services: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  subservices: [subserviceSchema]
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
