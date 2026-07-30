FROM python:3.10-slim

WORKDIR /app

# Install system dependencies needed for MySQL client
RUN apt-get update && apt-get install -y gcc default-libmysqlclient-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Flag file for Path Traversal / LFI challenges
RUN echo "FLAG{path_traversal_system_root_access}" > /flag.txt

EXPOSE 5000
CMD ["python", "app.py"]
