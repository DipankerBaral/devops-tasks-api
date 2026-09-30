# devops-tasks-api

A small REST API used as an end-to-end DevOps learning project:
GitHub → automated tests → CI → Docker → AWS → Terraform → monitoring.

## Run locally

```bash
npm install
npm start
```

The API runs on http://localhost:3000 (override with the `PORT` environment variable).

## Endpoints

| Method | Path         | Description        |
|--------|--------------|--------------------|
| GET    | /health      | Health check       |
| GET    | /tasks       | List tasks         |
| GET    | /tasks/:id   | Get one task       |
| POST   | /tasks       | Create a task      |
| PATCH  | /tasks/:id   | Update title/done  |
| DELETE | /tasks/:id   | Delete a task      |
