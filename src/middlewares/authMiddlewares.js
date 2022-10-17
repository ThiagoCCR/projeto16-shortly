import connection from "../db/db.js";

async function isAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).send("Autorização enviada incorretamente");
  try {
    const session = await connection.query(
      "SELECT * FROM sessions WHERE token LIKE $1",
      [token]
    );
    if (!session.rows[0]) {
      return res.sendStatus(409);
    }
    const validSession = session.rows[0];
    if (validSession.token !== token) {
      return res.sendStatus(409);
    }
    const user = await connection.query("SELECT * FROM users WHERE id=$1", [
      validSession.userId,
    ]);
    if (!user.rows[0]) return res.sendStatus(404);
    res.locals.user = user;
    next();
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

export { isAuth };
