import bcrypt from "bcryptjs"; // for hashing passwords
import jwt from "jsonwebtoken"; // for creating tokens to store in browser

import User from "../models/user.js";

export const signin = async (req, res) => {
  //destructuring the request body to get the email and password
  const { email, password } = req.body;
  try {
    //find the user with the email
    const existingUser = await User.findOne({ email });

    //if the user doesn't exist, return a 404 error
    if (!existingUser)
      return res.status(404).json({ message: "User doesn't exist." });

    //if the user exists, compare the password with the hashed password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );

    //if the password is incorrect, return a 400 error
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid credentials." });

    //if the password is correct, create a token
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      "test",
      { expiresIn: "1h" }
    );

    //send the token to the client
    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signup = async (req, res) => {
  //destructuring the request body to get the email and password
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    //find the user with the email
    const existingUser = await User.findOne({
      email,
    });
    //if the user exists, return a 400 error
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });
    //if the password and confirm password don't match, return a 400 error
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match." });
    //hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    //create a new user
    const result = await User.create({
      email,
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
    });
    //create a token
    const token = jwt.sign({ email: result.email, id: result._id }, "test", {
      expiresIn: "1h",
    });
    //send the token to the client
    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong." });
  }
};
