const { Router } = require("express");
const router = Router();
const { JWT_SECRET } = require("../config");
const { User, Accounts } = require("../db");
const jwt = require("jsonwebtoken");
const zod = require("zod");

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
};

router.use(errorHandler);


const signupBody = zod.object({
  username: zod.string().email(),
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});

router.post("/signup", async function (req, res) {
  const { success } = signupBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const existingUser = await User.findOne({ username: req.body.username });
  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }
  const user = await User.create({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: req.body.password,
  });
  const userId = user._id;
  const name = user.firstName
  console.log(userId);

  const token = jwt.sign({ userId, name }, JWT_SECRET);

  res.status(200).json({
    message: "User created successfully",
    token: token,
  });
});

const signinBody = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

router.post("/signin", async function (req, res) {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Email already taken / Incorrect inputs",
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password,
  });
  if (user) {
    const token = jwt.sign({ userId: user._id, name: user.firstName }, JWT_SECRET);
    return res.status(200).json({
      token: token,
    });
  }
  res.status(411).json({
    message: "Error while logging in",
  });
});

const updateBody = zod.object({
  firstName: zod.string(),
  lastName: zod.string(),
  password: zod.string(),
});



module.exports = router;
