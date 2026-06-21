
USE ChefSmartDB;
GO

IF OBJECT_ID(N'dbo.RecipeIngredients', N'U') IS NOT NULL DROP TABLE dbo.RecipeIngredients;
IF OBJECT_ID(N'dbo.Recipes', N'U') IS NOT NULL DROP TABLE dbo.Recipes;
IF OBJECT_ID(N'dbo.Ingredients', N'U') IS NOT NULL DROP TABLE dbo.Ingredients;
IF OBJECT_ID(N'dbo.Categories', N'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Icon NVARCHAR(20) NULL,
    Description NVARCHAR(300) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Categories_IsActive DEFAULT 1
);
GO

CREATE TABLE dbo.Ingredients (
    IngredientID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(120) NOT NULL UNIQUE,
    Icon NVARCHAR(20) NULL,
    Unit NVARCHAR(50) NULL,
    IngredientGroup NVARCHAR(100) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Ingredients_IsActive DEFAULT 1
);
GO

CREATE TABLE dbo.Recipes (
    RecipeID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(200) NOT NULL,
    CategoryID INT NOT NULL,
    Description NVARCHAR(1000) NULL,
    Instructions NVARCHAR(MAX) NOT NULL,
    CookingTime INT NOT NULL CHECK (CookingTime > 0),
    Servings INT NOT NULL CONSTRAINT DF_Recipes_Servings DEFAULT 1,
    Calories INT NULL,
    Rating DECIMAL(3,2) NOT NULL CONSTRAINT DF_Recipes_Rating DEFAULT 0,
    ReviewCount INT NOT NULL CONSTRAINT DF_Recipes_ReviewCount DEFAULT 0,
    Difficulty VARCHAR(20) NOT NULL CONSTRAINT DF_Recipes_Difficulty DEFAULT 'easy',
    ImagePath NVARCHAR(300) NULL,
    Emoji NVARCHAR(20) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Recipes_IsActive DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Recipes_CreatedAt DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Recipes_Categories FOREIGN KEY (CategoryID) REFERENCES dbo.Categories(CategoryID),
    CONSTRAINT CK_Recipes_Difficulty CHECK (Difficulty IN ('easy', 'medium', 'hard'))
);
GO

CREATE TABLE dbo.RecipeIngredients (
    RecipeIngredientID INT IDENTITY(1,1) PRIMARY KEY,
    RecipeID INT NOT NULL,
    IngredientID INT NOT NULL,
    Quantity NVARCHAR(100) NULL,
    IsOptional BIT NOT NULL CONSTRAINT DF_RecipeIngredients_IsOptional DEFAULT 0,
    CONSTRAINT FK_RecipeIngredients_Recipes FOREIGN KEY (RecipeID) REFERENCES dbo.Recipes(RecipeID) ON DELETE CASCADE,
    CONSTRAINT FK_RecipeIngredients_Ingredients FOREIGN KEY (IngredientID) REFERENCES dbo.Ingredients(IngredientID),
    CONSTRAINT UQ_RecipeIngredients UNIQUE (RecipeID, IngredientID)
);
GO

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(120) NULL,
    Email NVARCHAR(150) NULL,
    Role NVARCHAR(20) NOT NULL CONSTRAINT DF_Users_Role DEFAULT 'user',
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT 1
);
GO

INSERT INTO dbo.Categories (Name, Icon, Description) VALUES
(N'Ẩm thực Việt', N'🇻🇳', N'Các món ăn truyền thống Việt Nam'),
(N'Khai vị', N'🥗', N'Món nhẹ dùng trước bữa chính'),
(N'Canh và súp', N'🍲', N'Các món canh, súp và nước dùng'),
(N'Món chính', N'🍖', N'Các món chính trong bữa ăn'),
(N'Món nướng', N'🍗', N'Các món chế biến bằng phương pháp nướng'),
(N'Cơm', N'🍛', N'Các món ăn chế biến từ cơm');
GO

INSERT INTO dbo.Ingredients (Name, Icon, Unit, IngredientGroup) VALUES
(N'Xương bò', N'🦴', N'g', N'Thịt'),
(N'Thịt bò', N'🥩', N'g', N'Thịt'),
(N'Bánh phở', N'🍜', N'g', N'Tinh bột'),
(N'Gừng', N'🫚', N'củ', N'Gia vị'),
(N'Hành tây', N'🧅', N'củ', N'Rau củ'),
(N'Hoa hồi', N'⭐', N'g', N'Gia vị'),
(N'Quế', N'🪵', N'g', N'Gia vị'),
(N'Rau thơm', N'🌿', N'g', N'Rau'),
(N'Tôm', N'🦐', N'g', N'Hải sản'),
(N'Thịt heo', N'🥓', N'g', N'Thịt'),
(N'Bánh tráng', N'🫓', N'lá', N'Tinh bột'),
(N'Bún tươi', N'🍜', N'g', N'Tinh bột'),
(N'Xà lách', N'🥬', N'g', N'Rau'),
(N'Cà rốt', N'🥕', N'củ', N'Rau củ'),
(N'Cá lóc', N'🐟', N'con', N'Hải sản'),
(N'Me', N'🟤', N'g', N'Gia vị'),
(N'Dứa', N'🍍', N'quả', N'Trái cây'),
(N'Cà chua', N'🍅', N'quả', N'Rau củ'),
(N'Giá đỗ', N'🌱', N'g', N'Rau'),
(N'Gà', N'🍗', N'g', N'Thịt'),
(N'Mật ong', N'🍯', N'ml', N'Gia vị'),
(N'Tỏi', N'🧄', N'tép', N'Gia vị'),
(N'Nước tương', N'🥣', N'ml', N'Gia vị'),
(N'Sả', N'🌿', N'cây', N'Gia vị'),
(N'Nước cốt dừa', N'🥥', N'ml', N'Gia vị'),
(N'Khoai tây', N'🥔', N'củ', N'Rau củ'),
(N'Cơm nguội', N'🍚', N'bát', N'Tinh bột'),
(N'Trứng', N'🥚', N'quả', N'Thực phẩm'),
(N'Lạp xưởng', N'🌭', N'g', N'Thịt'),
(N'Đậu Hà Lan', N'🫛', N'g', N'Rau củ'),
(N'Hành lá', N'🌱', N'g', N'Rau');
GO

