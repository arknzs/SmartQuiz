include ./.env

default:
	make build
	make up
	make initdb
	make mkuser

initdb:
	docker exec ${APP_NAME}-app ./manage.py migrate

makem:
	docker exec ${APP_NAME}-app ./manage.py makemigrations

mkuser:
	docker exec -it ${APP_NAME}-app ./manage.py createsuperuser

static:
	docker exec ${APP_NAME}-app ./manage.py collectstatic --noinput

build:
	docker compose build

up:
	docker compose up -d

update:
	git fetch --all
	git reset --hard origin/master
	docker compose build app
	docker compose up -d