# Reem.AI

*Viewit's entry for the Open Data Spark Hackathon Abu Dhabi 2024*

## A Virtual Real Estate Agent for Abu Dhabi.

## How to run:

### 1. Clone repository to your local machine
    
    git clone https://github.com/hamdan-27/reem.ai.git

### 2. Run the backend

Navigate to the backend's working directory:

    cd backend/

    pip install -r requirements.txt
    
Run the server:

- **For Windows**:
  
        python -m uvicorn main:app --port 8000

- **For Linux/MacOS**:
  
        python3 -m uvicorn main:app --port 8000

### 3. Run the frontend
Navigate to the frontend's working directory:

    cd frontend/

Install the required packages:

    npm install
    
Run the development server:

    npm run dev
    
Run the production server:  

    npm run build
    npm run preview