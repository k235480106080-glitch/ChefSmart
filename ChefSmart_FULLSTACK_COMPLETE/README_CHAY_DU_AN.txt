CHEFSMART – BẢN FULL-STACK HOÀN CHỈNH
=====================================

Bản này đáp ứng 2 yêu cầu chính của Đề tài 26:

1. PHÂN LOẠI + “TỦ LẠNH CÓ GÌ” BẰNG SQL SERVER
- Dữ liệu được lưu trong SQL Server.
- Có các bảng Categories, Recipes, Ingredients, RecipeIngredients, Users.
- API /api/recipes hỗ trợ lọc theo danh mục, nguyên liệu và thời gian nấu.
- API /api/fridge dùng truy vấn nâng cao gồm:
  STRING_SPLIT, CTE, JOIN, GROUP BY, COUNT DISTINCT, CASE, ORDER BY.
- Kết quả trả về số nguyên liệu trùng, số nguyên liệu thiếu, phần trăm phù hợp và món có thể nấu ngay.

2. SPOONACULAR API THẬT
- API /api/international/random: lấy công thức ngẫu nhiên.
- API /api/international/search: tra cứu công thức theo từ khóa.
- Giao diện có nút “Tra cứu API” và “Gợi ý ngẫu nhiên”.

--------------------------------------------------
BƯỚC 1 – CÀI CÔNG CỤ
--------------------------------------------------
- Python 3.10 trở lên.
- SQL Server và SQL Server Management Studio (SSMS).
- Microsoft ODBC Driver 18 for SQL Server.
- VS Code.

--------------------------------------------------
BƯỚC 2 – TẠO DATABASE
--------------------------------------------------
1. Mở SSMS.
2. Kết nối SQL Server.
3. Mở file: database/setup.sql
4. Bấm Execute.
5. Kiểm tra đã có database ChefSmartDB và 5 bảng.

LƯU Ý: setup.sql xóa và tạo lại các bảng ChefSmart nếu chạy lại.

--------------------------------------------------
BƯỚC 3 – CẤU HÌNH .ENV
--------------------------------------------------
1. Sao chép .env.example thành .env.
2. Mở .env.
3. Sửa DB_SERVER theo tên Server hiển thị trong SSMS.

Ví dụ:
DB_SERVER=localhost\\SQLEXPRESS
hoặc
DB_SERVER=DESKTOP-ABC123\\SQLEXPRESS

Nếu đăng nhập Windows Authentication:
DB_TRUSTED_CONNECTION=yes

Nếu dùng tài khoản sa:
DB_TRUSTED_CONNECTION=no
DB_USERNAME=sa
DB_PASSWORD=mat_khau_sa

4. Tạo API key Spoonacular và dán vào:
SPOONACULAR_API_KEY=API_KEY_CUA_BAN

--------------------------------------------------
BƯỚC 4 – CÀI THƯ VIỆN VÀ CHẠY
--------------------------------------------------
Cách nhanh: nháy đúp run_app.bat

Hoặc chạy trong Terminal VS Code:

py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py

Sau đó mở:
http://127.0.0.1:5000

KHÔNG chạy bằng Live Server ở cổng 5500 vì Live Server chỉ chạy giao diện,
không chạy Flask, SQL Server và API.

--------------------------------------------------
BƯỚC 5 – KIỂM TRA 2 YÊU CẦU
--------------------------------------------------
A. Kiểm tra SQL Server:
Mở http://127.0.0.1:5000/api/health
Phải thấy "ok": true.

B. Kiểm tra Tủ lạnh có gì:
- Nhập: thịt bò, cà rốt, sả
- Bấm “Truy vấn SQL Server”.
- Bò kho sẽ có điểm phù hợp cao.

Ví dụ khác:
- tôm, trứng, cơm nguội → Cơm chiên Dương Châu.
- cá lóc, cà chua, dứa → Canh chua cá lóc.

C. Kiểm tra Spoonacular:
- Bấm “Gợi ý ngẫu nhiên”.
- Hoặc nhập “pasta” và bấm “Tra cứu API”.

--------------------------------------------------
CẤU TRÚC CHÍNH
--------------------------------------------------
app.py                    Backend Flask
index.html                Trang người dùng
script.js                 Gọi API backend
style.css                 Giao diện
dashboard.html            Trang quản trị
database/setup.sql        Tạo SQL Server + dữ liệu mẫu
.env.example              Mẫu cấu hình
requirements.txt          Thư viện Python
run_app.bat               Chạy nhanh trên Windows
images/                    Ảnh món ăn

--------------------------------------------------
LƯU Ý BẢO MẬT
--------------------------------------------------
- Không đưa file .env và API key lên GitHub.
- Tài khoản admin/123456 hiện là đăng nhập giao diện mô phỏng.
- Khi triển khai thật cần làm API đăng nhập và mã hóa mật khẩu.
