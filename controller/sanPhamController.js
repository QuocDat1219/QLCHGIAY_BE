const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllMATHANG = async (req, res) => {
  try {
    const sqlQuery =
      "SELECT MaGiay as MaMG, TenGiay , DonGia, GiamGia, MaTH, dm.TenLoai ,th.TenThuongHieu FROM sanpham sp INNER JOIN danhmuc dm on sp.MaDanhMuc = dm.MaLoai inner join thuonghieu th on sp.MaTH = th.MaThuongHieu";
    const allMATHANG = await sqlPool.request().query(sqlQuery);
    const isMATHANG = allMATHANG.recordset.length;
    if (isMATHANG > 0) {
      res.status(200).json(allMATHANG.recordset);
    } else {
      res.json({ message: "Không có " });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getMATHANGById = async (req, res) => {
  const id = req.params.id;
  try {
    const aMATHANG = await sqlPool
      .request()
      .query(`SELECT * FROM sanpham WHERE MaGiay = '${id}'`);
    const count = aMATHANG.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aMATHANG.recordset);
    } else {
      res.send({ message: "Không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createMATHANG = async (req, res) => {
  const {
    reqMaGiay,
    reqMaDM,
    reqDonGia,
    reqGiamGia,
    reqTenGiay,
    reqMaTH,
  } = req.body;
  const insertQuery = `INSERT INTO sanpham VALUES  ('${reqMaGiay}', '${reqTenGiay}', '${reqDonGia}', '${reqGiamGia}', '${reqMaTH}', '${reqMaDM}')`;
  const checkMATHANG = `SELECT cOUNT(*) as count FROM sanpham WHERE MaGiay = '${reqMaGiay}'`;

  try {
    const TMATHANGxists = await checkInsert(checkMATHANG);
    if (TMATHANGxists) {
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
            res.status(200).json({ message: "Đồng bộ thêm thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm không thành công" });
  }
};

const updateMATHANG = async (req, res) => {
  const {
    reqMaGiay,
    reqMaDM,
    reqDonGia,
    reqGiamGia,
    reqTenGiay,
    reqMaTH,
  } = req.body;
  const updateQuery = `
  UPDATE sanpham
  SET
    TenGiay='${reqTenGiay}',DonGia='${reqDonGia}',GiamGia='${reqGiamGia}',MaTH='${reqMaTH}',MaDanhMuc='${reqMaDM}' WHERE MaGiay = '${reqMaGiay}'
`;
  const checkMATHANG = `SELECT cOUNT(*) as count FROM sanpham WHERE MaGiay = '${reqMaGiay}'`;

  try {
    const TMATHANGxists = await checkInsert(checkMATHANG);
    if (!TMATHANGxists) {
      res.send({ message: "Không tìm thấy sản phẩm" });
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

const deleteMATHANG = async (req, res) => {
  const id = req.params.id;
  const deleteteTK = `DELETE FROM sanpham WHERE MaGiay = '${id}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM sanpham WHERE MaGiay = '${id}'`;

  try {
    const khoExists = await checkInsert(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy sản phẩm" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
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
  getAllMATHANG,
  getMATHANGById,
  createMATHANG,
  updateMATHANG,
  deleteMATHANG,
};
