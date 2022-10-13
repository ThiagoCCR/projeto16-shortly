import express from "express";
import {
  SignUpUser,
  SignInUser,
  teste,
} from "../controllers/authControllers.js";

const router = express.Router();

router.post("/sign-up", SignUpUser);
router.post("/sign-in", SignInUser);

router.get("/users", teste);

export default router;
