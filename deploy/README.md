# Deploy README

This folder contains deployment files for the production environment.

Files:

- `docker-compose.prod.yml` : Compose file orchestrating frontend, backend and db (Nginx is managed on the host).
- `.env.example` : Example environment variables for production.

Quick setup on the server:

1. Install Docker and Docker Compose v2.
2. Create directories and copy files to `/opt/oftheyear` on the server:

```bash
sudo mkdir -p /opt/oftheyear/deploy
sudo chown $USER:$USER /opt/oftheyear/deploy
# clone repo or copy deploy/ folder here
```

3. Place your production `.env.production` at `/opt/oftheyear/deploy/.env.production` (follow `.env.example`).
4. Ensure `/opt/oftheyear/postgres_data` exists and is writable by Docker (Postgres container user).
5. Run (from the server):

```bash
cd /opt/oftheyear/deploy
docker compose -f docker-compose.prod.yml up -d --build
```

6. Obtain Let's Encrypt certs (example using certbot on host):

```bash
sudo apt install certbot
# Use certbot with nginx on the host to obtain certs and write them to /etc/letsencrypt
sudo certbot certonly --nginx -d oftheyear.net -d www.oftheyear.net
```

Notes:
- The frontend needs `NEXT_PUBLIC_API_URL` at build-time. When building via CI, set it as a build-arg (see workflow).
- If you prefer runtime injection of envs for Next.js (to avoid rebuilding when changing API URL), implement a small `public/runtime-config.js` generated at container start.
 - Add GitHub secrets: `GHCR_TOKEN`, `NEXT_PUBLIC_API_URL`, `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `SERVER_SSH_PORT`.

Notes about Nginx on the host:

- The repo no longer contains an Nginx config. Place your Nginx site config on the server (for example `/etc/nginx/sites-available/oftheyear`) and proxy to the containers running on the host (localhost:3000 and localhost:3001).
- With the current `docker-compose.prod.yml` the frontend and backend are exposed on the host ports `3000` and `3001` respectively. Configure Nginx to proxy to `http://127.0.0.1:3000` (frontend) and `http://127.0.0.1:3001` (backend).
- After creating/updating the Nginx config on the host, reload Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```
