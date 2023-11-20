# -----------------------------------------------------------
# initialization of database instances
# Firebase, Google Drive, SQLite
#
# (C) 2021-2024 Juan-Francisco Reyes, Cottbus, Germany
# Brandenburg University of Technology, Germany.
# Released under MIT License
# email pacoreyes.zwei@gmail.com
# -----------------------------------------------------------
from google.cloud import firestore


""" Initialize Firestore """
# Initialize Firestore database instance
firestore_db = firestore.Client.from_service_account_json('credentials/firebase_credentials.json')
