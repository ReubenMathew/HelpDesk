# HelpDesk Application
By: Reuben Ninan (216315509), John Stegmaier (213940226), Amro Al-Salih (218287334), Orion Nelson (216305377)

## Table of Contents
- [HelpDesk Application](#helpdesk-application)
  - [Features](#features)
  - [Installation](#installation)
    - [Docker](#docker)
    - [Raw](#raw)
  - [Development](#development)
    - [Building from Source](#building-from-source)

## Run Locally
### Frontend Service
1. Clone or download the repository 
2. `cd frontend/helpdesk`
3. `echo BACKEND_URL=https://backend-development-b7d5.up.railway.app > .env.local`
4. `npm install`
5. `npx next dev`
6. Open browser to `localhost:3000`

*Note: To login as an admin use the following credentials...*
```
username=admin
password=password
```
