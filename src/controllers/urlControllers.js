import connection from "../db/db.js";
import { nanoid } from "nanoid";

async function ShortenUrl(req, res) {
  const { url } = req.body;
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");
  const charsNumber = 10;
  const shortUrl = nanoid(charsNumber);
  if (!url) {
    res.status(422).send("Você deve eniviar uma URL");
  }
  if (!token) return res.status(401).send("Autorização enviada incorreta");
  if (validateURL(url) === false) {
    return res.status(422).send("Envie uma URL válida!");
  }
  try {
    const session = await connection.query(
      "SELECT * FROM sessions WHERE token LIKE $1",
      [token]
    );
    if (session.rows[0].length === 0) {
      return res.sendStatus(409);
    }

    await connection.query(
      'INSERT INTO urls ("userId", "shortURL", "URL", "visitCount") VALUES ($1,$2,$3,$4)',
      [session.rows[0].userId, shortUrl, url, 0]
    );
    res.status(201).send({ shortUrl });
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

async function GetUrlById(req, res) {
  const id = req.params.id;
  if (!id) return res.sendStatus(409);
  try {
    const url = await connection.query("SELECT * FROM urls WHERE id=$1", [id]);
    if (url.rows.length === 0) {
      res.sendStatus(404);
    }
    const validUrl = url.rows[0];
    console.log(validUrl);
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
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).send("Autorização enviada incorretamente");
  try {
    const session = await connection.query(
      "SELECT * FROM sessions WHERE token LIKE $1",
      [token]
    );
    const validSession = session.rows[0];
    if (validSession.token !== token) {
      return res.sendStatus(409);
    }
    const url = await connection.query("SELECT * FROM urls WHERE id=$1", [id]);
    const validUrl = url.rows[0];
    if (!validUrl) return res.send(404);
    if (validUrl.userId !== validSession.userId) return res.sendStatus(401);
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
    console.log(validUrl)
    await connection.query(
      `UPDATE urls SET "visitCount"=${validUrl.visitCount} WHERE "shortURL"=$1;`,
      [shortURL]
    );
    res.redirect(validUrl.URL)
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

export { ShortenUrl, GetUrlById, DeleteUrlById, AcessUrl };

function validateURL(textval) {
  let urlregex =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|html|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}
