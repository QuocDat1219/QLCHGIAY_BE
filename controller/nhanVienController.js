const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const {
  checkInsert,
  checkUpdate,
  checkLogin,
} = require("../auth/checkInfomation");

const getAllNhanVien = async (req, res) => {
  try {
    const sqlQuery =
      "SELECT nv.MaNhanVien as MaNV, nv.TenNhanVien as TenNV, nv.NgaySinh as NgaySinh, nv.GioiTinh as GioiTinh, nv.Diachi as DiaChi, nv.Sdt as Sdt , nv.email , ch.TenCuaHang FROM nhanvien nv INNER JOIN cuahang ch ON nv.MaCuaHang = ch.MaCuaHang ";
    const allNhanVien = await sqlPool.request().query(sqlQuery);
    if (allNhanVien.recordset.length > 0) {
      res.status(200).json(allNhanVien.recordset);
    } else {
      res.send({ message: "Không có " });
    }
  } catch (error) {
    console.error(error);
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getNhanVienById = async (req, res) => {
  try {
    const sqlQuery = `SELECT * FROM NHANVIEN WHERE MaNhanVien = '${req.params.id}'`;
    const aNhanVien = await sqlPool.request().query(sqlQuery);

    if (aNhanVien.recordset.length > 0) {
      res.status(200).json(aNhanVien.recordset);
    } else {
      res.send({ message: "Không tìm thấy !" });
    }
  } catch (error) {
    console.error(error);
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu!" });
  }
};

const createNhanVien = async (req, res) => {
  const {
    reqMaNV,
    reqMaCH,
    reqTenNV,
    reqNgaySinh,
    reqGioiTinh,
    reqDiachi,
    reqSdt,
    reqEmail,
  } = req.body;
  const insertQuery = `INSERT INTO nhanvien VALUES ('${reqMaNV}',N'${reqTenNV}','${reqGioiTinh}', '${reqNgaySinh}',N'${reqDiachi}','${reqSdt}','${reqEmail}','${reqMaCH}')`;
  const checkNhanVien = `SELECT COUNT(*) AS COUNT FROM NHANVIEN WHERE MaNhanVien = '${reqMaNV}'`;
  console.log(insertQuery);
  try {
    const maNVExists = await checkInsert(checkNhanVien);
    if (maNVExists) {
      res.json({ message: "đã tồn tại" });
      return;
    }

    // Tiến hành thêm trên cả hai cơ sở dữ liệu
    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        res.json({ message: "Lỗi khi thêm vào SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlInsertError) => {
          if (mysqlInsertError) {
            console.error("Lỗi khi thêm vào MySQL:", mysqlInsertError);
            res.json({ message: "Lỗi khi thêm vào MySQL" });
          } else {
            res.status(201).json({
              message: "Đồng bộ thêm thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.json({
      message: "Lỗi khi tạo nhân viên",
    });
  }
};

const updateNhanVien = async (req, res) => {
  const {
    reqMaNV,
    reqMaCH,
    reqTenNV,
    reqNgaySinh,
    reqGioiTinh,
    reqDiachi,
    reqSdt,
    reqEmail,
  } = req.body;
  const updateQuery = `UPDATE nhanvien set MaCuaHang='${reqMaCH}', TenNhanVien=N'${reqTenNV}', NGAYSINH = '${reqNgaySinh}', GioiTinh = '${reqGioiTinh}', DIACHI = N'${reqDiachi}', SDT = '${reqSdt}',Email = '${reqEmail}' where MaNhanVien = '${reqMaNV}'`;
  const checkNhanVien = `SELECT cOUNT(*) as count FROM NHANVIEN WHERE MaNhanVien = '${reqMaNV}'`;

  try {
    const nvExists = await checkUpdate(checkNhanVien);
    if (!nvExists) {
      res.send({ message: "Không tìm thấy nhân viên" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi thêm ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mySqlError) => {
          if (mySqlError) {
            res.staus(500).send({ message: "Lỗi thêm ở MySQL" });
          } else {
            res.status(200).json({ message: "Đồng bộ cập nhật thành công!" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send({ message: "Cập nhật không thành công!" });
  }
};

const deleteNhanVien = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM NHANVIEN WHERE MaNhanVien = '${id}'`;
  const checkNhanVien = `SELECT cOUNT(*) as count FROM NHANVIEN WHERE MaNhanVien = '${id}'`;
  try {
    const nvExists = await checkInsert(checkNhanVien);
    if (!nvExists) {
      res.send({ message: "Không tìm thấy nhân viên" });
      return;
    }

    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa ở SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mySqlError) => {
          if (mySqlError) {
            res.staus(500).send({ message: "Lỗi khi xóa ở MySQL" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Lỗi khi xóa nhân viên" });
  }
};

const nhanVienLogin = async (req, res) => {
  try {
    const checkTaiKhoan = `SELECT cOUNT(*) as count FROM taikhoan WHERE TenTk = '${req.body.taikhoan}' and MatKhau = '${req.body.matkhau}'`;
    const recordExists = await checkLogin(checkTaiKhoan);
    if (!recordExists) {
      res.send({ message: "Sai tên tài khoản hoặc mật khẩu" });
    } else {
      res.status(200).send({ message: "Đăng nhập thành công" });
    }
  } catch (error) {}
};

module.exports = {
  getAllNhanVien,
  getNhanVienById,
  createNhanVien,
  updateNhanVien,
  deleteNhanVien,
  nhanVienLogin,
};
