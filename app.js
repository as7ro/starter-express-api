import express from "express";
import dotenv from "dotenv";
import conn from "./db.js";
import cookieParser from "cookie-parser";
import setRoutes from "./routes/mainRoute.js";
import fileUpload from "express-fileupload";
import {v2 as cloudinary } from "cloudinary";

import session from 'express-session';
dotenv.config();
//connection to the db



conn();

const app = express();

const port = process.env.PORT
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  })
);
//ejs template engine
app.set("view engine","ejs");

//static files middleware
app.use(express.static('public'));  
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(fileUpload({useTempFiles:true}))

//routes
setRoutes(app)



app.listen(port,()=>{
    console.log(`damv port : ${port}`);

});



