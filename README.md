# TEAM_002: Athletic Insider
[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/4tPelvOm)

Welcome to the **Athletic Insider** project! This web application is designed to support student-athletes in their transfer and recruiting journeys. It allows athletes to anonymously rate their experiences at different universities!

## 🌐 Deployment Site
Our project is deployed at: [Athletic Insider](https://theathleticinsider.com/)

---

## 🛠️ Setup Instructions

Want to use the source code locally? Follow the steps below!

### 1. Install Docker and Docker Compose

⚠️ Prerequisite: Ensure Docker and Docker Compose are installed before proceeding. If they are not installed, follow the official installation guide to set them up.

### 2. Configure Environment Variables

#### Backend Configuration
Navigate to the `backend/` directory and create a `.env` file with:

```plaintext
DJANGO_ENV=dev
DB_NAME=transfer_portal_dev
DB_USER=transfer_admin
DB_PASSWORD=***
DB_HOST=db
DB_PORT=5432

EMAIL_ADDRESS=***@gmail.com 
EMAIL_PWD=***
```
#### Frontend Configuration
Navigate to the `frontend/` directory and create:

- Development Environment (.env):

```plaintext
VITE_API_BASE_URL=http://localhost:8000
```

- Production Environment (.env.production):

```plaintext
VITE_API_BASE_URL=https://theathleticinsider.com
```
### 3. Start the Project with Docker

Navigate to the `backend/` directory:

```bash
cd backend
```

Build the containers in detached mode:

```bash
docker compose up --build -d
```

### 4. Apply Database Migrations

Apply Django migrations for database:

```bash
docker exec -it transfer_portal_backend python manage.py migrate
```

### 5. Access the Application

Now, open the browser and navigate to:

- Frontend: http://localhost:3000

- Backend API: http://localhost:8000/users/test

The application should be up and running! 🚀

---

## Notes

### ✅ Before PR: Run Linting & Tests

- **Run flake8 for backend code linting**:
```bash
docker exec -it transfer_portal_backend black .
docker exec -it transfer_portal_frontend yarn lint:fix
docker exec -it transfer_portal_backend flake8 .
```

- **Run backend unit tests with pytest**:
```bash
docker exec -it transfer_portal_backend pytest
```

- **Run frontend unit tests with vitest**:
```bash
docker exec -it transfer_portal_frontend yarn test:coverage
```

### 📦 Generate new migration files

**If Django models have changed**, create migration files before applying migrations:

```bash
docker exec -it transfer_portal_backend python manage.py makemigrations
docker exec -it transfer_portal_backend python manage.py migrate
```

### 🔍 Check & Debug Containers

- **Check running containers**, use:

```bash
docker ps
```
This will display a list of active containers along with their container IDs, names, ports, and status.

- **Check real-time logs for debugging**, use (e.g., for backend logs):

```bash
docker compose logs -f backend
```

- **Enter the running container** (e.g., for backend container):

```bash
docker exec -it transfer_portal_backend bash
```

### ❌ Stop and Clean Up Docker

- **Stop and remove all running containers**:

```bash
docker compose down
```
docker compose down

- **Remove only unused containers and volumes**:

```bash
docker system prune
```

This removes stopped containers, unused networks, and unused volumes without deleting cached images. Future builds will still be fast.

- **Remove all unused Docker resources**:

```bash
docker system prune -a
```
⚠️ Warning: This command will delete all unused containers, images and volumes. While it helps free up disk space, it can slow down future builds since Docker will have to re-download all images and rebuild everything from scratch. **If plan to restart soon, DO NOT run this command**.

---
## 🏆 Team Members  

*(Listed alphabetically by first name)*  

| Name | GitHub |
|------|--------|
| Anna Davis | [@adavis72](https://github.com/adavis72) |
| Jingming Liang | [@Mirrorigin](https://github.com/Mirrorigin) |
| Rodrigo Medina | [@rmdna-uiowa](https://github.com/rmdna-uiowa) |
| Samantha Pothitakis | [@samanthapoth](https://github.com/samanthapoth) |
| Yusuf Halim | [@halimyu](https://github.com/halimyu) |

For any further assistance, please reach out to the development team. Happy Coding! 🎉
