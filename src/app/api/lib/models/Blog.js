import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema } = mongoose;

const BlogSchema = new Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  excerpt: { type: String, trim: true },
  content: { type: String, trim: true },
  image: { type: String, trim: true },
  author: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  featuredProducts: { type: [{ type: String, trim: true }], default: [] },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

BlogSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = slugify(this.title, { lower: true, strict: true });
  next();
});

BlogSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
