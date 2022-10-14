import express from "express";
import { SignUpUser, SignInUser } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/sign-up", SignUpUser);
router.post("/sign-in", SignInUser);

export default router;
