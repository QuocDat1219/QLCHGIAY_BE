const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { checkUpdate, checkInsert } = require("../auth/checkInfomation");

const getAllCuaHang = async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM cuahang";
    const result = await sqlPool.request().query(sqlQuery);
    res.json(result.recordset);
  } catch (error) {
    res.json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
  }
};


module.exports = {
  getAllCuaHang
};
