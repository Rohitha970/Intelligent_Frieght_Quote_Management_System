from django.shortcuts import render

# Create your views here.
from common.db import db

shipments_collection = db["shipments"]
