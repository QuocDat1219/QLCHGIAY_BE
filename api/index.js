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
const danhMucRoutes = require("../routes/danhmucRouters");
const thuongHieuRouters = require("../routes/thuonghieuRouters");
const loginMysqlRoutes = require("../routes/loginMysqlRoutes");
const chinhanhRoutes = require("../routes/chinhanhRoutes");
const cuahangRoutes = require("../routes/cuahangRoutes");
const nhanVienRoutes = require("../routes/nhanVienRoutes");
const khachHangRoutes = require("../routes/khachHangRoutes");
const sanPhamRoutes = require("../routes/sanPhamRoutes");
const phieuNhapRoutes = require("../routes/phieuNhapRoutes");
const chiTietPhieuNhapRoutes = require("../routes/chiTietPhieuNhapRoutes");
const hoaDonRoutes = require("../routes/hoaDonRoutes");
const chiTietHoaDonRoutes = require("../routes/chiTietHoaDonRoutes");

app.use("/api/khachhang", khachHangRoutes);
app.use("/api/nhanvien", nhanVienRoutes);
app.use("/api", phanTanNgangRoutes);
app.use("/api/danhmuc", danhMucRoutes);
app.use("/api/thuonghieu", thuongHieuRouters);
app.use("/api/mysql", loginMysqlRoutes);
app.use("/api/chinhanh", chinhanhRoutes);
app.use("/api/cuahang", cuahangRoutes);
app.use("/api/sanpham", sanPhamRoutes);
app.use("/api/phieunhap", phieuNhapRoutes);
app.use("/api/chitietphieunhap", chiTietPhieuNhapRoutes);
app.use("/api/hoadon", hoaDonRoutes);
app.use("/api/chitiethoadon", chiTietHoaDonRoutes);

app.use((req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(400).send({ message: err, message });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
