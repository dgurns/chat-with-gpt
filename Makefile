default: run

.PHONY: run
run:
	docker-compose up -d
	sleep 2
	open http://localhost:5009

.PHONY: stop
stop:
	docker-compose stop

.PHONY: down
down:
	docker-compose down