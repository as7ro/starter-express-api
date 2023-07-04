import mongoose from "mongoose";

const { Schema } = mongoose;

const newsSchema = new Schema(
  {
    customId: {
      type: String,
      required: true,
      unique: true,
      default: function () {
        return createSlug(this.titleGe);
      }
    },
    titleAz: {
      type: String,
      required: true,
      trim: true,
    },
    titleGe: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionAz: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionGe: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'CategoryNews',
      required: true,
    },
    images: [
      {
        url: {
          type: String,
        },
        image_id: {
          type: String
        }
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

newsSchema.virtual('formattedDate').get(function () {
  const options = { day: '2-digit', month: 'short', year: '2-digit' };
  return this.createdAt.toLocaleDateString('en-GB', options);
});

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/ /g, '-') // Boşlukları tireyle değiştirir
    .replace(/[^\w-]+/g, ''); // Alfanumerik olmayan karakterleri kaldırır
};

const News = mongoose.model('News', newsSchema);

export default News;