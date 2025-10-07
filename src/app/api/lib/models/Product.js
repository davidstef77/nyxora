import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const AffiliateLinkSchema = new Schema({
  storeName: { type: String, trim: true },
  url: { type: String, trim: true },
  price: { type: String, trim: true }
}, { _id: false });

const ProductSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  // legacy free-form price string for backwards compatibility
  // product-level prices removed; pricing is now stored on Manufacturer documents
  // primary image (legacy) - keep for compatibility with existing UI
  image: { type: String, trim: true },
  // allow multiple images for richer product pages
  images: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  // category as slug (legacy) to avoid breaking code; also store optional ref
  category: { type: String, trim: true, index: true },
  categoryRef: { type: Schema.Types.ObjectId, ref: 'Category' },
  // optional manufacturer reference
  manufacturerRef: { type: Schema.Types.ObjectId, ref: 'Manufacturer' },
  affiliateLinks: [AffiliateLinkSchema],
  metadata: { type: Schema.Types.Mixed },
  // structured benchmarks for product: allow admin to attach images or text benchmarks
  benchmarks: [{
    title: { type: String, trim: true },
    text: { type: String, trim: true },
    content: { type: String, trim: true },
    image: { type: String, trim: true },
    imageUrl: { type: String, trim: true }
  }]
}, { timestamps: true });

// ensure slug exists and is normalized
ProductSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  // if images array provided but image field empty, set image from first images
  if ((!this.image || this.image === '') && Array.isArray(this.images) && this.images.length > 0) {
    this.image = this.images[0];
  }
  next();
});

// toJSON transform: cleanup mongo internals and include canonical id
ProductSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
