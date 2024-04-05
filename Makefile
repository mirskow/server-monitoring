IMAGE_NAME = my_server_monitoring_app

.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  build          - Собрать Docker образ"
	@echo "  run            - Запустить контейнер"
	@echo "  stop           - Остановить и удалить контейнер"
	@echo "  clean          - Удалить Docker образ"

build:
	sudo docker build -t $(IMAGE_NAME) .

run:
	sudo docker run -d -p 8000:8000 --name $(IMAGE_NAME) $(IMAGE_NAME)

stop:
	sudo docker stop $(IMAGE_NAME)
	sudo docker rm $(IMAGE_NAME)

clean:
	sudo docker rmi $(IMAGE_NAME)
	
