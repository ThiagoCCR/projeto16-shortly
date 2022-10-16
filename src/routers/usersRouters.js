import express from "express";
import { SignUpUser, SignInUser, GetUserInfo, GetUsersRanking } from "../controllers/usersControllers.js";

const router = express.Router();

router.post("/sign-up", SignUpUser);
router.post("/sign-in", SignInUser);
router.get("/users/me", GetUserInfo);
router.get("/ranking", GetUsersRanking);



export default router;
