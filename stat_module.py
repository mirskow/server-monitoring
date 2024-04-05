import psutil
import json


def get_temp():
	sensor_data = psutil.sensors_temperatures()
	temperatures = {}
	
	for sensor, readings in sensor_data.items():
		if sensor == "k10temp":
			for reading in readings:
				temperatures['cpu_temp'] = reading.current
				break
		elif sensor == "amdgpu":
			for reading in readings:
				temperatures['gpu_temp'] = reading.current
				break
	return temperatures
	
	
def get_memory_stat():
	memory_info = psutil.virtual_memory()
	
	memory_dict = {
	    "total": memory_info.total,
	    "available": memory_info.available,
	    "percent": memory_info.percent,
	    "used": memory_info.used,
	    "free": memory_info.free,
	    "active": memory_info.active,
	    "inactive": memory_info.inactive,
	    "buffers": memory_info.buffers,
	    "cached": memory_info.cached,
	    "shared": memory_info.shared,
	    "slab": memory_info.slab
	}
	
	return memory_dict


def get_gpu_load():
    try:
        with open('/sys/class/drm/card0/device/gpu_busy_percent', 'r') as f:
            gpu_load = int(f.read().strip())
        return {'gpu_load': gpu_load}
    except Exception as e:
        print("Error:", str(e))
        return None
        
        
def get_cpu_stat():
	cpu_stat = {}
	cpu_stat['cpu_load'] = psutil.cpu_percent()
	
	total_threads = 0
	for proc in psutil.process_iter():
		try:
			total_threads += proc.num_threads()
		except psutil.NoSuchProcess:
			pass
		
	cpu_stat['count_process'] = sum(1 for _ in psutil.process_iter())
	cpu_stat['count_threads'] = total_threads
	
	return cpu_stat


