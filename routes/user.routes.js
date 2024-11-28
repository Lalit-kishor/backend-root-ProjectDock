import { Router } from "express";
import { createNewUser, validateLogin, logout, refreshAccessToken, frontendTokenValidation } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route('/signup').post(createNewUser);
router.route('/login').post(validateLogin);
router.route('/refresh-token').post(refreshAccessToken);
// secure routes
router.route('/logout').post(verifyJWT, logout);
router.route('/validate-token').get(verifyJWT, frontendTokenValidation);

export default router;