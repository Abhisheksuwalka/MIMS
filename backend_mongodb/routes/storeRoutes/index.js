import bcrypt from "bcryptjs";
import express from "express";
import Jwt from "jsonwebtoken";
import { authenticateToken } from "../../middleware/index.js";
import Stores from "../../schema/store/index.js";
import querryApi from "./querryApi.js";
const router = express.Router();

router.get("/stores", (req, res) => {
  // Handle GET request for /stores route
  res.send("List of stores");
});

router.post("/signup", async (req, res) => {
  try {
    const { storeEmail, storeName, _password, address } = req.body;
    console.log("this", req.body);
    const password = await bcrypt.hash(_password, 10);
    const result = await Stores.create({
      storeEmail,
      password,
      storeName,
      address,
    });
    console.log("helo", result);
    res.status(200).send("success");
  } catch (err) {
    console.log(err);
    res.status(422).send(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { storeEmail, _password } = req.body;
    const store = await Stores.findOne({ storeEmail });
    if (!store) return res.status(402).send("store not found");
    else {
      if (await store.isValidPassword(_password)) {
        const token = Jwt.sign({ storeEmail }, process.env.JWT_SECRET);
        store.token = token;
        await store.save();
        res.status(200).send(token);
        console.log("login successfull");
      } else {
        res.status(401).send("wrong password");
      }
    }
  } catch (e) {
    res.status(422).send(e);
  }
});

router.use("/api", authenticateToken, querryApi);

export default router;
