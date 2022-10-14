import express from "express";
import {ShortenUrl, GetUrlById} from "../controllers/urlControllers.js";

const router = express.Router();

router.post("/urls/shorten", ShortenUrl)
router.get("/urls/:id", GetUrlById)


export default router;
