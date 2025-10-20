import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const TopItemSchema = new Schema({
  productSlug: { type: String, required: true, trim: true },
  position: { type: Number, required: true, min: 1 },
  customNote: { type: String, trim: true } // optional custom note per product in top
}, { _id: false });

const TopSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, trim: true },
  items: [TopItemSchema],
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

TopSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

TopSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Top || mongoose.model('Top', TopSchema);
