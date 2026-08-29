# Face Recognition Service

This is the Python Microservice for Face Enrollment and Recognition (Phase 4 of the AI Club Platform).

## Prerequisites

- Python 3.9+
- Microsoft Visual C++ Redistributable (if on Windows, for onnxruntime/insightface)

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

3. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

The service will be available at `http://localhost:8000`.
You can access the interactive API documentation at `http://localhost:8000/docs`.
