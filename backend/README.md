# Reem.AI API
_Viewit's entry for the Open Data Spark Hackathon Abu Dhabi 2024_

## Run Locally

### 1. Clone repository to your local machine
    
    git clone https://github.com/hamdan-27/reem.ai.git

### 2. Run the following commands
Make sure you are in the backend's working directory:

    cd backend/

Install the required packages:

    pip install -r requirements.txt

Run the server:

*Navigate to the app directory*

    cd app/

then:

- **For Windows**:

  Run `python -m uvicorn main:app --port 8000`

- **For Linux/MacOS**:
  
  Run `python3 -m uvicorn main:app --port 8000`

### 3. Your local server should now be live.
Go to `localhost:8000` or `127.0.0.1:8000` on your browser

## Docker

### 1. Build the image
Build the container with the commands:
    
    docker-compose up --build

Check app logs with:

    docker ps   # find the container id
    docker logs -f <container id>




## API Docs
Navigate to the `/reemai-docs` endpoint for the API Documentation.

### _Example Usage:_ 

    http://localhost:5000/chat/hi
