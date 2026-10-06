# Todo App

A simple full-stack Todo application that we will build locally first and later deploy to AWS.

## Planned stack

- Frontend: HTML, CSS, JavaScript
- Backend: Python + FastAPI
- Local database: SQLite
- Authentication: JWT
- Future AWS: Cognito, API Gateway, Lambda, DynamoDB, S3, CloudFront

## Project structure

```text
todo-app/
├── backend/
├── frontend/
└── README.md
```

## Run backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
