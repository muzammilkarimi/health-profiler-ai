#!/bin/bash

# Stop and remove containers, networks, and images defined in docker-compose.yml
echo "Stopping and removing containers..."
sudo docker-compose down

echo "Done. All services have been stopped."
