import connection from "../db/db.js";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

const userSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  confirmPassword: joi.string().required(),
});

const loginSchema = joi.object({
  name: joi.string().required(),
  password: joi.string().required(),
});

async function SignUpUser(req, res) {
  const userData = req.body;
  const passwordHash = bcrypt.hashSync(userData.password, 10);
  const validation = userSchema.validate(userData, { abortEarly: false });

  if (validation.error) {
    const error = validation.error.details.map((value) => value.message);
    return res.status(422).send(error);
  }

  if (userData.password !== userData.confirmPassword) {
    return res.status(422).send("As senhas são diferentes");
  }

  try {
    const isEmailUsed = await connection.query(
      "SELECT * FROM users WHERE email=$1",
      [userData.email]
    ).rows;
    if (isEmailUsed) {
      return res.sendStatus(409);
    }
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
  const loginData = req.body;
  try {
    const user = await connection.query(
      "SELECT * FROM users WHERE users.email LIKE $1",
      [loginData.email]
    );
    const validUser = user.rows[0];
    console.log(user);

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
    console.log(validSession.userId);
    const user = await connection.query("SELECT * FROM users WHERE id=$1", [
      validSession.userId,
    ]);
    if (!user.rows[0]) return res.sendStatus(404);
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

export { SignUpUser, SignInUser, GetUserInfo };
