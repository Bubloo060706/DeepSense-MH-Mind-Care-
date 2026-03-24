FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app source
COPY . .

# Expose Flask port
EXPOSE 5000

# Environment defaults
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run
CMD ["python", "run.py"]