const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllCHITIETHOADON = async (req, res) => {
  try {
    const sqlQuery =
      "SELECT MaHD,  ct.SoLuong as SoLuong,DVT, ThanhTien, sp.TenGiay FROM `cthoadon` ct INNER JOIN sanpham sp on sp.MaGiay = ct.MaGiay";
    const allCHITIETHOADON = await sqlPool.request().query(sqlQuery);
    const isCHITIETHOADON = allCHITIETHOADON.recordset.length;
    if (isCHITIETHOADON > 0) {
      res.status(200).json(allCHITIETHOADON.recordset);
    } else {
      res.json({ message: "Không có chi tiết hóa đơn" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getCHITIETHOADONById = async (req, res) => {
  const id = req.params.id;
  try {
    const aCHITIETHOADON = await sqlPool
      .request()
      .query(`SELECT ct.* , sp.TenGiay FROM cthoadon ct , sanpham sp WHERE ct.MaGiay = sp.MaGiay and MaHD = '${id}'`);
    const count = aCHITIETHOADON.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aCHITIETHOADON.recordset);
    } else {
      res.send({ message: "chi tiết hóa đơn không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};
const getCHITIETHOADONDetail = async (req, res) => {
  const magiay = req.query.magiay
  const mahd = req.query.mahd

  try {
    const aCHITIETHOADON = await sqlPool
      .request()
      .query(`SELECT * FROM cthoadon WHERE MaHD = '${mahd}' and MaGiay = '${magiay}'`);
    const count = aCHITIETHOADON.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aCHITIETHOADON.recordset);
    } else {
      res.send({ message: "chi tiết hóa đơn không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};
const createCHITIETHOADON = async (req, res) => {
  const { reqMaHD, reqMaGiay, reqSoLuong, reqDVT, reqThanhTien } = req.body;
  const insertQuery = `INSERT INTO cthoadon VALUES ('${reqMaHD}','${reqSoLuong}',N'${reqDVT}','${reqThanhTien}','${reqMaGiay}')`;
  const checkCHITIETHOADON = `SELECT cOUNT(*) as count FROM cthoadon WHERE MaHD='${reqMaHD}' and MaGiay = '${reqMaGiay}'`;

  try {
    const TKExists = await checkInsert(checkCHITIETHOADON);
    console.log('TKExists', TKExists)
    if (TKExists) {
      res.send({ message: "chi tiết hóa đơn đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm chi tiết hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm chi tiết hóa đơn ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm chi tiết hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    console.error(error)

    res.send({ message: "Thêm chi tiết hóa đơn không thành công" });
  }
};

const updateCHITIETHOADON = async (req, res) => {
  const { reqMaHD, reqMaGiay, reqSoLuong, reqDVT, reqThanhTien, reqIdMaGiay } = req.body;
  const updateQuery = `UPDATE cthoadon SET MaGiay = '${reqMaGiay}', SoLuong = '${reqSoLuong}',DVT = '${reqDVT}',ThanhTien= '${reqThanhTien}' WHERE  MaHD = '${reqMaHD}' and MaGiay = '${reqIdMaGiay}'`;

console.log(updateQuery);
  try {


    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({
          message: "Lỗi khi cập nhật chi tiết hóa đơn ở SQL Server",
        });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({
              message: "Lỗi khi cập nhật chi tiết hóa đơn ở MySql",
            });
          } else {
            res.status(200).json({
              message: "Đồng bộ cập nhật chi tiết hóa đơn thành công",
            });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật chi tiết hóa đơn không thành công" });
  }
};

const deleteCHITIETHOADON = async (req, res) => {

  const { reqMaGiay, id } = req.body
  const deleteteTK = `DELETE FROM cthoadon WHERE MaHD = '${id}' and MaGiay = '${reqMaGiay}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM cthoadon WHERE MaHD = '${id}'and MaGiay = '${reqMaGiay}'`;

  try {
    const khoExists = await checkInsert(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy chi tiết hóa đơn" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa chi tiết hóa đơn ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa chi tiết hóa đơn ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa chi tiết hóa đơn thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllCHITIETHOADON,
  getCHITIETHOADONById,
  createCHITIETHOADON,
  updateCHITIETHOADON,
  deleteCHITIETHOADON,
  getCHITIETHOADONDetail
};
