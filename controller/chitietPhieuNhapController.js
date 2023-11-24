const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllCHITIETPHIEUNHAP = async (req, res) => {
  try {
    const sqlQuery =
      "select ct.MaPhieuNhap as MaPhieuNhap, nv.TenNV as TenNV, kho.TenKho as TenKho, mh.TenMH as TenMH, ct.SoLuong as SoLuong, ct.GiaNhap as GiaNhap, ct.GiaBan as GiaBan, ct.ThanhTien as ThanhTien, pn.DVT as DVT, pn.NgayLapPhieu as NgayLapPhieu  from chitietphieunhap ct inner join phieunhap pn on ct.MaPhieuNhap = pn.MaPhieuNhap inner join mathang mh on mh.MaMH = ct.MaMH inner join kho on kho.MaKho = pn.MaKho inner join nhanvien nv on nv.MaNV = pn.MaNV";
    const allCHITIETPHIEUNHAP = await sqlPool.request().query(sqlQuery);
    const isCHITIETPHIEUNHAP = allCHITIETPHIEUNHAP.recordset.length;
    if (isCHITIETPHIEUNHAP > 0) {
      res.status(200).json(allCHITIETPHIEUNHAP.recordset);
    } else {
      res.json({ message: "Không có chi tiết phiếu nhập" });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const getCHITIETPHIEUNHAPById = async (req, res) => {
  const id = req.params.id;
  try {
    const aCHITIETPHIEUNHAP = await sqlPool
      .request()
      .query(`SELECT ct.* , sp.TenGiay FROM ctphieunhap ct ,sanpham sp WHERE  ct.MaGiay = sp.MaGiay and MaPhieu = '${id}'`);
    const count = aCHITIETPHIEUNHAP.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aCHITIETPHIEUNHAP.recordset);
    } else {
      res.send({ message: "chi tiết phiếu nhập không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};
const getCHITIETPHIEUNHAPDetail = async (req, res) => {
  const magiay = req.query.magiay;
  const mapn = req.query.mapn;
  try {
    const aCHITIETPHIEUNHAP = await sqlPool
      .request()
      .query(`SELECT * FROM ctphieunhap WHERE MaPhieu = '${mapn}' and MaGiay = '${magiay}'`);
    const count = aCHITIETPHIEUNHAP.recordset.length;
    console.log();
    if (count > 0) {
      res.status(200).json(aCHITIETPHIEUNHAP.recordset);
    } else {
      res.send({ message: "chi tiết phiếu nhập không tồn tại" });
    }
  } catch (error) {
    res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};

const createCHITIETPHIEUNHAP = async (req, res) => {
  const {
    reqMaPhieuNhap,
    reqMaGiay,
    reqGiaNhap,
    reqGiaBan,
    reqSoLuong,
    reqDvt,
    reqThanhTien,
  } = req.body;
  const insertQuery = `INSERT INTO ctphieunhap VALUES ('${reqMaPhieuNhap}','${reqGiaNhap}','${reqGiaBan}','${reqSoLuong}',N'${reqDvt}', '${reqThanhTien}', '${reqMaGiay}')`;
  const checkCHITIETPHIEUNHAP = `SELECT cOUNT(*) as count FROM ctphieunhap WHERE MaPhieu = '${reqMaPhieuNhap}' and MaGiay = '${reqMaGiay}'`;
console.log(insertQuery);
  try {
    const TKExists = await checkInsert(checkCHITIETPHIEUNHAP);
    if (TKExists) {
      res.send({ message: "chi tiết phiếu nhập đã tồn tại" });
      return;
    }

    sqlPool.request().query(insertQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({ message: "Lỗi khi thêm chi tiết phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(insertQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({ message: "Lỗi khi thêm chi tiết phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ thêm chi tiết phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Thêm chi tiết phiếu nhập không thành công" });
  }
};

const updateCHITIETPHIEUNHAP = async (req, res) => {
  const {
    reqIdMaGiay,
    reqMaPhieuNhap,
    reqMaGiay,
    reqGiaNhap,
    reqGiaBan,
    reqSoLuong,
    reqDvt,
    reqThanhTien,
  } = req.body;

  const updateQuery = `UPDATE ctphieunhap SET MaGiay = '${reqMaGiay}', GiaNhap = '${reqGiaNhap}',GiaBan = '${reqGiaBan}', SoLuong= '${reqSoLuong}',ThanhTien= '${reqThanhTien}',DVT = '${reqDvt}' WHERE  MaPhieu = '${reqMaPhieuNhap}' and MaGiay = '${reqIdMaGiay}'`;


  try {


    sqlPool.request().query(updateQuery, (sqlError) => {
      if (sqlError) {
        console.error(sqlError);

        res.send({
          message: "Lỗi khi cập nhật chi tiết phiếu nhập ở SQL Server",
        });
      } else {
        mysqlConnection.query(updateQuery, (mysqlError) => {
          if (mysqlError) {
            res.send({
              message: "Lỗi khi cập nhật chi tiết phiếu nhập ở MySql",
            });
          } else {
            res.status(200).json({
              message: "Đồng bộ cập nhật chi tiết phiếu nhập thành công",
            });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Cập nhật chi tiết phiếu nhập không thành công" });
  }
};

const deleteCHITIETPHIEUNHAP = async (req, res) => {
  const { reqMaGiay, id } = req.body
  const deleteteTK = `DELETE FROM ctphieunhap WHERE MaPhieu = '${id}' and MaGiay = '${reqMaGiay}'`;
  const checkTK = `SELECT cOUNT(*) as count FROM ctphieunhap WHERE MaPhieu = '${id}' and MaGiay = '${reqMaGiay}'`;

  try {
    const khoExists = await checkInsert(checkTK);
    if (!khoExists) {
      res.send({ message: "Không tìm thấy chi tiết phiếu nhập" });
      return;
    }

    sqlPool.request().query(deleteteTK, (sqlError) => {
      if (sqlError) {
        res.send({ message: "Lỗi khi xóa chi tiết phiếu nhập ở SQL Server" });
      } else {
        mysqlConnection.query(deleteteTK, (mysqlError) => {
          if (mysqlError) {
            console.log(mysqlError);
            res.send({ message: "Lỗi khi xóa chi tiết phiếu nhập ở MySql" });
          } else {
            res
              .status(200)
              .json({ message: "Đồng bộ xóa chi tiết phiếu nhập thành công" });
          }
        });
      }
    });
  } catch (error) {
    res.send({ message: "Xóa không thành công" });
  }
};

module.exports = {
  getAllCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPById,
  createCHITIETPHIEUNHAP,
  updateCHITIETPHIEUNHAP,
  deleteCHITIETPHIEUNHAP,
  getCHITIETPHIEUNHAPDetail,
};
