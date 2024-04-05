import psutil
import json
import asyncio
import time

import stat_module
import log_module
import report_module

from datetime import datetime
from fastapi import FastAPI, WebSocket, Form, Query, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

CPU_USAGE_CRITICAL = 100
GPU_USAGE_CRITICAL = 100
MEMORY_PRECENT_CRITICAL = 100

critic_mail = False
last_log_sent_time = 0

app = FastAPI()


app.mount('/static', StaticFiles(directory='public'))


@app.get('/')
def index():
	return FileResponse('public/index.html')
	

@app.get('/report')
async def report(request: Request, param: str = None):
	with open('./public/report.html', 'r') as file:
		report_html_content = file.read()
	report_html_content = report_html_content.replace('{{ param }}', param)
	return HTMLResponse(content=report_html_content)
	

@app.post('/get_report')
async def get_report(start_date: str = Form(...), end_date: str = Form(...), type_data: str = Form(...)):
	if type_data == 'memory':
		print(type_data)
		data = report_module.get_memory_report(start_date, end_date)
	elif type_data == 'gpu':
		data = report_module.get_gpu_report(start_date, end_date)
	elif type_data == 'cpu':
		data = report_module.get_cpu_report(start_date, end_date)
	return data
	
	
def check_state(server):
	global critic_mail
	global MEMORY_PRECENT_CRITICAL 
	global CPU_USAGE_CRITICAL
	global GPU_USAGE_CRITICAL

	if server['memory_stat']['percent'] > MEMORY_PRECENT_CRITICAL:
		log_module.send_email('Memory need your help...')
		log_module.process_log_to_database()
		critic_mail = True
	if server['cpu_stat']['cpu_load'] > CPU_USAGE_CRITICAL:
		log_module.send_email('CPU need your help...')
		log_module.process_log_to_database()
		critic_mail = True
	if server['gpu_stat']['gpu_load'] > GPU_USAGE_CRITICAL:
		log_module.send_email('GPU need your help...')
		log_module.process_log_to_database()
		critic_mail = True
        	
	
async def send_server_status(websocket: WebSocket):
	global last_log_sent_time
	global critic_mail
	
	while True:
		current_time = time.time()
		server_status = {
        		'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        		'cpu_stat': stat_module.get_cpu_stat(),
        		'temp': stat_module.get_temp(),
        		'memory_stat': stat_module.get_memory_stat(),
        		'gpu_stat': stat_module.get_gpu_load()
        	}
        	
		if critic_mail == False:
			check_state(server_status)
        
		if current_time - last_log_sent_time >= 60:
			last_log_sent_time = current_time
			log_module.state_log_to_database(server_status)
        
		await websocket.send_text(json.dumps(server_status))
		await asyncio.sleep(1)


@app.websocket('/server_status')
async def server_status(websocket: WebSocket):
    await websocket.accept()
    await send_server_status(websocket)
    
    
@app.post('/post/critic_memory')
async def post_critic_memory(memoryUsage: str = Form(...)):
	global MEMORY_PRECENT_CRITICAL
	try:
		MEMORY_PRECENT_CRITICAL = float(memoryUsage)
		print(MEMORY_PRECENT_CRITICAL)
		return {"message": f"Critic memory state set to {MEMORY_PERCENT_CRITICAL}%"}
	except ValueError:
		return {"error": "Invalid input. Please enter a valid number."}


@app.post('/post/critic_cpu')
async def post_critic_memory(cpuUsage: str = Form(...)):
	global CPU_USAGE_CRITICAL
	try:
		CPU_USAGE_CRITICAL = float(cpuUsage)
		return {"message": f"Critic cpu state set to {CPU_USAGE_CRITICAL}%"}
	except ValueError:
		return {"error": "Invalid input. Please enter a valid number."}
		
		
@app.post('/post/critic_gpu')
async def post_critic_memory(gpuUsage: str = Form(...)):
	global GPU_USAGE_CRITICAL
	try:
		GPU_USAGE_CRITICAL = float(gpuUsage)
		return {"message": f"Critic gpu state set to {GPU_USAGE_CRITICAL}%"}
	except ValueError:
		return {"error": "Invalid input. Please enter a valid number."}


	
	
