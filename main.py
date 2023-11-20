# -----------------------------------------------------------
# corpusManager - Annotation Tools for NLP App
#
# (C) 2021-2024 Juan-Francisco Reyes, Cottbus, Germany
# Brandenburg University of Technology, Germany.
# Released under MIT License
# email pacoreyes.zwei@gmail.com
# -----------------------------------------------------------

import os

from flask import Flask
from flask import render_template, jsonify, request
from flask_httpauth import HTTPBasicAuth

from dataset1 import update_text, retrieve_datapoint_for_dataset1, retrieve_dataset_1
from dataset2 import retrieve_passage, update_passage, retrieve_random_passage, retrieve_dataset_2

# Initialize Flask app
app = Flask(__name__,
            template_folder="templates",
            static_folder="static")

# Initialize HTTP Basic Authentication
auth = HTTPBasicAuth()

# Authentication data
USER_DATA = {
  "username": "nlp4ie",
  "password": "ie2023/24BTU"
}


# View templates and routing
@app.route("/")
@auth.login_required
def index():
  return render_template("index.html")


@app.route('/dataset1')
def display_dataset1():
  return render_template('dataset1/index.html')


@app.route('/dataset1/edit')
def dataset1_edit():
  """
  Route for displaying the text viewer.

  Returns:
  - rendered template (HTML): Text viewer template.
  """
  return render_template('dataset1/edit.html')


@app.route('/api/dataset1_xyz/', methods=['PUT'])  # commented
def dataset1_api():
  if request.method == 'PUT':
    slots = request.get_json()
    response = update_text(slots)
    # response = {"msg": "OK"}
    return jsonify(response)


@app.route('/api/dataset1/edit/<qid>')
def edit_dataset1_api(qid):
  """
  API endpoint for retrieving dataset1 overview data.

  Returns:
  - dataset_overview (json): JSON response containing the dataset1 overview data.
  """
  datapoint = retrieve_datapoint_for_dataset1(qid)
  return jsonify(datapoint)


@app.route('/api/dataset1/download/<team_id>')
def download_dataset1_api(team_id):
  """
  API endpoint for retrieving dataset1.
  Args:
    team_id: Number of the team.

  Returns:
    dataset1 (json): JSON response containing the dataset1.
  """
  dataset1 = retrieve_dataset_1(team_id)
  return jsonify(dataset1)


"""-----------------------------------------------------------
Dataset 2
-----------------------------------------------------------"""


@app.route('/dataset2/edit')
@app.route('/dataset2/edit?<passage_id>')
def edit_dataset2_api(passage_id=None):
  """
  Route for annotating dataset 3.

  Returns:
  - rendered template (HTML): Passage annotator tool template.
  """
  if passage_id is not None:
    return render_template('dataset2/edit.html', passage_id=passage_id)
  else:
    return render_template('dataset2/edit.html')


@app.route("/api/dataset2", methods=['GET'])
@app.route('/api/dataset2/<passage_id>', methods=['PUT'])
def dataset2_api(passage_id=None):
  if request.method == 'GET':
    # Check if random is present in the URL, "api/passages?random=True"
    if request.args.get('random'):
      # This corresponds to 'GET /api/passages?random'
      passage = retrieve_random_passage()
    else:
      # This corresponds to 'GET /api/passages?passage_id=<passage_id>'
      passage_id = request.args.get('passage_id')
      passage = retrieve_passage(passage_id, with_original_text_split=True)
    return jsonify(passage)
  elif request.method == 'PUT':
    # This corresponds to 'PUT /api/passages/<passage_id>
    slots = request.get_json()
    response = update_passage(slots)
    return jsonify(response)


@app.route('/api/dataset2/download/<team_id>')
def download_dataset2_api(team_id):
  """
  API endpoint for retrieving dataset1.
  Args:
    team_id: Number of the team.

  Returns:
    dataset1 (json): JSON response containing the dataset1.
  """
  dataset2 = retrieve_dataset_2(team_id)
  return jsonify(dataset2)


@app.route('/about')
def about():
  """
  Route for displaying the about page.

  Returns:
  - rendered template (HTML): About page template.
  """
  return render_template('about.html')


@app.errorhandler(404)
def page_not_found(error):
  """
  Route for handling 404 error page.

  Returns:
  - rendered template (HTML): 404 error page template.
  """
  print(error)
  return render_template("404.html"), 404


@auth.verify_password
def verify(username, password):
  if not (username and password):
    return False
  return USER_DATA.get("username") == username and USER_DATA.get("password") == password


# Start the app
if __name__ == "__main__":
  port = int(os.environ.get('PORT', 8080))
  app.run(debug=True, host='0.0.0.0', port=port)

# To run the app in development mode, use the following commands:

"""On Unix/Mac"""
# export FLASK_APP=main.py
# export FLASK_ENV=development
# export FLASK_DEBUG=True
# flask run --host=0.0.0.0 --port=5001

"""On Windows Powershell"""
# export FLASK_APP=main.py
# flask run --host=0.0.0.0 --port=5001
