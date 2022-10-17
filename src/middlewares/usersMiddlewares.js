import connection from "../db/db.js";

async function checkIfEmailIsvalid(req, res, next) {
  const userData = res.locals.userData;
  try {
    const isEmailUsed = await connection.query(
      "SELECT * FROM users WHERE email LIKE $1",
      [userData.email]
    );
    if (isEmailUsed.rows.length!==0) {
      return res.sendStatus(409);
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

export {checkIfEmailIsvalid};
