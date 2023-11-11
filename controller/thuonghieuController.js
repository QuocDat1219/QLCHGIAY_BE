const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkInsert, checkUpdate } = require("../auth/checkInfomation");

const getAllThuongHieu = async (req, res) => {
    try {
        const sqlQuery = "SELECT * FROM THUONGHIEU";
        const allLOAIHANG = await sqlPool.request().query(sqlQuery);
        const isLOAIHANG = allLOAIHANG.recordset.length;
        if (isLOAIHANG > 0) {
            res.status(200).json(allLOAIHANG.recordset);
        } else {
            res.json({ message: "Không có " });
        }
    } catch (error) {
        console.error(error);
        res.json({ message: "Lỗi truy vấn cơ sở dữ liệu" });
    }
};

const getThuongHieuById = async (req, res) => {
    const id = req.params.id;
    try {
        const aLOAIHANG = await sqlPool
            .request()
            .query(`SELECT * FROM THUONGHIEU WHERE MaThuongHieu = '${id}'`);
        const count = aLOAIHANG.recordset.length;
        console.log();
        if (count > 0) {
            res.status(200).json(aLOAIHANG.recordset);
        } else {
            res.send({ message: "Không tồn tại" });
        }
    } catch (error) {
        res.send({ message: "Lỗi truy vấn cơ sở dữ liệu" });
    }
};

const createThuongHieu = async (req, res) => {
    const { reqMaTH, reqTenTH, reqDiaChi, reqSDT, reqEmail } = req.body;
    const insertQuery = `INSERT INTO THUONGHIEU VALUES ('${reqMaTH}',N'${reqTenTH}',N'${reqDiaChi}','${reqSDT}','${reqEmail}')`;
    const checkLOAIHANG = `SELECT cOUNT(*) as count FROM THUONGHIEU WHERE MaThuongHieu = '${reqMaTH}'`;

    try {
        const TKExists = await checkInsert(checkLOAIHANG);
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
                        res.status(200).json({ message: "Đồng bộ thêm thành công" });
                    }
                });
            }
        });
    } catch (error) {
        res.send({ message: "Thêm không thành công" });
    }
};

const updateThuongHieu = async (req, res) => {
    const { reqMaTH, reqTenTH, reqDiaChi, reqSDT, reqEmail } = req.body;
    const updateQuery = `UPDATE THUONGHIEU SET TenThuongHieu = N'${reqTenTH}' , DiaChi= N'${reqDiaChi}',SDT = '${reqSDT}', Email = '${reqEmail}'  WHERE MaThuongHieu = '${reqMaTH}'`;
    const checkLOAIHANG = `SELECT cOUNT(*) as count FROM THUONGHIEU WHERE MaThuongHieu = '${reqMaTH}'`;

    try {
        const TKExists = await checkInsert(checkLOAIHANG);
        if (!TKExists) {
            res.send({ message: "Không tìm thấy danh mục" });
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

const deleteThuongHieu = async (req, res) => {
    const id = req.params.id;
    const deleteteTK = `DELETE FROM THUONGHIEU WHERE MaThuongHieu = '${id}'`;
    const checkTK = `SELECT cOUNT(*) as count FROM THUONGHIEU WHERE MaThuongHieu = '${id}'`;

    try {
        const khoExists = await checkInsert(checkTK);
        if (!khoExists) {
            res.send({ message: "Không tìm thấy danh mục" });
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
    getAllThuongHieu,
    getThuongHieuById,
    createThuongHieu,
    updateThuongHieu,
    deleteThuongHieu
};