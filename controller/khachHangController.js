const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");
const getAllKhachHang = async (req, res) => {
  try {
    const selectQuery =
      "select kh.MaKhachHang as MaKH,ch.MaCuaHang as MaCH, kh.TenKhachHang as TenKH, kh.Diachi as Diachi,kh.Sdt as Sdt from khachhang kh inner join cuahang ch on kh.MaCH = ch.MaCuaHang";
    const allKhachHang = await sqlPool.request().query(selectQuery);
    if (allKhachHang.recordset.length > 0) {
      res.status(200).json(allKhachHang.recordset);
    } else {
      res.send({ message: "Không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getKhachHangById = async (req, res) => {
  const id = req.params.id;
  try {
    const selectQuery = `SELECT * FROM KHACHHANG WHERE MaKhachHang = '${id}'`;
    const aKhachHang = await sqlPool.request().query(selectQuery);
    if (aKhachHang.recordset.length > 0) {
      res.status(200).json(aKhachHang.recordset);
    } else {
      res.send({ message: "Không tìm thấy" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createKhachHang = async (req, res) => {
  const {
    reqMaKH,
    reqMaCH,
    reqTenKH,
    reqDiaChi,
    reqSdt,
  } = req.body;
  const insertQuery = `INSERT INTO KHACHHANG VALUES('${reqMaKH}', N'${reqTenKH}', N'${reqDiaChi}', '${reqSdt}', '${reqMaCH}')`;
  const checkKhachHang = `SELECT cOUNT(*) as count FROM KHACHHANG WHERE MaKhachHang = '${reqMaKH}'`;
  try {
    const khExists = await checkInsert(checkKhachHang);
    if (khExists) {
      res.send({ message: "Đã tồn tại!" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi thêm ở SQL Server " });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm ở Mysql" });
          } else {
            res.status(200).json({ message: "Đồng bộ thêm thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send({ message: "Thêm không thành công" });
  }
};

const updateKhachHang = async (req, res) => {
  const {
    reqMaKH,
    reqMaCH,
    reqTenKH,
    reqDiaChi,
    reqSdt,
  } = req.body;
  const updateQuery = `UPDATE KHACHHANG SET MACH = '${reqMaCH}', TENkHACHHANG = N'${reqTenKH}', DIACHI = N'${reqDiaChi}', SDT = '${reqSdt}' WHERE MAKHACHHANG = '${reqMaKH}'`;
  const checkKhachHang = `SELECT cOUNT(*) as count FROM KHACHHANG WHERE MAKHACHHANG = '${reqMaKH}'`;
  try {
    const khExists = await checkUpdate(checkKhachHang);
    if (!khExists) {
      res.send({ message: "Không tìm thấy khách hàng" });
      return;
    }
    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi cập nhật ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (sqlError) => {
          if (sqlError) {
            res.send({ message: "Lỗi khi cập nhật ở Mysql" });
          } else {
            res.status(200).send({ message: "Đồng bộ cập nhật thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send({ message: "Cập nhật không thành công" });
  }
};

const deleteKhachHang = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM KHACHHANG WHERE MAKHACHHANG = '${id}'`;
  const checkKhachHang = `SELECT cOUNT(*) as count FROM KHACHHANG WHERE MAKHACHHANG = '${id}'`;
  try {
    const khExists = await checkInsert(checkKhachHang);
    if (!khExists) {
      res.send({ message: "Không tìm thấy khách hàng" });
      return;
    }
    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi xóa ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (sqlError) => {
          if (sqlError) {
            res.send({ message: "Lỗi khi xóa ở Mysql" });
          } else {
            res.status(200).send({ message: "Đồng bộ xóa thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};
module.exports = {
  getAllKhachHang,
  getKhachHangById,
  createKhachHang,
  updateKhachHang,
  deleteKhachHang,
};
