const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkUpdate, checkInsert } = require("../auth/checkInfomation");

const getChiNhanh = async (req, res) => {
  try {
    // Sử dụng sqlPool để thực hiện truy vấn trên SQL Server
    const sqlQuery = "SELECT * FROM chinhanh";
    const result = await sqlPool.request().query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    res.json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getChiNhanhById = async (req, res) => {
  try {
    const sqlQuery = `SELECT * FROM CHINHANH WHERE MaCN = '${req.params.id}'`;
    const aChiNhanh = await sqlPool.request().query(sqlQuery);

    if (aChiNhanh.recordset.length > 0) {
      res.status(200).json(aChiNhanh.recordset);
    } else {
      res.send({ error: "Không tìm thấy chi nhánh!" });
    }
  } catch (error) {
    console.error(error);
    res.send({ error: "Lỗi truy vấn cơ sở dữ liệu!" });
  }
};

const craeteChiNhanh = async (req, res) => {
  const { reqMaCN, reqTenCN, reqDiaChi, reqSdt, reqMaKV, reqGhiChu } = req.body;
  const insertQuery = `INSERT INTO CHINHANH VALUES ('${reqMaCN}',N'${reqTenCN}',N'${reqDiaChi}','${reqSdt}','${reqMaKV}','${reqGhiChu}')`;
  const checkChiNhanh = `SELECT cOUNT(*) as count FROM chinhanh WHERE MaCN = '${reqMaCN}'`;

  try {
    const TKExists = await checkInsert(checkChiNhanh);
    if (TKExists) {
      res.send({ message: "Đã tồn tại" });
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
            res
              .status(200)
              .json({ message: "Đồng bộ thêm thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.send({ message: "Thêm không thành công" });
  }
};

const updateChiNhanh = async (req, res) => {
  const { reqMaCN, reqTenCN, reqDiaChi, reqSdt, reqMaKV, reqGhiChu } = req.body;

  // Tạo lệnh truy vấn chung
  const updateQuery = `UPDATE CHINHANH set TenCN='${reqTenCN}', DiaChi='${reqDiaChi}', Sdt='${reqSdt}',MaKV = '${reqMaKV}' GhiChu = '${reqGhiChu}' WHERE MaCN='${reqMaCN}'`;
  const checkChiNhanh = `SELECT cOUNT(*) as count FROM chinhanh WHERE MaCN = '${reqMaCN}'`;

  try {
    const CNExists = await checkUpdate(checkChiNhanh);
    if (!CNExists) {
      res.status(400).json({ error: "Không tìm thấy chi nhánh" });
      return;
    }

    // Sửa ở cả 2 cơ sở dữ liệu
    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        res.json({ error: "Lỗi khi cập nhật trên SQL Server" });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            console.error("Lỗi khi cập nhật trên MySQL:", mysqlError);
            res.json({ error: "Lỗi khi cập nhật trên MySQL" });
          } else {
            res.status(200).json({
              message: "Đồng bộ cập nhật thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ error: "Cập nhật không thành công!" });
  }
};

const deleteChiNhanh = async (req, res) => {
  const id = req.params.id;
  const deleteQuery = `DELETE FROM CHINHANH WHERE MaCN = '${id}'`;
  const checkChiNhanh = `SELECT cOUNT(*) as count FROM chinhanh WHERE MaCN ='${id}'`;

  try {
    const CNExists = await checkInsert(checkChiNhanh);
    if (!CNExists) {
      res.status(400).json({ error: "Không tìm thấy chi nhánh" });
      return;
    }
    // thực hiện xóa
    sqlPool.request().query(deleteQuery, (sqlError) => {
      if (sqlError) {
        res.json({ error: "Lỗi khi xóa trên SQL Server" });
      } else {
        mysqlConnection.query(deleteQuery, (mysqlError) => {
          if (mysqlError) {
            console.error("Lỗi khi xóa trên MySQL:", mysqlError);
            res.json({ error: "Lỗi khi xóa trên MySQL" });
          } else {
            res.status(200).json({
              message: "Đồng bộ xóa thành công!",
            });
          }
        });
      }
    });
  } catch (error) {
    res.json({ error: "Xóa không thành công!" });
  }
};
module.exports = {
  getChiNhanh,
  getChiNhanhById,
  updateChiNhanh,
  deleteChiNhanh,
  craeteChiNhanh,
};
