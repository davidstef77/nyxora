import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: String },
    image: { type: String },
    description: { type: String },
    category: { type: String },
    affiliateLinks: [
      {
        storeName: { type: String },
        url: { type: String },
        price: { type: String }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
