import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const ManufacturerSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, trim: true },
  logo: { type: String, trim: true },
  // optional relation to category
  category: { type: String, trim: true },
  categoryRef: { type: Schema.Types.ObjectId, ref: 'Category' }
  ,
  // prices: allow multiple price entries; each entry can optionally reference a product
  prices: [{
    productRef: { type: Schema.Types.ObjectId, ref: 'Product' },
    productSlug: { type: String, trim: true },
    priceValue: { type: Number },
    priceCurrency: { type: String, default: 'RON', trim: true },
    affiliateUrl: { type: String, trim: true }
  }]
}, { timestamps: true });

ManufacturerSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

ManufacturerSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Manufacturer || mongoose.model('Manufacturer', ManufacturerSchema);
