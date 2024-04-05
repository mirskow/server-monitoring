import smtplib
from email.mime.text import MIMEText
import pymongo
import psutil
import datetime
from bson import ObjectId


def send_email(message):
	sender_email = "v.mir.207@gmail.com"
	receiver_email = "v.mir.207@gmail.com"
	password = "rlde wqiz meie usju "

	msg = MIMEText(message)
	msg['Subject'] = 'Server Alert'
	msg['From'] = sender_email
	msg['To'] = receiver_email

	server = smtplib.SMTP('smtp.gmail.com', 587)
	server.starttls()
	server.login(sender_email, password)
	server.sendmail(sender_email, receiver_email, msg.as_string())
	server.quit()
	

def process_log_to_database():
	client = pymongo.MongoClient('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.2')
	
	db = client['server_logs']
	collection_process = db['process_logs']
	
	for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
		process_data = {
			'pid': proc.info['pid'],
			'name': proc.info['name'],
			'username': proc.info['username'],
			'cpu_percent': proc.info['cpu_percent'],
			'memory_percent': proc.info['memory_percent'],
			'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
		}
		collection_process.insert_one(process_data)	
		
		
def state_log_to_database(server_status):
	client = pymongo.MongoClient('mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.2.2')
	
	db = client['server_logs']       
	collection_server_state = db['state_logs']
	server_status['_id'] = str(ObjectId())
	
	collection_server_state.insert_one(server_status)
    
	
