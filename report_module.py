from datetime import datetime
from pymongo import MongoClient

def get_cpu_report(start_datetime, end_datetime):
	client = MongoClient('mongodb://localhost:27017/')
	db = client['server_logs']
	collection = db['state_logs']

	query = {
		'time': {'$gte': start_datetime, '$lte': end_datetime}
	}

	cursor = collection.find(query).sort('time', 1) 

	cpu_load_data = []

	for document in cursor:
		cpu_load = document['cpu_stat']['cpu_load']
		timestamp = document['time']
		temp = document['temp']['cpu_temp']

		cpu_load_data.append({'timestamp': timestamp, 'cpu_load': cpu_load, 'temp': temp})

	return cpu_load_data
	
	
def get_memory_report(start_datetime, end_datetime):
	client = MongoClient('mongodb://localhost:27017/')
	db = client['server_logs']
	collection = db['state_logs']
	
	query = {
		'time': {'$gte': start_datetime + ' 00:00:00', '$lte': end_datetime + ' 23:59:59'}
	}

	cursor = collection.find(query).sort('time', 1) 

	memory_data = []

	for document in cursor:
		memory = document['memory_stat']['percent']
		timestamp = document['time']

		memory_data.append({'timestamp': timestamp, 'memory_load': memory})

	return memory_data
	
	
def get_gpu_report(start_datetime, end_datetime):
	client = MongoClient('mongodb://localhost:27017/')
	db = client['server_logs']
	collection = db['state_logs']

	query = {
		'time': {'$gte': start_datetime, '$lte': end_datetime}
	}

	cursor = collection.find(query).sort('time', 1)

	gpu_data = []

	for document in cursor:
		gpu = document['gpu_stat']['gpu_load']
		timestamp = document['time']
		temp = document['temp']['gpu_temp']
		
		gpu_data.append({'timestamp': timestamp, 'gpu_load': gpu, 'temp': temp})

	return gpu_data
	
