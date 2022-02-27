# HelpDesk Application


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
3. Create a `.env.local` file with the following content `BACKEND_URL=https://backend-development-b7d5.up.railway.app`
4. `npm install`
5. `npx next dev`
6. Open browser to `localhost:3000`

*Note: To login as an admin use the following credentials...*
```
username=admin
password=password
```
