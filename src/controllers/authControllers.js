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
    const validUser= user.rows[0];
    console.log(user)

    if (user && bcrypt.compareSync(loginData.password, validUser.password)) {
      const token = uuid();
      const userId = user.rows[0].id

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

export { SignUpUser, SignInUser };
