const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllHOADON = async (req, res) => {
  try {
    const sqlQuery =
      "select hd.MaHD as MaHD, nv.TenNhanVien as TenNV, kh.TenKhachHang as TenKH, hd.HinhThucTT as HinhThucTT, hd.NgayLap as NgayLap from hoadon hd inner join nhanvien nv on hd.MaNhanVien = nv.MaNhanVien inner join khachhang kh on hd.MaKhachHang = kh.MaKhachHang";
    const allHOADON = await sqlPool.request().query(sqlQuery);
    const isHOADON = allHOADON.recordset.length;
    if (isHOADON > 0) {
      res.status(200).json(allHOADON.recordset);
    } else {
      res.json({ message: "Không có hóa đơn" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getHOADONById = async (req, res) => {
  const id = req.params.id;
  try {
    const aHOADON = await sqlPool
      .request()
      .query(`SELECT * FROM HOADON WHERE MaHD = '${id}'`);
    const count = aHOADON.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aHOADON.recordset);
    } else {
      res.send({ message: "hóa đơn không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createHOADON = async (req, res) => {
  const { reqMaHD, reqMaNV, reqMaKH, reqHinhThucTT, reqNgayLap } = req.body;
  const insertQuery = `INSERT INTO HOADON VALUES ('${reqMaHD}','${reqNgayLap}',N'${reqHinhThucTT}','${reqMaNV}','${reqMaKH}')`;
  const checkHOADON = `SELECT cOUNT(*) as count FROM HOADON WHERE MaHD = '${reqMaHD}'`;

  try {
    const THOADONxists = await checkInsert(checkHOADON);
    if (THOADONxists) {
      res.send({ message: "hóa đơn đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm hóa đơn ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm hóa đơn không thành công" });
  }
};

const updateHOADON = async (req, res) => {
  const id = req.params.id;
  const { reqMaNV, reqMaKH, reqHinhThucTT, reqNgayLap } = req.body;
  const updateQuery = `UPDATE HOADON SET MaNhanVien = N'${reqMaNV}', MaKhachHang = '${reqMaKH}',HinhThucTT = N'${reqHinhThucTT}',NgayLap = N'${reqNgayLap}' WHERE MaHD = '${id}'`;
  const checkHOADON = `SELECT cOUNT(*) as count FROM HOADON WHERE MaHD = '${id}'`;

  try {
    const THOADONxists = await checkInsert(checkHOADON);
    if (!THOADONxists) {
      res.send({ message: "Không tìm thấy hóa đơn" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi cập nhật hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật hóa đơn ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ cập nhật hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật hóa đơn không thành công" });
  }
};

const deleteHOADON = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM HOADON WHERE MaHD = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM HOADON WHERE MaHD = '${id}'`;

  try {
    const khoExists = await checkInsert(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy hóa đơn" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa hóa đơn ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllHOADON,
  getHOADONById,
  createHOADON,
  updateHOADON,
  deleteHOADON,
};
