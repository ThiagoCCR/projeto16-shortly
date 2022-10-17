import joi from "joi";

const userSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().required(),
  confirmPassword: joi.string().required(),
});

const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

async function validateSignUpSchema(req, res, next) {
  const userData = req.body;
  const validation = userSchema.validate(userData, { abortEarly: false });

  if (validation.error) {
    const error = validation.error.details.map((value) => value.message);
    return res.status(422).send(error);
  }

  if (userData.password !== userData.confirmPassword) {
    return res.status(422).send("As senhas são diferentes");
  }

  res.locals.userData = userData;
  next();
}

async function validateSignInSchema(req, res, next) {
  const loginData = req.body;
  const validation = loginSchema.validate(loginData, { abortEarly: false });

  if (validation.error) {
    const error = validation.error.details.map((value) => value.message);
    return res.status(422).send(error);
  }

  res.locals.loginData = loginData;
  next();
}

export { validateSignUpSchema, validateSignInSchema };
