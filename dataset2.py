import random
from db import firestore_db, firestore


def retrieve_text(text_id):
  """
  Retrieve a specific text record from Firestore.

  Args:
  - text_id (str): ID of the text record to retrieve.

  Returns:
  - text_doc_dict (dict): Dictionary representing the retrieved text record.
  """
  text_ref = firestore_db.collection("texts2").document(text_id)
  text_doc = text_ref.get()
  text_doc_dict = text_doc.to_dict()
  return text_doc_dict


def count_passages():
  text_coll_ref = firestore_db.collection("passages")
  count_query = text_coll_ref.count()
  query_result = count_query.get()
  return query_result[0][0].value


def id_with_zeros(number):
  return str(number).zfill(10)


def retrieve_passage(passage_id, with_original_text_split=False):
  """
  Retrieve a specific text record from Firestore.

  Args:
  - text_id (str): ID of the text record to retrieve.

  Returns:
  - text_doc_dict (dict): Dictionary representing the retrieved text record.
  """
  passages_coll_ref = firestore_db.collection("passages")
  # Retrieve the passage record
  passage_ref = passages_coll_ref.document(passage_id)
  passage_doc = passage_ref.get()
  passage = passage_doc.to_dict()

  # Retrieve the original text split
  if with_original_text_split is False:
    return passage
  else:
    # Retrieve the original text split from the text record
    original_text = retrieve_text(passage["text_id"])
    original_text_split = original_text["text_split"]
    original_text_title = original_text["title"]
    passage["original_text_split"] = original_text_split
    passage["original_text_title"] = original_text_title
    return passage


def retrieve_random_passage():
  """Load one random passage."""
  passage_count = count_passages()  # Call this function only once
  max_attempts = 100  # Example limit for the number of iterations
  attempts = 0

  while attempts < max_attempts:
    random_number = random.randint(1, passage_count)
    passage_id = id_with_zeros(random_number)
    passage = retrieve_passage(passage_id, with_original_text_split=True)
    # Check for the desired condition and return the passage if met
    if not passage.get("is_accepted_dataset2_datapoint") and "https://transcripts.cnn.com" not in passage["url"]:
      return passage
    attempts += 1
  return None


def update_passage(slots):
  """
  Update a passage record in Firestore.

  Args:
  - slots (dict): Dictionary containing the updated passage record attributes.

  Returns:
  - True (bool): Indicates a successful update.
  """
  passage_ref = firestore_db.collection(u'passages').document(slots["id"])
  for key, value in slots.items():
    if value == "" or value == []:
      slots[key] = firestore.DELETE_FIELD
    elif key == "dataset2_datapoint":
      slots[key] = value  # a list
    elif key == "is_accepted_dataset2_datapoint":
      slots[key] = value  # a boolean
    elif key == "annotator":
      slots[key] = value  # a string
  passage_ref.update(slots)
  return True


def retrieve_dataset_2(_annotator_id=None):
  """
  Retrieve the whole dataset1.
  Args:
    _annotator_id: Number of the annotator.

  Returns:

  """
  source_passages_ref = firestore_db.collection('passages')
  dataset2 = []

  if _annotator_id is None:
    # retrieve texts ordered by "is_accepted_dataset2_datapoint"
    docs = (source_passages_ref
            .where("is_accepted_dataset2_datapoint", "==", True).stream())
    recs = [doc.to_dict() for doc in docs]
    for rec in recs:
      text = []
      for sent in rec["dataset2_datapoint"]:
        slots = {
          "role": sent["role"],
          "sentence": sent["sentence"]
        }
        text.append(slots)

      slots = {
        "id": rec["id"],
        "text": text,
        "metadata": {
          "text_id": rec["text_id"],
          "source": rec["url"],
          "annotator": rec["annotator"]
        },
      }
      if rec.get("publication-date"):
        slots["metadata"]["publication-date"] = rec["publication-date"]
      dataset2.append(slots)
  else:
    # retrieve texts with "annotator" equal to "IE-[_annotator_id]" ordered by "is_accepted_dataset2_datapoint"
    docs = (source_passages_ref.where("annotator", "==", f"IE-{_annotator_id}")
            .order_by("is_accepted_dataset2_datapoint").stream())
    recs = [doc.to_dict() for doc in docs]
    for rec in recs:
      slots = {
        "id": rec["id"],
        "is_accepted": rec["is_accepted_dataset2_datapoint"]
      }
      dataset2.append(slots)
  return dataset2
