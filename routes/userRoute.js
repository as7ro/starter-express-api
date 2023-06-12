import express from "express";
import * as userController from "../controllers/userController.js"
import * as authMiddleware from "../middlewares/authMiddleware.js"
const router = express.Router();


router.route("/register").post(userController.createUser);
router.route("/login").post(userController.loginUser);
router.route("/dashboard").get(authMiddleware.authenticateToken, userController.getDashboardPage);
router.route('/forgot-password').get(userController.showForgotPasswordForm);
router.route('/forgot-password').post(userController.sendPasswordResetEmail);
router.route('/changePassword/:token').get(userController.getConfirmPassword);
router.route('/changePassword').post(userController.postConfirmPassword);




router.route("/:id").post(userController.updateUser)

export default router