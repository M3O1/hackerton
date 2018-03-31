from flask import Flask, render_template, jsonify, request
from datetime import datetime
import numpy as np
import json
import sys, os
import multiprocessing

app = Flask(__name__,static_url_path="" ,static_folder="./dist", template_folder="./templates")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/single_point")
def get_single_point():
    lat = request.args.get('lat', default=1.,type=float)
    lng = request.args.get('lng', default=1.,type=float)

    data = recommand_pos(lat, lng)[0]
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

    #data = [{'lat':40.71,"lng":-74.03},{'lat':40.69,"lng":-74.04},{'lat':40.69,"lng":-74.02}]
    data = recommand_pos(lat, lng,num_spot=3)
    response = app.response_class(
            response=json.dumps(data),
            status=200,
            mimetype='application/json'
            )
    return response

def _get_max_min(array):
    array=np.asarray(array).astype(np.float32)
    max_=np.max(array)
    min_=np.min(array)
    return max_ , min_

def _get_grid(min_ , max_ , range):
    min_=np.floor(min_*100)
    max_=np.ceil(max_*100)
    return np.arange(min_ , max_+2,range)/100.

def _coord2grid(lati_grid , longi_grid, lati , longi):
    lati , longi =map( lambda ele:  np.round(float(ele)*100) , [lati , longi])
    longi=longi/100.
    lati=lati/100.
    try:
        lati_index=list(lati_grid).index(lati)
        longi_index=list(longi_grid).index(longi)
    except Exception as e:
        lati_index=None
        longi_index=None
    return lati_index, longi_index

def recommand_pos(lati, longi, radius=2 , num_spot=2 , matrix_path='./mat_fee_1.npy'):
    hour = datetime.now().hour
    matrix=np.load(matrix_path)

    manual_min_lati , manual_max_lati =40.701628 ,40.872022
    manual_min_longi , manual_max_longi =-74.020329 ,-73.909093
    lati_grid=_get_grid( manual_min_lati,manual_max_lati ,1)
    longi_grid=_get_grid(manual_min_longi,manual_max_longi ,1)

    lati_index , longi_index=_coord2grid(lati_grid ,longi_grid , lati , longi)
    if lati_index is None or longi_index is  None:
        raise AssertionError

    lati_index_down = lati_index -radius
    lati_index_up = lati_index +radius+1
    longi_index_down = longi_index -radius
    longi_index_up = longi_index +radius+1

    if lati_index_down < 0:
        lati_index_down =0
    if lati_index_up >= len(lati_grid):
        lati_index_up = len(lati_grid)-1

    if longi_index_down < 0:
        longi_index_down =0
    if longi_index_up >= len(longi_grid):
        longi_index_up = len(longi_grid)-1
    cropped_mat=matrix[lati_index_down : lati_index_up, longi_index_down : longi_index_up+1  , hour]
    max_list=np.argmax(cropped_mat ,axis=1)

    max_value=0
    max_values={}
    ret_longi=0
    ret_lati=0

    for best_lati,best_longi in enumerate(max_list):
        ret_longi=0
        ret_lati=0
        if max_value  < cropped_mat[ best_lati,best_longi]:
            max_value = cropped_mat[best_lati,best_longi]
            ret_lati = best_lati+lati_index_down
            ret_longi = best_longi+longi_index_down
            if not  max_value in max_values.keys():
                max_values[max_value] = {"lat":lati_grid[ret_lati] ,"lng":longi_grid[ret_longi]}
            else:
                max_values[max_value].append({"lat":lati_grid[ret_lati] ,"lng":longi_grid[ret_longi]})
    tmp_list=max_values.keys()
    ret_dict=[]
    for key in reversed(sorted(tmp_list)):
        ret_dict.append(max_values[key])

    return ret_dict


if __name__ == "__main__":
    app.run()
