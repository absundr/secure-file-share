# Secure File Share API

## Overview

Secure File Share API is built using Django Rest Framework, with Django Rest Knox for token authentication and pyotp for MFA authetication via TOTP

## Features

- File encryption
- Multi-Factor Authentication
- Role-based Access Control
- Token-based Authentication
- SQLite Database
- TLS Support

## Setup Instructions

### Create virtual environment

`python -m venv venv`

Activate the virtual environment

Linux:
`venv/bin/activate`

Windows:
`venv\Scripts\activate`

### Install dependencies

`pip install -r requirements.txt`

### Initialize Database

`python manage.py makemigrations`

`python manage.py migrate`

`python manage.py create_initial_data`

The last step creates a default admin user and prints the MFA Provisioning URL along with the QR code to the terminal, make sure to register the account before proceeding.

### Run Server

`python manage.py runserver`

### Before running, generate and set master key used for file encryption

In terminal:

`python3 -c "import base64, os; print(base64.b64encode(os.urandom(32)).decode())"`

Linux:

`FILE_ENCRYPTION_MASTER_KEY=<generated_base64_key>`

Windows:

`$env:FILE_ENCRYPTION_MASTER_KEY=<generated_base64_key>`

## Initial Credentials

```
Username: admin
Password: AdminPassword123!
```
