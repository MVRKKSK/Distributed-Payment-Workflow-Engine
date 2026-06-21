require("dotenv").config();
const morgan = require("morgan");

const express = require("express");

const paymentRoutes =
require("./routes/paymentRoutes");

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/payments",
paymentRoutes);

app.listen(
  process.env.PORT,
  () => {
    console.log(
      `Payment API running on port ${process.env.PORT}`
    );
  }
);