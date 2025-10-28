import mongoose from 'mongoose';

const ClickSchema = new mongoose.Schema({
  affiliateId: { type: String, index: true },
  productSlug: { type: String, index: true },
  redirectUrl: String,
  referer: String,
  userAgent: String,
  ip: String,
  clickId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Click || mongoose.model('Click', ClickSchema);
