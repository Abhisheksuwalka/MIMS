import bodyParser from "body-parser";
import Express from "express";
import connect from "../configDB/index.js";
import medicineRoutes from "../routes/midicine/index.js";
import storeRouter from "../routes/storeRoutes/index.js";

import cors from "cors";

const app = Express();
app.use(cors()); // cors middleware error fixed.
connect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/store", storeRouter);
app.use("/medicines", medicineRoutes);

app.listen(3000, () => {
  console.log("server started in 3000");
});

export default app;
