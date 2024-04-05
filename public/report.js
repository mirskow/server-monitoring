let chart = null;
let data = null;

let chartTemp = null;
let dataTemp = null;

function createChart(context, x, y, x_max) {
	console.log('usage chart');
	
	if (chart) {
        	chart.destroy();
	}
	
	data = {
		labels: x,
		datasets: [{
			label: 'Usage',
			data: y,
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		min: 0,
		max: x_max,
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let zoomOptions = {
		pan: {
			enabled: true,
			mode: 'x',
			onPanStart: () => {
				chart.stop();
			}
		},
		zoom: {
			mode: 'x',
			wheel: {
				enabled: true
			},
			onZoomStart: () => {
				chart.stop();
			}
		}
	}
	
	let config = {
		type: 'line',
		data: data,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			},
			plugins: {
				zoom: zoomOptions
			}
		}
	};
	
	chart = new Chart(context, config);
}


function createChartTemp(context, x, y, x_max) {
	console.log('temp chart');
	
	if (chartTemp) {
        	chartTemp.destroy();
	}
	
	dataTemp = {
		labels: x,
		datasets: [{
			label: 'Temp',
			data: y,
			pointStyle: false,
			fill: true,
			borderWidth: 1
		}]
	};
	
	let xScaleConfig = {
		min: 0,
		max: x_max,
		ticks: {
			autoSkip: true
		}
	}
	
	let yScaleConfig = {
		min: 0,
		max: 100
	}
	
	let zoomOptions = {
		pan: {
			enabled: true,
			mode: 'x',
			onPanStart: () => {
				chart.stop();
			}
		},
		zoom: {
			mode: 'x',
			wheel: {
				enabled: true
			},
			onZoomStart: () => {
				chart.stop();
			}
		}
	}
	
	let config = {
		type: 'line',
		data: dataTemp,
		options: {
			scales: {
				x: xScaleConfig,
				y: yScaleConfig
			},
			plugins: {
				zoom: zoomOptions
			}
		}
	};
	
	chartTemp = new Chart(context, config);
}


document.addEventListener('DOMContentLoaded', ()=>{
	function addLeadingZero(number) {
		return number < 10 ? '0' + number : number;
	}

	function getCurrentDateTime() {
		const now = new Date();
		const year = now.getFullYear();
		const month = addLeadingZero(now.getMonth() + 1);
		const day = addLeadingZero(now.getDate());
		const hours = addLeadingZero(now.getHours());
		const minutes = addLeadingZero(now.getMinutes());
		const seconds = addLeadingZero(now.getSeconds());
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	const serverTimeElement = document.getElementById('server_time');

	setInterval(() => {
		const currentDateTime = getCurrentDateTime();
		serverTimeElement.textContent = currentDateTime;
	}, 1000);



	let type_data = document.getElementById('reportTitle').innerText.toLowerCase();
	console.log(type_data);
	
	var currentDate = new Date().toISOString().slice(0, 10);
	document.getElementById('start_date').value = currentDate;
	document.getElementById('end_date').value = currentDate;
        
	document.querySelector('form').addEventListener('submit', function(event) {
		event.preventDefault(); 

		var interval = document.getElementById('interval').value;
		var startDate = document.getElementById('start_date').value;
		var endDate = document.getElementById('end_date').value;
		
		var formData = new FormData();
		formData.append('start_date', startDate);
		formData.append('end_date', endDate);
		formData.append('type_data', type_data);
		
		console.log(formData);
		
		fetch('/get_report', {
		    method: 'POST',
		    body: formData
		})
		.then(response => response.json())
		.then(data => {
			x_max = 0
			if(interval === '1_min'){
				x_max = 10;
			}
			else if(interval === '1_hour'){
				x_max = 100;
			}
			else if(interval === '1_day'){
				x_max = 1000;
			}
			x = []
			y = []
			y_temp = []
			
			data.forEach(elem => {
			    let date = new Date(elem.timestamp);
			    let time = date.getHours() + ':' + date.getMinutes();
			    
			    x.push(time);
			    
			    if (type_data == "gpu") {
			    	y.push(elem.gpu_load);
			    	y_temp.push(elem.temp);
			    }
			    else if (type_data == "cpu") {
			    	y.push(elem.cpu_load);
			    	y_temp.push(elem.temp);
			    }
			    else if (type_data == "memory") {
			    	y.push(elem.memory_load);
			    }
			    
			});
			
			let canvas = document.getElementById('reportChart');
			let context = canvas.getContext('2d');
			createChart(context, x, y, x_max);
			
			if (type_data != "memory") {
				console.log('+ graph');
				let canvas_t = document.getElementById('reportTemp');
				let context_t = canvas_t.getContext('2d');
				createChartTemp(context_t, x, y_temp, x_max);
			}
		})
		.catch(error => {
		    console.error('Error:', error);
		});
	});
});
