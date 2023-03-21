default: run

.PHONY: run
run:
	docker-compose up -d
	open http://localhost:5009
