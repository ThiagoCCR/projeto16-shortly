import express from "express";
import {ShortenUrl} from "../controllers/urlControllers.js";

const router = express.Router();

router.post("/urls/shorten", ShortenUrl)

export default router;
