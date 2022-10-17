import connection from "../db/db.js";
import { nanoid } from "nanoid";

async function ShortenUrl(req, res) {
  const user = res.locals.user;
  const charsNumber = 10;
  const shortUrl = nanoid(charsNumber);
  const url = res.locals.url;

  try {
    await connection.query(
      'INSERT INTO urls ("userId", "shortURL", "URL", "visitCount") VALUES ($1,$2,$3,$4)',
      [user.rows[0].id, shortUrl, url, 0]
    );
    res.status(201).send({ shortUrl });
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

async function GetUrlById(req, res) {
  const validUrl = res.locals.validUrl;
  try {
    res.status(200).send({
      id: validUrl.id,
      shortUrl: validUrl.shortURL,
      url: validUrl.URL,
    });
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

async function DeleteUrlById(req, res) {
  const id = req.params.id;
  const user = res.locals.user;
  const validUrl = res.locals.validUrl;
  if (user.rows[0].id !== validUrl.userId) return res.sendStatus(401)
  try {
    await connection.query("DELETE FROM urls WHERE id=$1", [id]);
    res.sendStatus(204);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

async function AcessUrl(req, res) {
  const shortURL = req.params.shortUrl;
  if (!shortURL) return res.status(409).send("Informe uma shortUrl...");
  try {
    const url = await connection.query(
      'SELECT * FROM urls WHERE urls."shortURL" LIKE $1',
      [shortURL]
    );
    if (url.rows.length === 0) {
      return res.status(404).send("URL não encontrada");
    }
    const validUrl = url.rows[0];
    validUrl.visitCount += 1;
    await connection.query(
      `UPDATE urls SET "visitCount"=${validUrl.visitCount} WHERE "shortURL"=$1;`,
      [shortURL]
    );
    res.redirect(validUrl.URL);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

export { ShortenUrl, GetUrlById, DeleteUrlById, AcessUrl };
