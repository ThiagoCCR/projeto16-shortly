import connection from "../db/db.js"


async function validateShortenUrl(req, res, next) {
  const { url } = req.body;
  if (!url) {
    return res.status(422).send("Você deve enviar uma URL");
  }
  if (validateURL(url) === false) {
    return res.status(422).send("Envie uma URL válida!");
  }
  res.locals.url = url;
  next();
}

async function validateUrlId(req, res, next) {
  const id = req.params.id;
  if (!id) return res.sendStatus(409);
  try {
    const url = await connection.query("SELECT * FROM urls WHERE id=$1", [id]);
    if (url.rows.length === 0) {
      return res.sendStatus(404);
    }
    const validUrl = url.rows[0];
    res.locals.validUrl = validUrl;
    next();
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

export { validateShortenUrl, validateUrlId };

function validateURL(textval) {
  let urlregex =
    /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|html|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}
