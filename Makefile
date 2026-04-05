DC=docker compose

.PHONY: build up down restart logs ps deploy migrate collectstatic createsuperuser shell-web shell-bot

build:
	$(DC) build

up:
	$(DC) up -d

down:
	$(DC) down

restart:
	$(DC) restart

logs:
	$(DC) logs -f --tail=200 web bot nginx

ps:
	$(DC) ps

deploy:
	sh ./deploy.sh

migrate:
	$(DC) exec web python manage.py migrate --noinput

collectstatic:
	$(DC) exec web python manage.py collectstatic --noinput

createsuperuser:
	$(DC) exec web python manage.py createsuperuser

shell-web:
	$(DC) exec web sh

shell-bot:
	$(DC) exec bot sh
