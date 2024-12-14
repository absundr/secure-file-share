# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Create the data directory
RUN mkdir -p /app/data

# Make port 8000 available to the world outside this container
EXPOSE 8000

COPY entrypoint.sh /app/

# Run gunicorn when the container launches
CMD ["/app/entrypoint.sh"]