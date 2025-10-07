import mongoose from 'mongoose';

const { Schema } = mongoose;

const FavoriteSchema = new Schema({
  userId: { type: String, required: true, index: true },
  slugs: [{ type: String, trim: true }],
}, { timestamps: true });

FavoriteSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Favorite || mongoose.model('Favorite', FavoriteSchema);
