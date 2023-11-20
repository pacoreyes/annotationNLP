from db import firestore_db, firestore


def update_text(slots):
  """
  Update a text record in Firestore.

  Args:
  - slots (dict): Dictionary containing the updated text record attributes.

  Returns:
  - True (bool): Indicates a successful update.
  """
  text_ref = firestore_db.collection(u'texts2').document(slots["id"])
  for key, value in slots.items():
    if key == "dataset1_class" and value is not None:
      slots[key] = int(value)
    elif key == "dataset1_text" and value is not None:
      slots[key] = value  # a list
    elif key == "annotator" and value is not None:
      slots[key] = value
    elif key == "dataset1_class" and value is None:
      # remove attributes of a valid datapoint
      slots["annotator"] = firestore.DELETE_FIELD
      slots["dataset1_class"] = firestore.DELETE_FIELD

  text_ref.update(slots)
  return True


def retrieve_datapoint_for_dataset1(_id):
  """
  Retrieve a datapoint for dataset1.

  Args:
  - id (str): ID of the datapoint.

  Returns:
  - datapoint (dict): Dictionary containing the datapoint.
  """
  doc_ref = firestore_db.collection("texts2").document(_id)
  doc = doc_ref.get()
  rec = doc.to_dict()

  return rec


def retrieve_dataset_1(_team_id):
  """
  Retrieve the whole dataset1.
  Args:
    _team_id: Number of the team.

  Returns:

  """
  source_texts_ref = firestore_db.collection('texts2')
  # retrieve texts with "annotator" equal to "IE-team2" ordered by "dataset1_class"
  docs = source_texts_ref.where("annotator", "==", f"IE-{_team_id}").order_by("dataset1_class").stream()
  # docs = source_texts_ref.where("annotator", "==", f"IE-{_team_id}").stream()

  dataset1 = []

  recs = [doc.to_dict() for doc in docs]
  print(len(recs))

  for idx, rec in enumerate(recs):
    slots = {
      "id": rec["id"],
      "text": rec["dataset1_text"],
      "discourse_type": rec["dataset1_class"]
    }
    dataset1.append(slots)

  return dataset1
