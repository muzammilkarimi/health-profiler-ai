#!/bin/bash

# Stop and remove existing containers, networks, and images
echo "Stopping existing containers..."
sudo docker-compose down

# Build and start the containers in detached mode
echo "Building and starting containers..."
sudo docker-compose up --build -d

# Show the status of the containers
echo "Container status:"
sudo docker-compose ps
