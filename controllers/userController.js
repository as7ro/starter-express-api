import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import nodemailer from 'nodemailer';
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";






const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ user: user._id });
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
    console.log("username",username)
    console.log("password",password)

    const user = await User.findOne({ username });

    if (!user) {
      req.session.data = { message: "" };
      return res.redirect('/login');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (isPasswordValid) {
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
  res.render('forgot-password', { 
    link: "login",
    error: null, success: null });
};

const getConfirmPassword = (req, res) => {
  const token = req.params.token.toString();
  res.render('changePassword', { 
    link: "login",
    data: { token } });
};
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("FPPS", email)
    if (!user) {
      return res.render('forgot-password', {
        link: "login",
        
        error: req.cookies.language=="az"?'Belə bir istifadəçi yoxdur!':"Benutzer nicht erkannt",
      });
    }

    const resetToken = generateResetToken();
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 900000
    await user.save();
    
    const siteDomain = "http://damvev.de";
    const language = req.cookies.language || "az";
    const resetLink = `${siteDomain}/users/changePassword/${resetToken}?lang=${language}`;
    const emailContent = `${resetLink}`;
    await sendResetPasswordEmail(user.email, emailContent);

    res.render('forgot-password', {
      link:"login",
      success: req.cookies.language=="az"?'Şifrə dəyişmə linki e-mail ünvanınıza göndərildi.':"Um dir Passwort zu ändern, wurde ein Link an Ihre e Mail Adresse verschickt!",
    });
  } catch (err) {
    res.render('forgot-password', {
      link: "login",
      error: 'An error occurred while processing your request. Please try again later.',
    });
  }
};

const postConfirmPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Şifrelerin eşleşip eşleşmediğini kontrol edin
    if (newPassword !== confirmPassword) {
      return res.render('changePassword', {
        link: "login",
        error: req.cookies.language == "az" ? 'Şifrələr bir birinə uyğun gəlmir!' : "Passwörter passen nicht übereinander",
        data: { token } // token değerini data içerisinde geçirin
      });
    }

    // Tokeni kullanarak kullanıcıyı bulun
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      // Kullanıcı bulunamazsa hata döndürün
      return res.render('changePassword', {
        link: "login",
        error: req.cookies.language == "az" ? 'Linkin müddəti başa çatıb.' : "Link ist abgelaufen",
        data: { token } // token değerini data içerisinde geçirin
      });
    }

    // Yeni şifreyi hashleyin ve kullanıcının şifresini güncelleyin
    user.password = newPassword;

    // Şifre sıfırlama tokenini ve süresini sıfırlayın
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    // Başarılı mesajını ekrana getirin
    
    res.render('changePassword', {
      link: "login",
      success: req.cookies.language == "az" ? 'Şifrə uğurla dəyişdirildi. Yönləndirilirsiniz...' : "Das Passwort wurde erfolgreich aktualisiert. Weiterleitung erfolgt...",
      data: { token } ,// token değerini data içerisinde geçirin
      redirectAfterSuccess: '/login'
   
    });

    // 2 saniye sonra otomatik yönlendirme yapmak için
 
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu', error });
  }
};

const generateResetToken = () => {
  const token = [...Array(20)].map(() => Math.random().toString(16).substr(2)).join('');
  return token;
};

const sendResetPasswordEmail = async (email, token) => {
  try {
    const mailOptions = {
      from: 'orkhangk@code.edu.az',
      to: email,
      subject: 'Password Reset',
      html: `<p>Şifrəni dəyişmək üçün aşağıdakı linke keçid edin.</p><a href="${token}">${token}</a>`,
    };

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your email provider's SMTP server hostname
      port: 587, // Replace with the SMTP server port (typically 587 or 465)
      secure: false, // Set to true if you're using a secure connection (SSL/TLS)
      auth: {
        user: 'orkhangk@code.edu.az', // Your email address
        pass: 'hjfvvpkrfozynclo', // Your email password
      },
    });

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (err) {
    console.error(err);
  }
};


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
