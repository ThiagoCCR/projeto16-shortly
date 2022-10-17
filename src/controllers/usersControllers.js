import connection from "../db/db.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

async function SignUpUser(req, res) {
  const userData = res.locals.userData;
  const passwordHash = bcrypt.hashSync(userData.password, 10);
  try {
    await connection.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3);",
      [userData.name, userData.email, passwordHash]
    );
    res.sendStatus(201);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

async function SignInUser(req, res) {
  const loginData = res.locals.loginData;
  try {
    const user = await connection.query(
      "SELECT * FROM users WHERE users.email LIKE $1",
      [loginData.email]
    );
    const validUser = user.rows[0];

    if (user && bcrypt.compareSync(loginData.password, validUser.password)) {
      const token = uuid();
      const userId = user.rows[0].id;

      await connection.query(
        'INSERT INTO sessions ("userId",token) VALUES ($1,$2)',
        [userId, token]
      );

      res.status(200).send({ token: token });
    } else {
      return res.status(401).send("Senha ou e-mail incorretos");
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
}

async function GetUserInfo(req, res) {
  const user = res.locals.user;
  try {
    const userInfo = await connection.query(
      'SELECT users.id, users.name, SUM(urls."visitCount") AS "visitCount" FROM users JOIN urls ON users.id=urls."userId" WHERE users.id=$1 GROUP BY users.id;',
      [user.rows[0].id]
    );
    const query = await connection.query(
      'SELECT urls.id, urls."shortURL", urls."URL", urls."visitCount" FROM urls WHERE urls."userId"=$1;',
      [user.rows[0].id]
    );
    const { rows } = query;
    const data = { ...userInfo.rows[0], shortenedUrls: rows };
    res.status(200).send(data);
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
}

async function GetUsersRanking(req, res) {
  try {
    const query = await connection.query(`
        SELECT 
            users."id", 
            users.name, 
            COUNT(urls."userId") as "linksCount", 
            COALESCE(SUM(urls."visitCount"),0) as "visitCount"
        FROM users
        LEFT JOIN urls ON users."id" = urls."userId"
        GROUP BY users."id"
        ORDER BY "visitCount" DESC, "linksCount" DESC
        LIMIT 10;
    `);
    const ranking = query.rows;
    res.status(200).send(ranking);
  } catch (error) {
    res.send("Não foi possível conectar ao Banco");
    console.log(error);
  }
}

export { SignUpUser, SignInUser, GetUserInfo, GetUsersRanking };
