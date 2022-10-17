import express from "express";
import {
  ShortenUrl,
  GetUrlById,
  DeleteUrlById,
  AcessUrl,
} from "../controllers/urlControllers.js";
import { isAuth } from "../middlewares/authMiddlewares.js";
import {
  validateShortenUrl,
  validateUrlId,
} from "../middlewares/urlsMiddlewares.js";

const router = express.Router();

router.post("/urls/shorten", isAuth, validateShortenUrl, ShortenUrl);
router.get("/urls/:id", validateUrlId, GetUrlById);
router.delete("/urls/:id", isAuth, validateUrlId, DeleteUrlById);
router.get("/urls/open/:shortUrl", AcessUrl);

export default router;
