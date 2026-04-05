FROM python:3.12.3

# Оставляем только нужные переменные среды
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_PATH=/app

ENV TZ=Europe/Moscow
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Устанавливаем uv
#COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
RUN pip install uv
WORKDIR $APP_PATH

# Копируем файлы конфигурации зависимостей
COPY pyproject.toml uv.lock $APP_PATH/

# Устанавливаем зависимости
RUN uv pip install --system -r pyproject.toml

# Копируем ВЕСЬ код из текущей директории в контейнер (так как папки src у вас нет)
COPY . $APP_PATH/

# Делаем скрипт исполняемым
RUN chmod +x $APP_PATH/entrypoint.sh

# Запускаем скрипт
ENTRYPOINT ["/app/entrypoint.sh"]