DECLARE @Viet INT = (SELECT CategoryID FROM dbo.Categories WHERE Name = N'Ẩm thực Việt');
DECLARE @KhaiVi INT = (SELECT CategoryID FROM dbo.Categories WHERE Name = N'Khai vị');
DECLARE @Canh INT = (SELECT CategoryID FROM dbo.Categories WHERE Name = N'Canh và súp');
DECLARE @MonChinh INT = (SELECT CategoryID FROM dbo.Categories WHERE Name = N'Món chính');
DECLARE @Nuong INT = (SELECT CategoryID FROM dbo.Categories WHERE Name = N'Món nướng');
DECLARE @Com INT = (SELECT CategoryID FROM dbo.Categories WHERE Name = N'Cơm');

INSERT INTO dbo.Recipes
(Name, CategoryID, Description, Instructions, CookingTime, Servings, Calories, Rating, ReviewCount, Difficulty, ImagePath, Emoji)
VALUES
(N'Phở Bò Hà Nội', @Viet,
 N'Tô phở truyền thống với nước dùng ninh từ xương bò, thơm mùi gừng, quế và hồi.',
 N'Hầm xương bò, hớt bọt để nước dùng trong||Nướng gừng và hành tây rồi cho vào nồi||Thêm quế, hồi và nêm gia vị||Trụng bánh phở, xếp thịt bò và chan nước dùng||Ăn kèm rau thơm, chanh và ớt',
 180, 4, 450, 4.90, 1240, 'hard', N'images/pho-bo.png', N'🍜'),
(N'Gỏi Cuốn Tôm Thịt', @KhaiVi,
 N'Gỏi cuốn tươi mát với tôm, thịt heo, bún và rau sống.',
 N'Luộc chín tôm và thịt heo||Thái mỏng thịt, bóc vỏ tôm||Làm mềm bánh tráng||Xếp bún, rau, thịt, tôm rồi cuộn chặt||Dùng kèm nước mắm chua ngọt',
 20, 4, 180, 4.70, 856, 'easy', N'images/goi-cuon.png', N'🥗'),
(N'Canh Chua Cá Lóc', @Canh,
 N'Canh chua cá lóc mang hương vị miền Nam với vị chua ngọt cân bằng.',
 N'Làm sạch cá lóc và cắt khúc||Đun nước với me||Cho cá vào nấu chín||Thêm cà chua, dứa và giá đỗ||Nêm gia vị, thêm rau thơm rồi tắt bếp',
 40, 4, 220, 4.80, 692, 'medium', N'images/canh-chua-ca.png', N'🍲'),
(N'Gà Nướng Mật Ong', @Nuong,
 N'Gà nướng vàng óng với mật ong, tỏi và nước tương.',
 N'Rửa sạch thịt gà và để ráo||Trộn mật ong, tỏi, nước tương và gia vị||Ướp gà 30 phút||Nướng ở 180 độ C trong 40 phút||Phết thêm mật ong và nướng đến khi vàng',
 75, 4, 380, 4.60, 445, 'medium', N'images/ga-nuong.png', N'🍗'),
(N'Bò Kho Bánh Mì', @MonChinh,
 N'Bò kho mềm thơm, đậm đà với cà rốt, sả và nước cốt dừa.',
 N'Cắt thịt bò thành miếng vừa ăn||Ướp bò với sả và gia vị||Xào săn thịt bò||Thêm nước cốt dừa và hầm mềm||Cho cà rốt, khoai tây vào nấu chín',
 120, 5, 420, 4.90, 983, 'medium', N'images/bo-kho.png', N'🥘'),
(N'Cơm Chiên Dương Châu', @Com,
 N'Cơm chiên với trứng, tôm, lạp xưởng và rau củ đầy màu sắc.',
 N'Phi thơm tỏi, xào tôm và lạp xưởng||Cho trứng vào đảo đều||Thêm cơm nguội và đảo trên lửa lớn||Cho rau củ và gia vị||Đảo thêm vài phút rồi tắt bếp',
 25, 3, 350, 4.50, 1102, 'easy', N'images/com-chien-duong-chau.png', N'🍛');
