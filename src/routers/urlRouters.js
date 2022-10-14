import express from "express";
import {
  ShortenUrl,
  GetUrlById,
  DeleteUrlById,
  AcessUrl
} from "../controllers/urlControllers.js";

const router = express.Router();

router.post("/urls/shorten", ShortenUrl);
router.get("/urls/:id", GetUrlById);
router.delete("/urls/:id", DeleteUrlById);
router.get("/urls/open/:shortUrl", AcessUrl);



export default router;
