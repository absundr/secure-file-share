# Secure File Share

This is a secure file sharing application built with a Django backend and a React frontend.

## Project Structure

- `server/`: Django backend application.
- `client/`: React frontend application.
- `certs/`: SSL certificates (for HTTPS).
- `docker-compose.yml`: Docker Compose configuration for production.
- `.env`: Environment variables for Docker Compose.

## Prerequisites

- Docker
- Docker Compose

> These instructions are for running the application via docker-compose in a production setup. Invididual setup instruction for development mode can be found in the respective directories.

[Django API README.md](./server/README.md)

[React Client README.md](./client/README.md)

## Running the docker containers

### Clone the repository

```bash
git clone <repository_url>
cd secure-file-share
```

### Environment Variables

- Create a `.env` file in the project root.
- Fill in the required environment variables:

```
FILE_ENCRYPTION_MASTER_KEY=<your_master_key>
SECRET_KEY=<your_django_secret_key>
```

To generate a key, run:

`python3 -c "import base64, os; print(base64.b64encode(os.urandom(32)).decode())"`

Copy the contents into the .env file you created

### Build and Run with Docker Compose

```bash
docker-compose up --build
```

> Important note: A default admin user is created and a QR code is printed to the terminal. Make sure to scan this in an authenticator app to login as an admin. This will only be displayed once.

### Access the Application

- Open your web browser and go to `https://localhost:3001`.
- You might see a browser warning because of the self-signed certificates.

## Initial Credentials

```
Username: admin
Password: AdminPassword123!
```
