const { sqlPool } = require("../config/connectSqlServer");
const { mysqlConnection } = require("../config/connectMySql");
const { executeOracleQuery } = require("../config/connectOracle");

const migrateDatabase = async (req, res) => {
  const { bang, cot, phantan, bangvitu, cotvitu, dieukien } = req.body;
  let chiNhanhOra,
    cuaHangOra,
    nhanVienOra,
    khachHangOra,
    hoaDonOra,
    ctHoaDonOra,
    sanPhamOra,
    thuongHieuOra,
    danhMucOra,
    ctPhieuNhapOra,
    phieuNhapOra = "";
  if (bangvitu || cotvitu || dieukien) {
    cuahang = `select ch.* into cuahang from chinhanh cn inner join openquery(QLCHGIAY,'select * from cuahang') ch on cn.MaCN = ch.MaCN where ch.${cotvitu} = '${dieukien}'`;
    chinhanh = `select * into chinhanh from openquery(QLCHGIAY,'select * from chinhanh where ${cot} = N''${phantan}''')`;
  } else {
    chinhanh = `select * into chinhanh from openquery(QLCHGIAY,'select * from chinhanh where ${cot} = N''${phantan}''')`;
    cuahang = `select ch.* into cuahang from chinhanh cn inner join openquery(QLCHGIAY,'select * from cuahang') ch on cn.MaCN = ch.MaCN`;
  }

  if (bang || cot || dieukien) {
    //Tạo các biến truy vấn oracle
    chiNhanhOra = `select * from chinhanh except select * from chinhanh where ${cot} = '${phantan}'`;
    cuaHangOra = `select * from cuahang except select ch.* from cuahang ch inner join chinhanh cn on ch.MaCN = cn.MaCN where cn.${cot} = '${phantan}'`;
    nhanVienOra = `select * from nhanvien except select nv.* from nhanvien nv inner join cuahang ch on nv.MaCuaHang = ch.MaCuaHang inner join chinhanh cn on cn.MaCN = ch.MaCN WHERE cn.${cot} = '${phantan}'`;
    khachHangOra = `select * from khachhang except select kh.* from khachhang kh inner join cuahang ch on kh.MaCH = ch.MaCuaHang inner join chinhanh cn on cn.MaCN = ch.MaCN WHERE cn.${cot} = '${phantan}'`;
    hoaDonOra = `select * from hoadon except select hd.* from hoadon hd 
    inner join khachhang kh on kh.MaKhachHang = hd.MaKhachHang
    inner join nhanvien nv on nv.MaNhanVien = hd.MaNhanVien
    inner join cuahang ch on kh.MaCH = ch.MaCuaHang 
    inner join chinhanh cn on cn.MaCN = ch.MaCN WHERE cn.${cot} = '${phantan}'`;
    ctHoaDonOra = `select * from cthoadon except select ct.* from cthoadon ct inner join hoadon hd on hd.MaHD = ct.MaHD
    inner join khachhang kh on kh.MaKhachHang = hd.MaKhachHang
    inner join nhanvien nv on nv.MaNhanVien = hd.MaNhanVien
    inner join cuahang ch on kh.MaCH = ch.MaCuaHang 
    inner join chinhanh cn on cn.MaCN = ch.MaCN WHERE cn.${cot} = '${phantan}'`;
    sanPhamOra = `select * from sanpham`;
    thuongHieuOra = `select * from thuonghieu`;
    danhMucOra = `select * from danhmuc`;
    ctPhieuNhapOra = `select * from ctphieunhap except select ctpn.* from ctphieunhap ctpn inner join sanpham sp on ctpn.MaGiay = sp.MaGiay
    inner join cthoadon ct on sp.MaGiay = ct.MaGiay 
    inner join hoadon hd on hd.MaHD = ct.MaHD
    inner join khachhang kh on kh.MaKhachHang = hd.MaKhachHang
    inner join nhanvien nv on nv.MaNhanVien = hd.MaNhanVien
    inner join cuahang ch on kh.MaCH = ch.MaCuaHang 
    inner join chinhanh cn on cn.MaCN = ch.MaCN WHERE cn.${cot} = '${phantan}'`;
    phieuNhapOra = `select * from phieunhaphang except select pn.* from phieunhaphang pn 
    inner join ctphieunhap ctpn on pn.MaPhieu = ctpn.MaPhieu
    inner join sanpham sp on ctpn.MaGiay = sp.MaGiay
    inner join cthoadon ct on sp.MaGiay = ct.MaGiay 
    inner join hoadon hd on hd.MaHD = ct.MaHD
    inner join khachhang kh on kh.MaKhachHang = hd.MaKhachHang
    inner join nhanvien nv on nv.MaNhanVien = hd.MaNhanVien
    inner join cuahang ch on kh.MaCH = ch.MaCuaHang 
    inner join chinhanh cn on cn.MaCN = ch.MaCN WHERE cn.${cot} = '${phantan}'`;

    //Tán bảng chi nhánh
    const resultcn = await mysqlConnection.promise().query(chiNhanhOra);
    const [resultsCN] = resultcn;
    //Kiểm tra bảng chi nhánh đã có ở csdl hay chưa
    const checkTableQuery1 =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'CHINHANH'";
    const result1 = await executeOracleQuery(checkTableQuery1);
    const tableCount1 = result1.rows[0][0];
    //Báo lỗi nếu bảng tồn tại
    if (tableCount1 > 0) {
      res.send({ message: "Bảng chi nhánh đã tồn tại" });
    } else {
      //Tạo bảng chi nhánh ở oracle với các cột
      const oracleQuery1 =
        "CREATE TABLE chinhanh (MaCN varchar2(20), DiaChi varchar2(50), Sdt varchar2(11), Email varchar2(20))";
      await executeOracleQuery(oracleQuery1);
    }
    //Lấy dữ liệu truy vấn được từ mysql
    for (const row of resultsCN) {
      const MaCN = row.MaCN;
      const DiaChi = row.DiaChi;
      const Sdt = row.Sdt;
      const Email = row.Email;

      //Thêm vào table chi nhánh ở oracle
      const insertQuery1 =
        "INSERT INTO chinhanh (MaCN, DiaChi, Sdt, Email) VALUES (:MaCN, :DiaChi, :Sdt, :Email)";
      const insertParams1 = [MaCN, DiaChi, Sdt, Email];
      await executeOracleQuery(insertQuery1, insertParams1);
    }
    //Tạo khóa chính
    const alterQuery1 =
      "ALTER TABLE chinhanh ADD CONSTRAINT pk_chinhanh PRIMARY KEY (MaCN)";
    await executeOracleQuery(alterQuery1);

    //Phân tán cửa các bước tương tự
    const cuaHangResult = await mysqlConnection.promise().query(cuaHangOra);
    const [cuaHangResults] = cuaHangResult;
    const checkTableQueryCuaHang =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'CUAHANG'";
    const resultCuaHang = await executeOracleQuery(checkTableQueryCuaHang);
    const tableCountCuaHang = resultCuaHang.rows[0][0];

    if (tableCountCuaHang > 0) {
      console.log("Bảng cửa hàng đã tồn tại");
    } else {
      const oracleQueryCuaHang =
        "CREATE TABLE cuahang (MaCuaHang varchar2(20), TenCuaHang varchar2(50), DiaChi varchar2(50), Sdt varchar2(11), Email varchar2(50), MaCN varchar2(20))";
      await executeOracleQuery(oracleQueryCuaHang);
    }

    for (const row of cuaHangResults) {
      const MaCuaHang = row.MaCuaHang;
      const TenCuaHang = row.TenCuaHang;
      const DiaChi = row.DiaChi;
      const Sdt = row.Sdt;
      const Email = row.Email;
      const MaCN = row.MaCN;

      const insertQueryCuaHang =
        "INSERT INTO cuahang (MaCuaHang, TenCuaHang, DiaChi, Sdt, Email, MaCN) VALUES (:MaCuaHang, :TenCuaHang, :DiaChi, :Sdt, :Email, :MaCN)";
      const insertParamsCuaHang = [
        MaCuaHang,
        TenCuaHang,
        DiaChi,
        Sdt,
        Email,
        MaCN,
      ];
      await executeOracleQuery(insertQueryCuaHang, insertParamsCuaHang);
    }
    //Tạo khóa chính
    const alterQueryCuaHang_PRI =
      "ALTER TABLE cuahang ADD CONSTRAINT pk_cuahang PRIMARY KEY (MaCuaHang)";
    await executeOracleQuery(alterQueryCuaHang_PRI);
    //Tạo khóa ngoại
    const alterQueryCuaHang_FK_CN =
      "ALTER TABLE cuahang ADD CONSTRAINT fk_CuaHang_CN FOREIGN KEY (MaCN) REFERENCES chinhanh(MaCN)";
    await executeOracleQuery(alterQueryCuaHang_FK_CN);

    //Phân tán nhân viên
    const nhanVienResult = await mysqlConnection.promise().query(nhanVienOra);
    const [nhanVienResults] = nhanVienResult;
    const checkTableQueryNhanVien =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'NHANVIEN'";
    const resultNhanVien = await executeOracleQuery(checkTableQueryNhanVien);
    const tableCountNhanVien = resultNhanVien.rows[0][0];

    if (tableCountNhanVien > 0) {
      console.log("Bảng nhân viên đã tồn tại");
    } else {
      const oracleQueryNhanVien =
        "CREATE TABLE nhanvien (MaNhanVien varchar2(20), TenNhanVien varchar2(50), GioiTinh varchar2(10), NgaySinh date, DiaChi varchar2(50), SDT varchar2(11), Email varchar2(50), MaCuaHang varchar2(20))";
      await executeOracleQuery(oracleQueryNhanVien);
    }

    // Thêm dữ liệu vào bảng nhanvien
    for (const row of nhanVienResults) {
      const MaNhanVien = row.MaNhanVien;
      const TenNhanVien = row.TenNhanVien;
      const GioiTinh = row.GioiTinh;
      const NgaySinh = row.NgaySinh; // Ngày sinh phải được định dạng đúng
      const DiaChi = row.DiaChi;
      const SDT = row.SDT;
      const Email = row.Email;
      const MaCuaHang = row.MaCuaHang;

      const insertQueryNhanVien =
        "INSERT INTO nhanvien (MaNhanVien, TenNhanVien, GioiTinh, NgaySinh, DiaChi, SDT, Email, MaCuaHang) VALUES (:MaNhanVien, :TenNhanVien, :GioiTinh, :NgaySinh, :DiaChi, :SDT, :Email, :MaCuaHang)";
      const insertParamsNhanVien = [
        MaNhanVien,
        TenNhanVien,
        GioiTinh,
        NgaySinh,
        DiaChi,
        SDT,
        Email,
        MaCuaHang,
      ];
      await executeOracleQuery(insertQueryNhanVien, insertParamsNhanVien);
    }

    // Thêm ràng buộc khóa chính và khóa ngoại vào bảng nhanvien
    const alterQueryNhanVien_PRI =
      "ALTER TABLE nhanvien ADD CONSTRAINT pk_nhanvien PRIMARY KEY (MaNhanVien)";
    await executeOracleQuery(alterQueryNhanVien_PRI);

    const alterQueryNhanVien_FK_CuaHang =
      "ALTER TABLE nhanvien ADD CONSTRAINT fk_NhanVien_CuaHang FOREIGN KEY (MaCuaHang) REFERENCES cuahang(MaCuaHang)";
    await executeOracleQuery(alterQueryNhanVien_FK_CuaHang);

    //Phân tán bảng khách hàng
    //Phân tán nhân viên
    const khachhangResult = await mysqlConnection.promise().query(khachHangOra);
    const [khachhangResults] = khachhangResult;
    // Kiểm tra xem bảng khachhang đã tồn tại chưa
    const checkTableQueryKhachHang =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'KHACHHANG'";
    const resultKhachHang = await executeOracleQuery(checkTableQueryKhachHang);
    const tableCountKhachHang = resultKhachHang.rows[0][0];

    if (tableCountKhachHang > 0) {
      console.log("Bảng khachhang đã tồn tại");
    } else {
      // Nếu bảng chưa tồn tại, tạo mới
      const oracleQueryKhachHang =
        "CREATE TABLE khachhang (MaKhachHang varchar2(20), TenKhachHang varchar2(50), DiaChi varchar2(50), SDT varchar2(11), MaCH varchar2(20))";
      await executeOracleQuery(oracleQueryKhachHang);
    }

    // Thêm dữ liệu vào bảng khachhang
    for (const row of khachhangResults) {
      const MaKhachHang = row.MaKhachHang;
      const TenKhachHang = row.TenKhachHang;
      const DiaChi = row.DiaChi;
      const SDT = row.SDT;
      const MaCH = row.MaCH;

      const insertQueryKhachHang =
        "INSERT INTO khachhang (MaKhachHang, TenKhachHang, DiaChi, SDT, MaCH) VALUES (:MaKhachHang, :TenKhachHang, :DiaChi, :SDT, :MaCH)";
      const insertParamsKhachHang = [
        MaKhachHang,
        TenKhachHang,
        DiaChi,
        SDT,
        MaCH,
      ];
      await executeOracleQuery(insertQueryKhachHang, insertParamsKhachHang);
    }

    // Thêm khóa chính vào bảng khachhang
    const alterQueryKhachHang_PRI =
      "ALTER TABLE khachhang ADD CONSTRAINT pk_khachhang PRIMARY KEY (MaKhachHang)";
    await executeOracleQuery(alterQueryKhachHang_PRI);

    // Thêm khóa ngoại từ MaCH đến bảng cuahang
    const alterQueryKhachHang_FK_CH =
      "ALTER TABLE khachhang ADD CONSTRAINT fk_KhachHang_CH FOREIGN KEY (MaCH) REFERENCES cuahang(MaCuaHang)";
    await executeOracleQuery(alterQueryKhachHang_FK_CH);

    //Phân tán hóa đơn
    // Kiểm tra xem bảng hoadon đã tồn tại chưa
    const hoaDonResult = await mysqlConnection.promise().query(hoaDonOra);
    const [hoaDonResults] = hoaDonResult;
    const checkTableQueryHoaDon =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'HOADON'";
    const resultHoaDon = await executeOracleQuery(checkTableQueryHoaDon);
    const tableCountHoaDon = resultHoaDon.rows[0][0];

    if (tableCountHoaDon > 0) {
      console.log("Bảng hoadon đã tồn tại");
    } else {
      // Nếu bảng chưa tồn tại, tạo mới
      const oracleQueryHoaDon =
        "CREATE TABLE hoadon (MaHD varchar2(20), NgayLap date, HinhThucTT varchar2(50), MaNhanVien varchar2(20), MaKhachHang varchar2(20))";
      await executeOracleQuery(oracleQueryHoaDon);
    }

    for (const row of hoaDonResults) {
      const MaHD = row.MaHD;
      const NgayLap = row.NgayLap;
      const HinhThucTT = row.HinhThucTT;
      const MaNhanVien = row.MaNhanVien;
      const MaKhachHang = row.MaKhachHang;

      const insertQueryHoaDon =
        "INSERT INTO hoadon (MaHD, NgayLap, HinhThucTT, MaNhanVien, MaKhachHang) VALUES (:MaHD, :NgayLap, :HinhThucTT, :MaNhanVien, :MaKhachHang)";
      const insertParamsHoaDon = [
        MaHD,
        NgayLap,
        HinhThucTT,
        MaNhanVien,
        MaKhachHang,
      ];
      await executeOracleQuery(insertQueryHoaDon, insertParamsHoaDon);
    }

    // Thêm khóa chính vào bảng hoadon
    const alterQueryHoaDon_PRI =
      "ALTER TABLE hoadon ADD CONSTRAINT pk_hoadon PRIMARY KEY (MaHD)";
    await executeOracleQuery(alterQueryHoaDon_PRI);

    // Thêm khóa ngoại từ MaNhanVien đến bảng nhanvien
    const alterQueryHoaDon_FK_NV =
      "ALTER TABLE hoadon ADD CONSTRAINT fk_HoaDon_NV FOREIGN KEY (MaNhanVien) REFERENCES nhanvien(MaNhanVien)";
    await executeOracleQuery(alterQueryHoaDon_FK_NV);

    // Thêm khóa ngoại từ MaKhachHang đến bảng khachhang
    const alterQueryHoaDon_FK_KH =
      "ALTER TABLE hoadon ADD CONSTRAINT fk_HoaDon_KH FOREIGN KEY (MaKhachHang) REFERENCES khachhang(MaKhachHang)";
    await executeOracleQuery(alterQueryHoaDon_FK_KH);

    //Phân tán chi tiết hóa đơn
    const cthdHoaDonResult = await mysqlConnection.promise().query(ctHoaDonOra);
    const [cthdHoaDonResults] = cthdHoaDonResult;
    // Kiểm tra xem bảng cthoadon đã tồn tại chưa
    const checkTableQueryCTHoaDon =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'CTHOADON'";
    const resultCTHoaDon = await executeOracleQuery(checkTableQueryCTHoaDon);
    const tableCountCTHoaDon = resultCTHoaDon.rows[0][0];

    if (tableCountCTHoaDon > 0) {
      console.log("Bảng chi tiết hóa đơn đã tồn tại");
    } else {
      const oracleQueryCTHoaDon =
        "CREATE TABLE cthoadon (MaHD varchar2(20), SoLuong number, DVT varchar2(10), ThanhTien number, MaGiay varchar2(20))";
      await executeOracleQuery(oracleQueryCTHoaDon);
    }

    // Lấy dữ liệu cho bảng cthoadon và chèn vào bảng cthoadon

    for (const row of cthdHoaDonResults) {
      const MaHD = row.MaHD;
      const SoLuong = row.SoLuong;
      const DVT = row.DVT;
      const ThanhTien = row.ThanhTien;
      const MaGiay = row.MaGiay;

      const insertQueryCTHoaDon =
        "INSERT INTO cthoadon (MaHD, SoLuong, DVT, ThanhTien, MaGiay) VALUES (:MaHD, :SoLuong, :DVT, :ThanhTien, :MaGiay)";
      const insertParamsCTHoaDon = [MaHD, SoLuong, DVT, ThanhTien, MaGiay];
      await executeOracleQuery(insertQueryCTHoaDon, insertParamsCTHoaDon);
    }

    // Thêm khóa chính vào bảng hoadon
    const alterQueryCTHoaDon_PRI =
      "ALTER TABLE cthoadon ADD CONSTRAINT pk_CThoadon PRIMARY KEY (MaHD)";
    await executeOracleQuery(alterQueryCTHoaDon_PRI);

    // Thêm khóa ngoại từ cthoadon đến bảng hoadon
    const alterQueryHoaDon_FK_CTHD =
      "ALTER TABLE cthoadon ADD CONSTRAINT fk_HoaDon_CTHD FOREIGN KEY (MaHD) REFERENCES hoadon(MaHD)";
    await executeOracleQuery(alterQueryHoaDon_FK_CTHD);

    //Phân tán bảng sản phẩm
    const sanPhamResult = await mysqlConnection.promise().query(sanPhamOra);
    const [sanPhamResults] = sanPhamResult;
    // Kiểm tra xem bảng sanpham đã tồn tại chưa
    const checkTableQuerySanPham =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'SANPHAM'";
    const resultSanPham = await executeOracleQuery(checkTableQuerySanPham);
    const tableCountSanPham = resultSanPham.rows[0][0];

    if (tableCountSanPham > 0) {
      console.log("Bảng sản phẩm đã tồn tại");
    } else {
      const oracleQuerySanPham =
        "CREATE TABLE sanpham (MaGiay varchar2(20), TenGiay varchar2(200), DonGia number, GiamGia number, MaTH varchar2(20), MaDanhMuc varchar2(20), PRIMARY KEY (MaGiay))";
      await executeOracleQuery(oracleQuerySanPham);
    }

    // Lấy dữ liệu cho bảng sanpham và chèn vào bảng sanpham
    for (const row of sanPhamResults) {
      const MaGiay = row.MaGiay;
      const TenGiay = row.TenGiay;
      const DonGia = row.DonGia;
      const GiamGia = row.GiamGia;
      const MaTH = row.MaTH;
      const MaDanhMuc = row.MaDanhMuc;

      const insertQuerySanPham =
        "INSERT INTO sanpham (MaGiay, TenGiay, DonGia, GiamGia, MaTH, MaDanhMuc) VALUES (:MaGiay, :TenGiay, :DonGia, :GiamGia, :MaTH, :MaDanhMuc)";
      const insertParamsSanPham = [
        MaGiay,
        TenGiay,
        DonGia,
        GiamGia,
        MaTH,
        MaDanhMuc,
      ];
      await executeOracleQuery(insertQuerySanPham, insertParamsSanPham);
    }

    // Thêm khóa ngoại từ cthoadon đến sanpham
    const alterQueryCTHoaDon_FK_SanPham =
      "ALTER TABLE cthoadon ADD CONSTRAINT fk_CT_HoaDon_SanPham FOREIGN KEY (MaGiay) REFERENCES sanpham(MaGiay)";
    await executeOracleQuery(alterQueryCTHoaDon_FK_SanPham);

    //Phân tán bảng thương hiệu
    const thuongHieuResult = await mysqlConnection
      .promise()
      .query(thuongHieuOra);
    const [thuongHieuResults] = thuongHieuResult;
    // Kiểm tra xem bảng thuonghieu đã tồn tại chưa
    const checkTableQueryThuongHieu =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'THUONGHIEU'";
    const resultThuongHieu = await executeOracleQuery(
      checkTableQueryThuongHieu
    );
    const tableCountThuongHieu = resultThuongHieu.rows[0][0];

    if (tableCountThuongHieu > 0) {
      console.log("Bảng thương hiệu đã tồn tại");
    } else {
      const oracleQueryThuongHieu =
        "CREATE TABLE thuonghieu (MaThuongHieu varchar2(20), TenThuongHieu varchar2(50), DiaChi varchar2(50), SDT varchar2(11), Email varchar2(50), PRIMARY KEY (MaThuongHieu))";
      await executeOracleQuery(oracleQueryThuongHieu);
    }

    // Lấy dữ liệu cho bảng thuonghieu và chèn vào bảng thuonghieu
    for (const row of thuongHieuResults) {
      const MaThuongHieu = row.MaThuongHieu;
      const TenThuongHieu = row.TenThuongHieu;
      const DiaChi = row.DiaChi;
      const SDT = row.SDT;
      const Email = row.Email;

      const insertQueryThuongHieu =
        "INSERT INTO thuonghieu (MaThuongHieu, TenThuongHieu, DiaChi, SDT, Email) VALUES (:MaThuongHieu, :TenThuongHieu, :DiaChi, :SDT, :Email)";
      const insertParamsThuongHieu = [
        MaThuongHieu,
        TenThuongHieu,
        DiaChi,
        SDT,
        Email,
      ];
      await executeOracleQuery(insertQueryThuongHieu, insertParamsThuongHieu);
    }

    // Thêm khóa ngoại từ sanpham đến thuonghieu
    const danhMucResult = await mysqlConnection.promise().query(danhMucOra);
    const [danhMucResults] = danhMucResult;

    const alterQuerySanPham_FK_ThuongHieu =
      "ALTER TABLE sanpham ADD CONSTRAINT fk_SanPham_ThuongHieu FOREIGN KEY (MaTH) REFERENCES thuonghieu(MaThuongHieu)";
    await executeOracleQuery(alterQuerySanPham_FK_ThuongHieu);

    //Phân tán danh mục sản phẩm
    // Kiểm tra xem bảng danhmuc đã tồn tại chưa
    const checkTableQueryDanhMuc =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'DANHMUC'";
    const resultDanhMuc = await executeOracleQuery(checkTableQueryDanhMuc);
    const tableCountDanhMuc = resultDanhMuc.rows[0][0];

    if (tableCountDanhMuc > 0) {
      console.log("Bảng danh mục đã tồn tại");
    } else {
      const oracleQueryDanhMuc =
        "CREATE TABLE danhmuc (MaLoai varchar2(20), TenLoai varchar2(50), GhiChu varchar2(255), PRIMARY KEY (MaLoai))";
      await executeOracleQuery(oracleQueryDanhMuc);
    }

    // Lấy dữ liệu cho bảng danhmuc và chèn vào bảng danhmuc
    for (const row of danhMucResults) {
      const MaLoai = row.MaLoai;
      const TenLoai = row.TenLoai;
      const GhiChu = row.GhiChu;

      const insertQueryDanhMuc =
        "INSERT INTO danhmuc (MaLoai, TenLoai, GhiChu) VALUES (:MaLoai, :TenLoai, :GhiChu)";
      const insertParamsDanhMuc = [MaLoai, TenLoai, GhiChu];
      await executeOracleQuery(insertQueryDanhMuc, insertParamsDanhMuc);
    }

    // Thêm khóa ngoại từ sanpham đến danhmuc
    const alterQuerySanPham_FK_DanhMuc =
      "ALTER TABLE sanpham ADD CONSTRAINT fk_SanPham_DanhMuc FOREIGN KEY (MaDanhMuc) REFERENCES danhmuc(MaLoai)";
    await executeOracleQuery(alterQuerySanPham_FK_DanhMuc);

    //Phân tán chi tiết phiếu nhập
    const ctPhieuNhapResult = await mysqlConnection
      .promise()
      .query(ctPhieuNhapOra);
    const [ctPhieuNhapResults] = ctPhieuNhapResult;

    // Kiểm tra xem bảng ctphieunhap đã tồn tại chưa
    const checkTableQueryCTPhieuNhap =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'CTPHIEUNHAP'";
    const resultCTPhieuNhap = await executeOracleQuery(
      checkTableQueryCTPhieuNhap
    );
    const tableCountCTPhieuNhap = resultCTPhieuNhap.rows[0][0];

    if (tableCountCTPhieuNhap > 0) {
      console.log("Bảng chi tiết phiếu nhập đã tồn tại");
    } else {
      const oracleQueryCTPhieuNhap =
        "CREATE TABLE ctphieunhap (MaPhieu varchar2(20), GiaNhap number, GiaBan number, SoLuong number, DVT varchar2(10), ThanhTien number, MaGiay varchar2(20), PRIMARY KEY (MaPhieu), FOREIGN KEY (MaGiay) REFERENCES sanpham(MaGiay))";
      await executeOracleQuery(oracleQueryCTPhieuNhap);
    }

    // Lấy dữ liệu cho bảng ctphieunhap và chèn vào bảng ctphieunhap

    for (const row of ctPhieuNhapResults) {
      const MaPhieu = row.MaPhieu;
      const GiaNhap = row.GiaNhap;
      const GiaBan = row.GiaBan;
      const SoLuong = row.SoLuong;
      const DVT = row.DVT;
      const ThanhTien = row.ThanhTien;
      const MaGiay = row.MaGiay;

      const insertQueryCTPhieuNhap =
        "INSERT INTO ctphieunhap (MaPhieu, GiaNhap, GiaBan, SoLuong, DVT, ThanhTien, MaGiay) VALUES (:MaPhieu, :GiaNhap, :GiaBan, :SoLuong, :DVT, :ThanhTien, :MaGiay)";
      const insertParamsCTPhieuNhap = [
        MaPhieu,
        GiaNhap,
        GiaBan,
        SoLuong,
        DVT,
        ThanhTien,
        MaGiay,
      ];
      await executeOracleQuery(insertQueryCTPhieuNhap, insertParamsCTPhieuNhap);
    }

    //Phân tán phiếu nhập hàng
    const phieuNhapHangResult = await mysqlConnection
      .promise()
      .query(phieuNhapOra);
    const [phieuNhapHangResults] = phieuNhapHangResult;

    // Kiểm tra xem bảng phieunhaphang đã tồn tại chưa

    const checkTableQueryPhieuNhapHang =
      "SELECT COUNT(*) FROM user_tables WHERE table_name = 'PHIEUNHAPHANG'";
    const resultPhieuNhapHang = await executeOracleQuery(
      checkTableQueryPhieuNhapHang
    );
    const tableCountPhieuNhapHang = resultPhieuNhapHang.rows[0][0];

    if (tableCountPhieuNhapHang > 0) {
      console.log("Bảng phiếu nhập hàng đã tồn tại");
    } else {
      const oracleQueryPhieuNhapHang =
        "CREATE TABLE phieunhaphang (MaPhieu varchar2(20), NgayLap date, GhiChu varchar2(255), MaNV varchar2(20), MaCuaHang varchar2(20), PRIMARY KEY (MaPhieu), FOREIGN KEY (MaNV) REFERENCES nhanvien(MaNhanVien), FOREIGN KEY (MaCuaHang) REFERENCES cuahang(MaCuaHang))";
      await executeOracleQuery(oracleQueryPhieuNhapHang);
    }

    // Lấy dữ liệu cho bảng phieunhaphang và chèn vào bảng phieunhaphang

    for (const row of phieuNhapHangResults) {
      const MaPhieu = row.MaPhieu;
      const NgayLap = row.NgayLap;
      const GhiChu = row.GhiChu;
      const MaNV = row.MaNV; // Giả sử tên trường là MaNhanVien trong dữ liệu MySQL
      const MaCuaHang = row.MaCuaHang;

      const insertQueryPhieuNhapHang =
        "INSERT INTO phieunhaphang (MaPhieu, NgayLap, GhiChu, MaNV, MaCuaHang) VALUES (:MaPhieu, :NgayLap, :GhiChu, :MaNV, :MaCuaHang)";
      const insertParamsPhieuNhapHang = [
        MaPhieu,
        NgayLap,
        GhiChu,
        MaNV,
        MaCuaHang,
      ];
      await executeOracleQuery(
        insertQueryPhieuNhapHang,
        insertParamsPhieuNhapHang
      );
    }
    // Thêm khóa ngoại từ ctphieunhap đến bảng phieunhaphang
    const alterQueryHoaDon_CTPN_PN =
      "ALTER TABLE ctphieunhap ADD CONSTRAINT fk_CTPN_PN FOREIGN KEY (MaPhieu) REFERENCES phieunhaphang(MaPhieu)";
    await executeOracleQuery(alterQueryHoaDon_CTPN_PN);

    const migrateSQl = [
      //Phân tán chi nhánh
      chinhanh,
      "alter table chinhanh add constraint PK_CN PRIMARY KEY (MaCN)",

      //Phân tán cửa hàng
      cuahang,
      "alter table cuahang add constraint PK_CH PRIMARY KEY (MaCuaHang)",
      "alter table cuahang add constraint FK_CH_CN FOREIGN KEY (MaCN) REFERENCES chinhanh(MaCN)",

      //Phân tán nhan viên
      "select nv.* into nhanvien from cuahang ch inner join openquery(QLCHGIAY,'select * from nhanvien') nv on nv.MaCuaHang = ch.MaCuaHang",
      "alter table nhanvien add constraint PK_NV PRIMARY KEY (MaNhanVien)",
      "alter table nhanvien add constraint FK_CH_NV FOREIGN KEY (MaCuaHang) REFERENCES cuahang(MaCuaHang)",

      //Phân tán khách hàng
      "select kh.* into khachhang from cuahang ch inner join openquery(QLCHGIAY,'select * from khachhang') kh on kh.MACH = ch.MaCuaHang",
      "alter table khachhang add constraint PK_KH PRIMARY KEY (MaKhachHang)",
      "alter table khachhang add constraint FK_CH_KH FOREIGN KEY (MaCH) REFERENCES cuahang(MaCuaHang)",

      //Phân tán hóa đơn
      "select hd.* into hoadon from nhanvien nv inner join openquery(QLCHGIAY,'select * from hoadon') hd on hd.MaNhanVien = nv.MaNhanVien inner join khachhang kh on kh.MaKhachHang = hd.MaKhachHang",
      "alter table hoadon add constraint PK_HD PRIMARY KEY (MaHD)",
      "alter table hoadon add constraint FK_HD_KH FOREIGN KEY (MaKhachHang) REFERENCES khachhang(MaKhachHang)",
      "alter table hoadon add constraint FK_HD_NV FOREIGN KEY (MaNhanVien) REFERENCES nhanvien(MaNhanVien)",

      //Phân tán chi tiết hóa đơn
      "select ct.* into cthoadon from hoadon hd inner join openquery(QLCHGIAY,'select * from cthoadon') ct on hd.MaHD = ct.MaHd",
      "alter table cthoadon add constraint PK_CTHD PRIMARY KEY (MaHD,MaGiay)",
      "alter table cthoadon add constraint FK_HD_CTHD FOREIGN KEY (MaHD) REFERENCES hoadon(MaHD)",

      //Phân tán sản phẩm
      "select * into sanpham from openquery(QLCHGIAY,'select * from sanpham')",
      "alter table sanpham add constraint PK_SP PRIMARY KEY (MaGIay)",
      "alter table cthoadon add constraint FK_SP_CTHD FOREIGN KEY (MaGIay) REFERENCES sanpham(MaGIay)",

      //Phân tán thương hiệu
      "select * into thuonghieu from openquery(QLCHGIAY,'select * from thuonghieu')",
      "alter table thuonghieu add constraint PK_TH PRIMARY KEY (MaThuongHieu)",
      "alter table sanpham add constraint FK_SP_TH FOREIGN KEY (MaTH) REFERENCES thuonghieu(MaThuongHieu)",

      //Phân tán danh mục
      "select * into danhmuc from openquery(QLCHGIAY,'select * from danhmuc')",
      "alter table danhmuc add constraint PK_DM PRIMARY KEY (MaLoai)",
      "alter table sanpham add constraint FK_SP_DM FOREIGN KEY (MaDanhMuc) REFERENCES danhmuc(MaLoai)",

      //Phân tán chi tiết phiếu nhập
      "select ct.* into ctphieunhap from sanpham sp inner join openquery(QLCHGIAY,'select * from ctphieunhap') ct on sp.MaGiay = ct.MaGiay",
      "alter table ctphieunhap add constraint PK_CTPN PRIMARY KEY (MaPhieu,MaGiay)",
      "alter table ctphieunhap add constraint FK_SP_CTPN FOREIGN KEY (MaGiay) REFERENCES sanpham(MaGiay)",

      //Phân tán phiếu nhập
      "select pn.* into phieunhaphang from ctphieunhap ct inner join openquery(QLCHGIAY,'select * from phieunhaphang') pn on ct.MaPhieu = pn.MaPhieu group by pn.MaPhieu, pn.NgayLap, pn.GhiChu, pn.MaNV,pn.MaCuaHang",
      "alter table phieunhaphang add constraint PK_PN PRIMARY KEY (MaPhieu)",
      "alter table phieunhaphang add constraint FK_PN_NV FOREIGN KEY (MaNV) REFERENCES nhanvien(MaNhanVien)",
      "alter table phieunhaphang add constraint FK_PN_CH FOREIGN KEY (MaCuaHang) REFERENCES cuahang(MaCuaHang)",
      "alter table ctphieunhap add constraint FK_CTPN_PN FOREIGN KEY (MaPhieu) REFERENCES phieunhaphang(MaPhieu)",
    ];
    for (const sqlQuery of migrateSQl) {
      await sqlPool.query(sqlQuery);
    }

    res.status(200).send({ message: "Phân tán thành công" });
  } else {
    res.send({ message: "Chọn điều kiện phân tán" });
  }
};
module.exports = {
  migrateDatabase,
};