GO

DECLARE @Pho INT = (SELECT RecipeID FROM dbo.Recipes WHERE Name = N'Phở Bò Hà Nội');
DECLARE @Goi INT = (SELECT RecipeID FROM dbo.Recipes WHERE Name = N'Gỏi Cuốn Tôm Thịt');
DECLARE @Chua INT = (SELECT RecipeID FROM dbo.Recipes WHERE Name = N'Canh Chua Cá Lóc');
DECLARE @GaNuong INT = (SELECT RecipeID FROM dbo.Recipes WHERE Name = N'Gà Nướng Mật Ong');
DECLARE @BoKho INT = (SELECT RecipeID FROM dbo.Recipes WHERE Name = N'Bò Kho Bánh Mì');
DECLARE @ComChien INT = (SELECT RecipeID FROM dbo.Recipes WHERE Name = N'Cơm Chiên Dương Châu');

INSERT INTO dbo.RecipeIngredients (RecipeID, IngredientID, Quantity)
SELECT @Pho, IngredientID, Quantity FROM (VALUES
(N'Xương bò', N'500g'), (N'Thịt bò', N'300g'), (N'Bánh phở', N'400g'),
(N'Gừng', N'1 củ'), (N'Hành tây', N'2 củ'), (N'Hoa hồi', N'3 cánh'),
(N'Quế', N'1 thanh'), (N'Rau thơm', N'100g')) v(Name, Quantity)
JOIN dbo.Ingredients i ON i.Name = v.Name;

INSERT INTO dbo.RecipeIngredients (RecipeID, IngredientID, Quantity)
SELECT @Goi, IngredientID, Quantity FROM (VALUES
(N'Tôm', N'200g'), (N'Thịt heo', N'150g'), (N'Bánh tráng', N'12 lá'),
(N'Bún tươi', N'200g'), (N'Xà lách', N'100g'), (N'Rau thơm', N'50g'), (N'Cà rốt', N'1 củ')) v(Name, Quantity)
JOIN dbo.Ingredients i ON i.Name = v.Name;

INSERT INTO dbo.RecipeIngredients (RecipeID, IngredientID, Quantity)
SELECT @Chua, IngredientID, Quantity FROM (VALUES
(N'Cá lóc', N'1 con'), (N'Me', N'100g'), (N'Dứa', N'1/2 quả'),
(N'Cà chua', N'2 quả'), (N'Giá đỗ', N'100g'), (N'Rau thơm', N'50g')) v(Name, Quantity)
JOIN dbo.Ingredients i ON i.Name = v.Name;

INSERT INTO dbo.RecipeIngredients (RecipeID, IngredientID, Quantity)
SELECT @GaNuong, IngredientID, Quantity FROM (VALUES
(N'Gà', N'1kg'), (N'Mật ong', N'3 thìa'), (N'Tỏi', N'4 tép'),
(N'Nước tương', N'3 thìa'), (N'Gừng', N'1 củ')) v(Name, Quantity)
JOIN dbo.Ingredients i ON i.Name = v.Name;

INSERT INTO dbo.RecipeIngredients (RecipeID, IngredientID, Quantity)
SELECT @BoKho, IngredientID, Quantity FROM (VALUES
(N'Thịt bò', N'800g'), (N'Cà rốt', N'2 củ'), (N'Sả', N'3 cây'),
(N'Nước cốt dừa', N'400ml'), (N'Khoai tây', N'2 củ'), (N'Hoa hồi', N'3 cánh')) v(Name, Quantity)
JOIN dbo.Ingredients i ON i.Name = v.Name;

INSERT INTO dbo.RecipeIngredients (RecipeID, IngredientID, Quantity)
SELECT @ComChien, IngredientID, Quantity FROM (VALUES
(N'Cơm nguội', N'3 bát'), (N'Trứng', N'2 quả'), (N'Tôm', N'100g'),
(N'Lạp xưởng', N'50g'), (N'Cà rốt', N'1 củ'), (N'Đậu Hà Lan', N'100g'), (N'Hành lá', N'30g'), (N'Tỏi', N'2 tép')) v(Name, Quantity)
JOIN dbo.Ingredients i ON i.Name = v.Name;
GO

INSERT INTO dbo.Users (Username, PasswordHash, FullName, Email, Role)
VALUES (N'admin', N'DEMO_ONLY_CHANGE_WHEN_BUILDING_REAL_AUTH', N'Quản trị viên ChefSmart', N'admin@chefsmart.local', N'admin');
GO

CREATE INDEX IX_Recipes_Category_Time ON dbo.Recipes(CategoryID, CookingTime) INCLUDE (Name, Rating, IsActive);
CREATE INDEX IX_Ingredients_Name ON dbo.Ingredients(Name);
CREATE INDEX IX_RecipeIngredients_Ingredient_Recipe ON dbo.RecipeIngredients(IngredientID, RecipeID);
GO

SELECT N'Khởi tạo ChefSmartDB thành công' AS Result;
GO
