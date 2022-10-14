import express from "express";
import {
  ShortenUrl,
  GetUrlById,
  DeleteUrlById,
} from "../controllers/urlControllers.js";

const router = express.Router();

router.post("/urls/shorten", ShortenUrl);
router.get("/urls/:id", GetUrlById);
router.delete("/urls/:id", DeleteUrlById);


export default router;
