const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the address
 *         userId:
 *           type: string
 *           description: The ID of the user who owns this address
 *         addressType:
 *           type: string
 *           enum: [home, office, business, other]
 *           description: Type of address
 *         addressLine1:
 *           type: string
 *           description: First line of address (building, street)
 *         addressLine2:
 *           type: string
 *           description: Second line of address (apartment, suite, etc.)
 *         landmark:
 *           type: string
 *           description: A nearby landmark for easier identification
 *         city:
 *           type: string
 *           description: City/Town name
 *         district:
 *           type: string
 *           description: District/County name
 *         state:
 *           type: string
 *           description: State/Province name
 *         pincode:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country name
 *         isDefault:
 *           type: boolean
 *           description: Whether this is the default address for the user
 *         latitude:
 *           type: number
 *           description: Geographic latitude coordinate
 *         longitude:
 *           type: number
 *           description: Geographic longitude coordinate
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the address was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the address was last updated
 *       example:
 *         _id: 60d21b4667d0d8992e610c85
 *         userId: 60d21b1c67d0d8992e610c84
 *         addressType: home
 *         addressLine1: 123 Main Street
 *         addressLine2: Apartment 4B
 *         landmark: Near City Park
 *         city: Ahmedabad
 *         district: Ahmedabad
 *         state: Gujarat
 *         pincode: '380015'
 *         country: India
 *         isDefault: true
 *         latitude: 23.0225
 *         longitude: 72.5714
 *         createdAt: '2021-06-22T12:43:34.913Z'
 *         updatedAt: '2021-06-22T12:43:34.913Z'
 */
const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    addressType: {
      type: String,
      enum: ['home', 'office', 'business', 'other'],
      default: 'home'
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    landmark: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    district: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    country: {
      type: String,
      default: 'India',
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient queries
addressSchema.index({ userId: 1, isDefault: -1 });
addressSchema.index({ pincode: 1, city: 1, state: 1 });

// Pre-save hook to ensure only one default address per user
addressSchema.pre('save', async function (next) {
  const address = this;
  
  // If this address is being set as default, unset any other default addresses for this user
  if (address.isDefault) {
    try {
      await address.constructor.updateMany(
        { userId: address.userId, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );
    } catch (error) {
      next(error);
    }
  }
  
  next();
});

// Set virtual property for full address string
addressSchema.virtual('fullAddress').get(function () {
  const parts = [
    this.addressLine1,
    this.addressLine2,
    this.landmark ? `Landmark: ${this.landmark}` : '',
    this.city,
    this.district ? this.district : '',
    this.state,
    this.pincode,
    this.country
  ].filter(Boolean); // Remove empty parts
  
  return parts.join(', ');
});

// Ensure virtual fields are shown when converting to JSON
addressSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;