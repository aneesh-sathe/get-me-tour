const booleanPropNaming = require('eslint-plugin-react/lib/rules/boolean-prop-naming');
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour must have a Name'],
      unique: true,
    },

    price: {
      type: Number,
      required: [true, 'Tour must have a Price'],
    },

    rating: {
      type: Number,
      default: 0.0,
      min: [0, 'Rating must be above 0.0'],
      max: [5, 'Rating should be below 5.0'],
    },

    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('priceINR').get(function () {
  return this.price * 80;
});
// DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  console.log(this);
  next();
});
// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
// AGGREGATE MIDDLEWARE

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
