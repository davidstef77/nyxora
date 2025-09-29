import mongoose from 'mongoose';

const ManufacturerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    // category slug that this manufacturer primarily supplies
    category: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Manufacturer || mongoose.model('Manufacturer', ManufacturerSchema);
