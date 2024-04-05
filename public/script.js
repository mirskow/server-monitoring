let chartCPU = null;
let chartCPUTemp = null;

let dataCPU = null;
let dataCPUTemp = null;

let chartGPU = null;
let chartGPUTemp = null;

let dataGPU = null;
let dataGPUTemp = null;

let chartMemory = null;
let dataMemory = null;

function createChartCpuUsage(context) {
	dataCPU = {
		labels: [],
		datasets: [{
			label: 'CPU Usage',
			data: [],
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let config = {
		type: 'line',
		data: dataCPU,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			}
		}
	};
	
	chartCPU = new Chart(context, config);
}


function createChartGpuUsage(context) {
	dataGPU = {
		labels: [],
		datasets: [{
			label: 'GPU Usage',
			data: [],
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let config = {
		type: 'line',
		data: dataGPU,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			}
		}
	};
	
	chartGPU = new Chart(context, config);
}

function createChartCpuTemp(context) {
	dataCPUTemp = {
		labels: [],
		datasets: [{
			label: 'CPU Temp',
			data: [],
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let config = {
		type: 'line',
		data: dataCPUTemp,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			}
		}
	};
	
	chartCPUTemp = new Chart(context, config);
}

function createChartGpuTemp(context) {
	dataGPUTemp = {
		labels: [],
		datasets: [{
			label: 'GPU Temp',
			data: [],
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let config = {
		type: 'line',
		data: dataGPUTemp,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			}
		}
	};
	
	chartGPUTemp = new Chart(context, config);
}

function createChartMemory(context) {
	dataMemory = {
		labels: [],
		datasets: [{
			label: 'Memory used, %',
			data: [],
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let config = {
		type: 'line',
		data: dataMemory,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			}
		}
	};
	
	chartMemory = new Chart(context, config);
}

function updateChart(x, y, chart){
	if (chart.config.data.labels.length >= 10) {
	    chart.config.data.labels.shift();
	    chart.config.data.datasets[0].data.shift();
	}
	var dateTime = new Date(y);
	var timeString = dateTime.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});

	chart.config.data.labels.push(timeString);
	chart.config.data.datasets[0].data.push(x);
			
	chart.update();
}

function updateMemoryStat(memory_stat){
	document.getElementById('memory_total').innerHTML = `Total: ${(memory_stat.total / (1000 * 1000)).toFixed(2)} МБ`;
	document.getElementById('memory_available').innerHTML = `Available: ${(memory_stat.available / (1000 * 1000)).toFixed(2)} МБ`;
	document.getElementById('memory_used').innerHTML = `Used: ${(memory_stat.used / (1000 * 1000)).toFixed(2)} МБ`;
}


document.addEventListener('DOMContentLoaded', ()=>{
	let canvas_cpu = document.getElementById('cpu_usage');
	let context_cpu = canvas_cpu.getContext('2d');
	createChartCpuUsage(context_cpu);
	
	let canvas_cpu_temp = document.getElementById('cpu_temp');
	let context_cpu_temp = canvas_cpu_temp.getContext('2d');
	createChartCpuTemp(context_cpu_temp);
	
	let canvas_gpu = document.getElementById('gpu_usage');
	let context_gpu = canvas_gpu.getContext('2d');
	createChartGpuUsage(context_gpu);
	
	let canvas_gpu_temp = document.getElementById('gpu_temp');
	let context_gpu_temp = canvas_gpu_temp.getContext('2d');
	createChartGpuTemp(context_gpu_temp);
	
	let canvas_mem = document.getElementById('mem');
	let context_mem = canvas_mem.getContext('2d');
	createChartMemory(context_mem);
	
	const socket = new WebSocket('ws://localhost:8000/server_status');
	socket.onmessage = function(event) {
	    const serverStatus = JSON.parse(event.data);
	    
	    updateChart(serverStatus.cpu_stat.cpu_load, serverStatus.time, chartCPU);
	    updateChart(serverStatus.gpu_stat.gpu_load, serverStatus.time, chartGPU);
	    updateChart(serverStatus.temp.cpu_temp, serverStatus.time, chartCPUTemp);
	    updateChart(serverStatus.temp.gpu_temp, serverStatus.time, chartGPUTemp);
	    updateChart(serverStatus.memory_stat.percent, serverStatus.time, chartMemory);
	    
	    updateMemoryStat(serverStatus.memory_stat);
	    document.getElementById('server_time').innerHTML = `${serverStatus.time}`;
	    document.getElementById('processes').innerHTML = `Processes: ${serverStatus.cpu_stat.count_process}`;
	    document.getElementById('threads').innerHTML = `Threads: ${serverStatus.cpu_stat.count_threads}`;
	};
	
	
	
	document.getElementById('butMem').addEventListener('click', (e) => {
		e.preventDefault();
		var memoryUsage = document.getElementById('memoryUsage').value;
		var formData = new FormData();
		formData.append('memoryUsage', memoryUsage);
		
		fetch('/post/critic_memory', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			alert('Critical data success sent...');
		})
		.catch(error => {
			console.error('Error:', error);
		});
	});
	
	document.getElementById('butCpu').addEventListener('click', (e) => {
		e.preventDefault();
		var cpuUsage = document.getElementById('cpuUsage').value;
		var formData = new FormData();
		formData.append('cpuUsage', cpuUsage);
		
		fetch('/post/critic_cpu', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			alert('Critical data success sent...');
		})
		.catch(error => {
			console.error('Error:', error);
		});
	});
	
	document.getElementById('butGpu').addEventListener('click', (e) => {
		e.preventDefault();
		var gpuUsage = document.getElementById('gpuUsage').value;
		var formData = new FormData();
		formData.append('gpuUsage', gpuUsage);
		
		fetch('/post/critic_gpu', {
			method: 'POST',
			body: formData
		})
		.then(response => response.json())
		.then(data => {
			console.log(data);
			alert('Critical data success sent...');
		})
		.catch(error => {
			console.error('Error:', error);
		});
	});	
	
	
	document.getElementById('reportMem').addEventListener('click', () => {
		let value = document.getElementById('reportMem').dataset.value;
		window.location.href = `/report?param=${value}`;
	});
	
	document.getElementById('reportCpu').addEventListener('click', () => {
		let value = document.getElementById('reportCpu').dataset.value;
		window.location.href = `/report?param=${value}`;
	});
	
	document.getElementById('reportGpu').addEventListener('click', () => {
		let value = document.getElementById('reportGpu').dataset.value;
		window.location.href = `/report?param=${value}`;
	});
});



