const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllPhieuNhap = async (req, res) => {
  try {
    const sqlQuery =
      "select pn.MaPhieu as MaPhieuNhap, nv.TenNhanVien as TenNV, ch.TenCuaHang ,pn.NgayLap as NgayLapPhieu,pn.GhiChu from phieunhaphang pn inner join nhanvien nv on pn.MaNV = nv.MaNhanVien inner join cuahang ch on pn.MaCuaHang = ch.MaCuaHang";
    const allPHIEUNHAP = await sqlPool.request().query(sqlQuery);
    const isPHIEUNHAP = allPHIEUNHAP.recordset.length;
    if (isPHIEUNHAP > 0) {
      res.status(200).json(allPHIEUNHAP.recordset);
    } else {
      res.json({ message: "Không có phiếu nhập" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getPhieuNhapById = async (req, res) => {
  const id = req.params.id;
  try {
    const aPHIEUNHAP = await sqlPool
      .request()
      .query(`SELECT * FROM phieunhaphang WHERE MaPhieu = '${id}'`);
    const count = aPHIEUNHAP.recordset.length;

    if (count > 0) {
      res.status(200).json(aPHIEUNHAP.recordset);
    } else {
      res.send({ message: "Phiếu nhập không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createPhieuNhap = async (req, res) => {
  const { reqMaPhieuNhap, reqMaNV, reqMaCH, reqNgayLapPhieu, reqGhiChu } =
    req.body;
  const insertQuery = `INSERT INTO phieunhaphang VALUES ('${reqMaPhieuNhap}','${reqNgayLapPhieu}',N'${reqGhiChu}','${reqMaNV}','${reqMaCH}')`;
  const checkPHIEUNHAP = `SELECT cOUNT(*) as count FROM phieunhaphang WHERE MaPhieu = '${reqMaPhieuNhap}'`;

  try {
    const TKExists = await checkInsert(checkPHIEUNHAP);
    if (TKExists) {
      res.send({ message: "Phiếu nhập đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm phiếu nhập không thành công" });
  }
};

const updatePhieuNhap = async (req, res) => {
  const id = req.params.id;
  const { reqMaNV, reqMaCH, reqNgayLapPhieu, reqGhiChu } =
    req.body;
  const updateQuery = ` UPDATE phieunhaphang SET NgayLap='${reqNgayLapPhieu}', GhiChu=N'${reqGhiChu}', MaNV='${reqMaNV}', MaCuaHang='${reqMaCH}' WHERE MaPhieu='${id}'`;
  const checkPHIEUNHAP = `SELECT cOUNT(*) as count FROM phieunhaphang WHERE MaPhieu = '${id}'`;

  try {
    const TKExists = await checkInsert(checkPHIEUNHAP);
    if (!TKExists) {
      res.send({ message: "Không tìm thấy phiếu nhập" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật phiếu nhập không thành công" });
  }
};

const deletePhieuNhap = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM phieunhaphang WHERE MaPhieu = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM phieunhaphang WHERE MaPhieu = '${id}'`;

  try {
    const khoExists = await checkInsert(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy phiếu nhập" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllPhieuNhap,
  getPhieuNhapById,
  createPhieuNhap,
  updatePhieuNhap,
  deletePhieuNhap,
};
