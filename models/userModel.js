import mongoose from "mongoose";
import argon2 from "argon2";
import validator from "validator";


const { Schema } = mongoose;

const userSchema = new Schema({
  user_name: {
    type: String,
    default:""
  },
  user_surname: {
    type: String,
    default:""
  },
  descriptionAz:{
    type: String,
    default:""
  },
  descriptionGe:{
    type: String,
    default:""
  },
  username: {
    type: String,
    required: [true, "username area is required"],
    lowercase: true,
    validate: [validator.isAlphanumeric, "Only Alphanumeric characters"],
  },
  email: {
    type: String,
    required: [true, "email area is required"],
    unique: true,
    validate: [validator.isEmail, "Valid email is required"]
  },
  password: {
    type: String,
    required: [true, "password area is required"],
    minLength: [8, 'At least 8 character']
  },
  role: {
    type: String,
    enum: ['user', 'admin','kurslu_uzvler','rehber_uzv','reyaset_heyyeti_uzvleri','heqiqi_uzvler', 'elaqedar_uzvler', 'fexri_uzvler', 'komekci_uzvler'], // sadece 'user' veya 'admin' olabilir
    default: 'user' // varsayılan olarak kullanıcı rolü
  },
  url:{
    type:String,
    default:"https://libraries.usc.edu/themes/custom/usc_libraries_theme/dist/assets/profile.png"
  },
  image_id: {
    type: String,
    default:"",
  },
  fb:{
  type:String,
  default:"https://www.facebook.com/"
  },
  inst:{
    type:String,
    default:"https://www.instagram.com/"
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
},
  {
    timestamps: true
  }
);


userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }

  try {
    const hashedPassword = await argon2.hash(user.password);
    user.password = hashedPassword;
    next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (err) {
    throw err;
  }
};



const User = mongoose.model('User', userSchema);

export default User;