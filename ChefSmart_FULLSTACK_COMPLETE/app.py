from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import pyodbc
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def connection_string() -> str:
    driver = os.getenv("DB_DRIVER", "ODBC Driver 18 for SQL Server")
    server = os.getenv("DB_SERVER", r"localhost\SQLEXPRESS")
    database = os.getenv("DB_DATABASE", "ChefSmartDB")
    trusted = env_bool("DB_TRUSTED_CONNECTION", True)
    encrypt = os.getenv("DB_ENCRYPT", "no")
    trust_cert = os.getenv("DB_TRUST_SERVER_CERTIFICATE", "yes")

    parts = [
        f"DRIVER={{{driver}}}",
        f"SERVER={server}",
        f"DATABASE={database}",
        f"Encrypt={encrypt}",
        f"TrustServerCertificate={trust_cert}",
    ]

    if trusted:
        parts.append("Trusted_Connection=yes")
    else:
        username = os.getenv("DB_USERNAME", "sa")
        password = os.getenv("DB_PASSWORD", "")
        parts.extend([f"UID={username}", f"PWD={password}"])

    return ";".join(parts) + ";"


def get_connection() -> pyodbc.Connection:
    return pyodbc.connect(connection_string(), timeout=8)


def clean_html(value: str | None) -> str:
    if not value:
        return ""
    text = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", text).strip()


def row_to_dict(cursor: pyodbc.Cursor, row: pyodbc.Row) -> dict[str, Any]:
    columns = [column[0] for column in cursor.description]
    return dict(zip(columns, row))


