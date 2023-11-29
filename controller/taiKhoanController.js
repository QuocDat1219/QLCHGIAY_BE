const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllTAIKHOAN = async (req, res) => {
  try {
    const sqlQuery =
      "SELECT TenTK, TenNhanVien,CASE WHEN tk.Quyen = '1' THEN 'admin' ELSE 'user' END as Quyen FROM taikhoan tk inner join nhanvien nv on tk.MaNV = nv.MaNhanVien";
    const allTAIKHOAN = await sqlPool.request().query(sqlQuery);
    const isTAIKHOAN = allTAIKHOAN.recordset.length;

    if (isTAIKHOAN > 0) {
      res.status(200).json(allTAIKHOAN.recordset);
    } else {
      res.json({ message: "Không có tài khoản" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getTAIKHOANById = async (req, res) => {
  const id = req.params.id;
  try {
    const aTAIKHOAN = await sqlPool
      .request()
      .query(`SELECT * FROM taikhoan WHERE TenTK = '${id}'`);
    const count = aTAIKHOAN.recordset.length;

    if (count > 0) {
      res.status(200).json(aTAIKHOAN.recordset);
    } else {
      res.send({ message: "Không tồn tại tài khoản" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createTAIKHOAN = async (req, res) => {
  const { reqTenTK, reqMaNV, reqMatkhau, reqQuyen } = req.body;
  const insertQuery = `INSERT INTO taikhoan VALUES  ('${reqTenTK}', '${reqMaNV}', '${reqMatkhau}', '${reqQuyen}')`;
  const checkTAIKHOAN = `SELECT COUNT(*) as count FROM taikhoan WHERE TenTK = '${reqTenTK}' or MaNV = '${reqMaNV}'`;

  try {
    const TAIKHOANExists = await checkInsert(checkTAIKHOAN);

    if (TAIKHOANExists) {
      res.send({
        message: "Tài khoản đã tồn tại hoặc nhân viên đã có tài khoản",
      });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi thêm ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ thêm thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm không thành công" });
  }
};

const updateTAIKHOAN = async (req, res) => {
  const { reqTenTK, reqMaNV, reqMatkhau, reqQuyen } = req.body;
  const updateQuery = `
    UPDATE taikhoan
    SET
      MaNV='${reqMaNV}', Matkhau='${reqMatkhau}', Quyen='${reqQuyen}'
    WHERE TenTK = '${reqTenTK}'
  `;
  const checkTAIKHOAN = `SELECT COUNT(*) as count FROM taikhoan WHERE TenTK = '${reqTenTK}'`;

  try {
    const TAIKHOANExists = await checkInsert(checkTAIKHOAN);

    if (!TAIKHOANExists) {
      res.send({ message: "Không tìm thấy tài khoản" });
      return;
    }

    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);
        res.send({ message: "Lỗi khi cập nhật ở SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi cập nhật ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ cập nhật thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật không thành công" });
  }
};

const deleteTAIKHOAN = async (req, res) => {
  const id = req.params.id;
  const deleteTAIKHOAN = `DELETE FROM taikhoan WHERE TenTK = '${id}'`;
  const checkTAIKHOAN = `SELECT COUNT(*) as count FROM taikhoan WHERE TenTK = '${id}'`;

  try {
    const TAIKHOANExists = await checkInsert(checkTAIKHOAN);

    if (!TAIKHOANExists) {
      res.send({ message: "Không tìm thấy tài khoản" });
      return;
    }

    sqlPool.request().query(deleteTAIKHOAN, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa ở SQL Server" });
      } else {
        mysqlConnection.query(deleteTAIKHOAN, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa ở MySql" });
          } else {
            res.status(200).json({ message: "Đồng bộ xóa thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllTAIKHOAN,
  getTAIKHOANById,
  createTAIKHOAN,
  updateTAIKHOAN,
  deleteTAIKHOAN,
};
