default: run

.PHONY: run
run:
	docker-compose up -d
	sleep 1
	open http://localhost:5009
