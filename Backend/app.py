import os
import sqlite3
from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.utils import secure_filename

app = Flask(__name__,
            template_folder="../Frontend/templates",
            static_folder="../Frontend/static")

app.secret_key = "lostfound_secret"

UPLOAD_FOLDER = "../Frontend/static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


# ---------------- DATABASE ---------------- #
def init_db():
    conn = sqlite3.connect("lostfound.db")
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS lost_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        item_name TEXT,
        brand TEXT,
        color TEXT,
        description TEXT,
        image TEXT,
        hidden_detail TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS found_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        place TEXT,
        image TEXT
    )''')

    conn.commit()
    conn.close()

init_db()


# ---------------- LOGIN ---------------- #
@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        # Admin
        if username == "lostandfound" and password == "devops123":
            session["admin"] = True
            return redirect("/admin")

        # User (10-digit SAP ID)
        elif password.isdigit() and len(password) == 10:
            session["user"] = username
            return redirect("/user")

    return render_template("login.html")


# ---------------- USER DASHBOARD ---------------- #
@app.route("/user")
def user_dashboard():
    if "user" not in session:
        return redirect("/")
    return render_template("user_dashboard.html", user=session["user"])


# ---------------- REPORT LOST ITEM ---------------- #
@app.route("/report_lost", methods=["POST"])
def report_lost():
    if "user" not in session:
        return redirect("/")

    item = request.form["item"]
    brand = request.form["brand"]
    color = request.form["color"]
    desc = request.form["desc"]
    hidden = request.form["hidden"]

    image_file = request.files["image"]
    filename = secure_filename(image_file.filename)
    image_file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    conn = sqlite3.connect("lostfound.db")
    c = conn.cursor()
    c.execute("INSERT INTO lost_items (username,item_name,brand,color,description,image,hidden_detail) VALUES (?,?,?,?,?,?,?)",
              (session["user"], item, brand, color, desc, filename, hidden))
    conn.commit()
    conn.close()

    return redirect("/user")


# ---------------- FOUND ITEM ---------------- #
@app.route("/found_item", methods=["POST"])
def found_item():
    if "user" not in session:
        return redirect("/")

    place = request.form["place"]
    image_file = request.files["image"]
    filename = secure_filename(image_file.filename)
    image_file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    conn = sqlite3.connect("lostfound.db")
    c = conn.cursor()
    c.execute("INSERT INTO found_items (place,image) VALUES (?,?)", (place, filename))
    conn.commit()
    conn.close()

    return redirect("/user")


# ---------------- ADMIN DASHBOARD ---------------- #
@app.route("/admin")
def admin_dashboard():
    if "admin" not in session:
        return redirect("/")

    conn = sqlite3.connect("lostfound.db")
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM lost_items")
    lost = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM found_items")
    found = c.fetchone()[0]
    conn.close()

    return render_template("admin_dashboard.html", lost=lost, found=found)


# ---------------- LOGOUT ---------------- #
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")


if __name__ == "__main__":
    app.run(debug=True)
