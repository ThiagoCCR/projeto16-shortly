import express from "express";
import {
  SignUpUser,
  SignInUser,
  GetUserInfo,
  GetUsersRanking,
} from "../controllers/usersControllers.js";
import {
  validateSignUpSchema,
  validateSignInSchema,
} from "../middlewares/joiMiddlewares.js";
import { checkIfEmailIsvalid } from "../middlewares/usersMiddlewares.js";
import { isAuth } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/sign-up", validateSignUpSchema, checkIfEmailIsvalid, SignUpUser);
router.post("/sign-in", validateSignInSchema, SignInUser);
router.get("/users/me", isAuth, GetUserInfo);
router.get("/ranking", GetUsersRanking);

export default router;
