import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { DATE } from "mysql/lib/protocol/constants/types.js";






const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user: user._id });
    console.log(req.body)
  } catch (error) {
    console.log('ERROR', error);

    let errors2 = {};

    if (error.code === 11000) {
      errors2.email = 'The Email is already registered';
    }

    if (error.name === 'ValidationError') {
      Object.keys(error.errors).forEach((key) => {
        errors2[key] = error.errors[key].message;
      });
    }

    res.status(400).json(errors2);
  }
};



const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (req.files && req.files.image) {
      if (user.image_id) {
        await cloudinary.uploader.destroy(user.image_id);
      }

      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        use_filename: true,
        folder: 'damvev_de'
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      user.url = result.secure_url;
      user.image_id = result.public_id;

      fs.unlinkSync(req.files.image.tempFilePath);
    }

    // Diğer alanları güncelleme
    user.name = req.body.name;
    user.surname = req.body.surname;
    user.descriptionAz = req.body.descriptionAz;
    user.descriptionGe = req.body.descriptionGe;
    user.fb = req.body.fb;
    user.inst = req.body.inst;
    await user.save();

    res.status(200).redirect('/users/dashboard');
  } catch (error) {
    res.status(500).json({
      succeeded: false,
      error: error.message
    });
  }
};



const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    let same = false;

    if (user) {

      same = await bcrypt.compare(password, user.password);
    } else {
      req.session.data = { message: "" };
      return res.redirect('/login');

    }


    if (same) {
      const token = createToken(user._id);
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
      });
      switch (user.role) {
        case "admin":
          return res.redirect('/admin');
        case "rehber_uzv":
        case "reyaset_heyyeti_uzvleri":
          return res.redirect('/users/dashboard');
        default:
          return res.redirect('/');
      }

    } else {
      req.session.data = { message: "" };
      return res.redirect('/login');

    }
  } catch (error) {
    res.status(500).json({
      succeded: false,
      error,
    });
  }
};


const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};
const getDashboardPage = (req, res) => {
  res.render('dashboard', {
    link: "dashboard"
  })
}

//NodeMAIlder

const showForgotPasswordForm = (req, res) => {
  res.render('forgot-password', { error: null, success: null });
};

const getConfirmPassword = (req, res) => {
const t =req.params.token.toString();

  res.render('changePassword',{data:{t}})
}

const postConfirmPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  try {
    const user = await User.findOne({ resetPasswordToken: token });

    if (user) {
      if (password === confirmPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        res.redirect('/login');
      } else {
        // Parola doğrulama hatası
        res.status(400).json({ error: 'Parolalar eşleşmiyor.' });
      }
    } else {
      // Kullanıcı bulunamadı
      res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
  } catch (error) {
    // İşleme hatası
    res.status(500).json({ error: 'İşleme hatası.' });
  }
};

const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("FPPS", email)
    if (!user) {
      return res.render('forgot-password', {
        error: 'User not found. Please enter a valid email address.',
      });
    }

    const resetToken = generateResetToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = Date.now() + 3600000;
    
    await user.save();

  
    const siteDomain="http://localhost:3000"
    const resetLink = `${siteDomain}/users/changePassword/${resetToken}`;
    const emailContent = `Parolanızı sıfırlamak için aşağıdaki bağlantıya tıklayın:\n\n${resetLink}`;
    sendResetEmail(user.email, emailContent); // Renamed the function here

    res.render('forgot-password', {
      success: 'Password reset email sent. Please check your email.',
    });
  } catch (err) {
    console.error(err);
    res.render('forgot-password', {
      error: 'An error occurred while processing your request. Please try again later.',
    });
  }
};

function generateResetToken() {
  const token = Math.random().toString(36).substr(2, 6).toUpperCase()+DATE.toLocaleString().toString();
  return token;
}

function sendResetEmail(email, token) { // Renamed the function here
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Replace with your email provider's SMTP server hostname
    port: 587, // Replace with the SMTP server port (typically 587 or 465)
    secure: false, // Set to true if you're using a secure connection (SSL/TLS)
    auth: {
      user: 'orkhangk@code.edu.az', // Your email address
      pass: 'hjfvvpkrfozynclo', // Your email password
    },
  });


  const mailOptions = {
    from: 'orkhangk@code.edu.az',
    to: email,
    subject: 'Password Reset',
    text: `Please use the following token to reset your password: ${token}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Password reset email sent:', info.response);
    }
  });
}


export {
  createUser,
  loginUser,
  getDashboardPage,
  showForgotPasswordForm,
  sendPasswordResetEmail,
  updateUser,
  postConfirmPassword,
  getConfirmPassword
};
