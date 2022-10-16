import express from "express";
import { SignUpUser, SignInUser, GetUserInfo } from "../controllers/usersControllers.js";

const router = express.Router();

router.post("/sign-up", SignUpUser);
router.post("/sign-in", SignInUser);
router.get("/users/me", GetUserInfo);


export default router;
