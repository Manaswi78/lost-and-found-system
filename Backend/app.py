from flask import Flask, render_template
 
app = Flask(

    __name__,

    template_folder="../Frontend/templates",

    static_folder="../Frontend/static"

)
 
@app.route("/")

def home():

    return render_template("login.html")  # or "index.html"
 
if __name__ == "__main__":

    app.run(debug=True)