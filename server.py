from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__,static_url_path="" ,static_folder="./dist", template_folder="./templates")

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/single_point")
def get_single_point():
    lat = request.args.get('lat', default=1.,type=float)
    lng = request.args.get('lng', default=1.,type=float)
    print(lat, lng)
    data = {'lat':40.7,"lng":-74.03}
    response = app.response_class(
            response=json.dumps(data),
            status=200,
            mimetype='application/json'
            )
    return response

@app.route("/multi_point")
def get_multi_point():
    lat = request.args.get('lat', default=1.,type=float)
    lng = request.args.get('lng', default=1.,type=float)

    data = [{'lat':40.7,"lng":-74.03},{'lat':40.4,"lng":-74.53},{'lat':40.65,"lng":-73.53}]
    response = app.response_class(
            response=json.dumps(data),
            status=200,
            mimetype='application/json'
            )
    return response



if __name__ == "__main__":
    app.run()
