import mongoose from "mongoose";



const { Schema } = mongoose;

const termsSchema = new Schema({
  termsNameAz: {
    type: String,
    default:"na"
  },
  termsNameGe: {
    type: String,
    default:"na"
  },
  termsDescAz: {
    type: String,
    default:"na"
  },
  termsDescGe: {
    type: String,
    default:"na"
  },
}
);




const Terms = mongoose.model('Terms', termsSchema);

export default Terms;