def load_recipe_details(conn: pyodbc.Connection, recipe: dict[str, Any]) -> dict[str, Any]:
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT i.Name, ri.Quantity
        FROM RecipeIngredients ri
        INNER JOIN Ingredients i ON i.IngredientID = ri.IngredientID
        WHERE ri.RecipeID = ?
        ORDER BY ri.RecipeIngredientID
        """,
        recipe["id"],
    )
    recipe["ingredients"] = [
        f"{row.Quantity} {row.Name}".strip() if row.Quantity else row.Name
        for row in cursor.fetchall()
    ]
    recipe["steps"] = [
        step.strip()
        for step in (recipe.pop("instructions", "") or "").split("||")
        if step.strip()
    ]
    return recipe


def get_recipes_from_db(
    *, category: str | None = None, max_time: int | None = None, ingredient: str | None = None
) -> list[dict[str, Any]]:
    where = ["r.IsActive = 1"]
    params: list[Any] = []

    if category:
        where.append("c.Name COLLATE Vietnamese_CI_AI = ? COLLATE Vietnamese_CI_AI")
        params.append(category)
    if max_time is not None:
        where.append("r.CookingTime <= ?")
        params.append(max_time)
    if ingredient:
        where.append(
            """EXISTS (
                SELECT 1
                FROM RecipeIngredients rix
                INNER JOIN Ingredients ix ON ix.IngredientID = rix.IngredientID
                WHERE rix.RecipeID = r.RecipeID
                  AND ix.Name COLLATE Vietnamese_CI_AI LIKE '%' + ? + '%' COLLATE Vietnamese_CI_AI
            )"""
        )
        params.append(ingredient)

    sql = f"""
        SELECT
            r.RecipeID AS id,
            r.Name AS title,
            c.Name AS cat,
            r.Description AS [desc],
            r.Instructions AS instructions,
            r.CookingTime AS timeMinutes,
            r.Servings AS servings,
            r.Calories AS cal,
            CAST(r.Rating AS FLOAT) AS rating,
            r.ReviewCount AS reviews,
            r.Difficulty AS diff,
            r.ImagePath AS img,
            r.Emoji AS emoji
        FROM Recipes r
        INNER JOIN Categories c ON c.CategoryID = r.CategoryID
        WHERE {' AND '.join(where)}
        ORDER BY r.Rating DESC, r.ReviewCount DESC, r.Name
    """

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(sql, params)
        result = []
        for row in cursor.fetchall():
            recipe = row_to_dict(cursor, row)
            result.append(load_recipe_details(conn, recipe))
        return result


def spoonacular_key() -> str:
    return os.getenv("SPOONACULAR_API_KEY", "").strip()


def spoonacular_request(endpoint: str, params: dict[str, Any]) -> dict[str, Any]:
    key = spoonacular_key()
    if not key:
        raise RuntimeError("Chưa cấu hình SPOONACULAR_API_KEY trong file .env")

    params = {**params, "apiKey": key}
    response = requests.get(
        f"https://api.spoonacular.com{endpoint}",
        params=params,
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def parse_spoonacular_recipe(item: dict[str, Any]) -> dict[str, Any]:
    calories = None
    nutrients = (item.get("nutrition") or {}).get("nutrients") or []
    for nutrient in nutrients:
        if str(nutrient.get("name", "")).lower() == "calories":
            calories = round(float(nutrient.get("amount", 0)))
            break

    return {
        "id": item.get("id"),
        "title": item.get("title", "Công thức quốc tế"),
        "img": item.get("image", ""),
        "desc": clean_html(item.get("summary"))[:220],
        "time": item.get("readyInMinutes"),
        "servings": item.get("servings"),
        "cal": calories,
        "cuisine": ", ".join(item.get("cuisines") or []) or "Quốc tế",
        "sourceUrl": item.get("sourceUrl") or item.get("spoonacularSourceUrl"),
        "spoonacular": True,
    }


@app.get("/")
def index_file():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/index.html")
def index_alias():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/dashboard.html")
def dashboard_file():
    return send_from_directory(BASE_DIR, "dashboard.html")


@app.get("/style.css")
def style_file():
    return send_from_directory(BASE_DIR, "style.css")


@app.get("/script.js")
def script_file():
    return send_from_directory(BASE_DIR, "script.js")


@app.get("/images/<path:filename>")
def images(filename: str):
    return send_from_directory(BASE_DIR / "images", filename)


@app.get("/api/health")
def health():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT DB_NAME() AS DatabaseName, @@SERVERNAME AS ServerName")
            row = cursor.fetchone()
        return jsonify(
            {
                "ok": True,
                "database": row.DatabaseName,
                "server": row.ServerName,
                "spoonacularConfigured": bool(spoonacular_key()),
            }
        )
    except Exception as exc:  # noqa: BLE001
        return jsonify({"ok": False, "error": str(exc)}), 503


@app.get("/api/recipes")
def list_recipes():
    category = request.args.get("category") or None
    ingredient = request.args.get("ingredient") or None
    max_time_raw = request.args.get("max_time")
    try:
        max_time = int(max_time_raw) if max_time_raw else None
        return jsonify(get_recipes_from_db(category=category, max_time=max_time, ingredient=ingredient))
    except ValueError:
        return jsonify({"error": "max_time phải là số nguyên"}), 400
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": "Không thể đọc dữ liệu SQL Server", "detail": str(exc)}), 503


@app.get("/api/recipes/<int:recipe_id>")
def recipe_detail(recipe_id: int):
    try:
        recipes = get_recipes_from_db()
        recipe = next((item for item in recipes if item["id"] == recipe_id), None)
        if recipe is None:
            return jsonify({"error": "Không tìm thấy công thức"}), 404
        return jsonify(recipe)
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": "Không thể đọc dữ liệu SQL Server", "detail": str(exc)}), 503


@app.post("/api/fridge")
def fridge_search():
    body = request.get_json(silent=True) or {}
    ingredients = body.get("ingredients") or []
    max_time = body.get("maxTime")

    if not isinstance(ingredients, list):
        return jsonify({"error": "ingredients phải là một mảng"}), 400

    cleaned = [str(item).strip() for item in ingredients if str(item).strip()]
    if not cleaned:
        return jsonify({"error": "Hãy nhập ít nhất một nguyên liệu"}), 400

    ingredient_csv = ",".join(cleaned)
    params: list[Any] = [ingredient_csv]
    time_filter = ""
    if max_time not in (None, ""):
        try:
            max_time_int = int(max_time)
        except (TypeError, ValueError):
            return jsonify({"error": "maxTime phải là số nguyên"}), 400
        time_filter = "AND r.CookingTime <= ?"
        params.append(max_time_int)

    sql = f"""
        WITH UserIngredients AS (
            SELECT DISTINCT
                LOWER(LTRIM(RTRIM(value))) COLLATE Vietnamese_CI_AI AS IngredientName
            FROM STRING_SPLIT(CAST(? AS NVARCHAR(MAX)), ',')
            WHERE LTRIM(RTRIM(value)) <> ''
        ),
        RecipeIngredientMatch AS (
            SELECT
                r.RecipeID,
                ri.IngredientID,
                CASE
                    WHEN COUNT(ui.IngredientName) > 0 THEN 1
                    ELSE 0
                END AS IsMatched
            FROM Recipes r
            INNER JOIN RecipeIngredients ri
                ON ri.RecipeID = r.RecipeID
            INNER JOIN Ingredients i
                ON i.IngredientID = ri.IngredientID
            LEFT JOIN UserIngredients ui
                ON LOWER(i.Name) COLLATE Vietnamese_CI_AI
                       LIKE N'%' + ui.IngredientName + N'%'
                OR ui.IngredientName
                       LIKE N'%' + LOWER(i.Name) COLLATE Vietnamese_CI_AI + N'%'
            WHERE r.IsActive = 1
              {time_filter}
            GROUP BY
                r.RecipeID,
                ri.IngredientID
        ),
        RecipeMatch AS (
            SELECT
                r.RecipeID AS id,
                r.Name AS title,
                c.Name AS cat,
                r.Description AS [desc],
                r.Instructions AS instructions,
                r.CookingTime AS timeMinutes,
                r.Servings AS servings,
                r.Calories AS cal,
                CAST(r.Rating AS FLOAT) AS rating,
                r.ReviewCount AS reviews,
                r.Difficulty AS diff,
                r.ImagePath AS img,
                r.Emoji AS emoji,
                COUNT(rim.IngredientID) AS totalIngredients,
                SUM(rim.IsMatched) AS matchedIngredients
            FROM Recipes r
            INNER JOIN Categories c
                ON c.CategoryID = r.CategoryID
            INNER JOIN RecipeIngredientMatch rim
                ON rim.RecipeID = r.RecipeID
            GROUP BY
                r.RecipeID,
                r.Name,
                c.Name,
                r.Description,
                r.Instructions,
                r.CookingTime,
                r.Servings,
                r.Calories,
                r.Rating,
                r.ReviewCount,
                r.Difficulty,
                r.ImagePath,
                r.Emoji
        )
        SELECT
            *,
            totalIngredients - matchedIngredients AS missingIngredients,
            CAST(
                matchedIngredients * 100.0 / NULLIF(totalIngredients, 0)
                AS DECIMAL(5, 1)
            ) AS matchPercent,
            CASE
                WHEN totalIngredients = matchedIngredients THEN CAST(1 AS BIT)
                ELSE CAST(0 AS BIT)
            END AS canCook
        FROM RecipeMatch
        WHERE matchedIngredients > 0
        ORDER BY
            CASE WHEN totalIngredients = matchedIngredients THEN 0 ELSE 1 END,
            CAST(
                matchedIngredients * 1.0 / NULLIF(totalIngredients, 0)
                AS DECIMAL(10, 4)
            ) DESC,
            matchedIngredients DESC,
            timeMinutes ASC;
    """

    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(sql, params)
            result = []
            for row in cursor.fetchall():
                recipe = row_to_dict(cursor, row)
                recipe["canCook"] = bool(recipe["canCook"])
                recipe["matchPercent"] = float(recipe["matchPercent"] or 0)
                result.append(load_recipe_details(conn, recipe))
        return jsonify({"inputIngredients": cleaned, "count": len(result), "recipes": result})
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": "Truy vấn Tủ lạnh có gì thất bại", "detail": str(exc)}), 503


@app.get("/api/international/random")
def international_random():
    number = min(max(request.args.get("number", default=4, type=int), 1), 12)
    try:
        data = spoonacular_request(
            "/recipes/random",
            {"number": number, "includeNutrition": "true"},
        )
        return jsonify([parse_spoonacular_recipe(item) for item in data.get("recipes", [])])
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503
    except requests.RequestException as exc:
        return jsonify({"error": "Spoonacular API không phản hồi", "detail": str(exc)}), 502


@app.get("/api/international/search")
def international_search():
    query = (request.args.get("q") or "").strip()
    if not query:
        return jsonify({"error": "Thiếu từ khóa q"}), 400
    number = min(max(request.args.get("number", default=8, type=int), 1), 12)
    try:
        data = spoonacular_request(
            "/recipes/complexSearch",
            {
                "query": query,
                "number": number,
                "addRecipeInformation": "true",
                "addRecipeNutrition": "true",
            },
        )
        return jsonify([parse_spoonacular_recipe(item) for item in data.get("results", [])])
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503
    except requests.RequestException as exc:
        return jsonify({"error": "Spoonacular API không phản hồi", "detail": str(exc)}), 502


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=env_bool("FLASK_DEBUG", True))
