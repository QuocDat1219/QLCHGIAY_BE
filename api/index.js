require("dotenv").config();
const { sqlPool, connectSQL } = require("../config/connectSqlServer");
const { connectMysql } = require("../config/connectMySql");
const { connectOracle } = require("../config/connectOracle");
const express = require("express");
const cors = require("cors");

connectSQL();
connectMysql();
connectOracle();

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

const phanTanNgangRoutes = require("../routes/phanTanRoutes");

app.use("/api", phanTanNgangRoutes);

app.use((req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).send({ message: err, message });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
