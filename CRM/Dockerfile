# 1. Use an official Python runtime as a parent image
FROM python:3.12-slim

# 2. Set environment variables
# Prevents Python from writing pyc files to disc
ENV PYTHONDONTWRITEBYTECODE 1
# Prevents Python from buffering stdout and stderr
ENV PYTHONUNBUFFERED 1

# 3. Set work directory in the container
WORKDIR /app

# 4. Install system dependencies for pandas and psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of your application code
COPY . /app/

# 7. Collect static files for Nginx
# This uses the STATIC_ROOT we set up in settings.py
RUN python manage.py collectstatic --noinput

# 8. Expose the port Gunicorn will run on
EXPOSE 8000

# 9. Start the application using Gunicorn
# "CRM.wsgi:application" matches your WSGI_APPLICATION setting
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "CRM.wsgi:application"]