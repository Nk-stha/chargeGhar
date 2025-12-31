# Running the project with Docker Compose (local & production)

**Overview**
- This file documents how to run the project locally (development) and a production-style run using `docker-compose.prod.yml`.
- Commands are for PowerShell on Windows (your environment).

**Prerequisites**
- Docker Desktop (or Docker Engine + Compose CLI) installed and running.
- PowerShell (Windows) terminal.
- The repository root contains `docker-compose.yml`, `docker-compose.prod.yml`, and `.env.production`.

**Files**
- Development Compose: `docker-compose.yml` (bind-mounts, good for development)
- Production Compose: `docker-compose.prod.yml` (builds a local image `chargeghar:local` and uses `.env.production`)

**Quick validation (both)**
Run this to verify the composed config is syntactically valid and see the merged configuration:
```powershell
docker compose -f .\docker-compose.yml config
docker compose -f .\docker-compose.prod.yml config
```

**Run Development (quick dev loop)**
- Uses the existing `docker-compose.yml` which bind-mounts your source into the container. Not suitable for production.

Start in detached mode (compose will build if needed):
```powershell
docker compose -f .\docker-compose.yml up -d --build
```

Follow logs:
```powershell
docker compose -f .\docker-compose.yml logs -f
```

Stop and remove containers (preserve volumes/networks unless you add `-v`):
```powershell
docker compose -f .\docker-compose.yml down
```

**Run Production (local build) — recommended for local testing**
- `docker-compose.prod.yml` is configured to build a local image (`chargeghar:local`) so you don't need a registry.

1) (Optional) Create the external network if it doesn't exist. Recommended: run the included script:
```powershell
.\scripts\create_shared_network.ps1
```

Cross-platform convenience script (bash)
- There's a bash helper `scripts/run_compose.sh` that validates prerequisites (Docker, network, env), validates the chosen compose file, and can start/stop the dev or prod stack.

Usage (Git Bash, WSL, or other bash on Windows):
```bash
# Start dev compose (build if needed)
./scripts/run_compose.sh dev start --build

# Start prod compose (build local image and start)
./scripts/run_compose.sh prod start --build

# Show status
./scripts/run_compose.sh prod status

# Follow logs
./scripts/run_compose.sh prod logs

# Stop and remove
./scripts/run_compose.sh prod stop
```

Notes:
- The bash script will also create the `shared-chargeghar` network if it's missing (unless called with `--no-network-create`).
- If you only have PowerShell available, use the PowerShell network script `scripts/create_shared_network.ps1` and the `docker compose` commands shown above.

2) Build & start (Compose will build automatically if needed):
```powershell
docker compose -f .\docker-compose.prod.yml up -d --build
```

Or build explicitly then run:
```powershell
docker build -t chargeghar:local .
docker compose -f .\docker-compose.prod.yml up -d
```

3) View logs:
```powershell
docker compose -f .\docker-compose.prod.yml logs -f
```

4) Stop / remove:
```powershell
docker compose -f .\docker-compose.prod.yml down
```

**Environment variables & secrets**
- Non-sensitive variables are loaded from `.env.production` (already present). Do NOT commit real secrets.
- To set an environment variable for the current PowerShell session before starting Compose:
```powershell
$env:APP_SECRET = "supersecretvalue"
docker compose -f .\docker-compose.prod.yml up -d
```
- Docker secrets require Swarm mode and are safer for production. Example (Swarm):
```powershell
# Create secret from a file
echo "mypassword" > db_password.txt
docker secret create db_password db_password.txt

# In a Swarm-enabled compose file you would reference the secret.
```

**Healthcheck note**
- The production compose uses a `curl`-based healthcheck (`curl -f http://localhost:3000/health`). If your image does not include `curl`, the healthcheck will fail and the container may be marked unhealthy.
- Options:
  - Add `curl` to your `Dockerfile` (e.g., `RUN apt-get update && apt-get install -y curl` for Debian-based images).
  - Replace the healthcheck with a command available in your image, or remove it temporarily.

**If you prefer to run from a remote registry**
- Replace the `build:` block in `docker-compose.prod.yml` with `image: yourorg/chargeghar:TAG` and then:
```powershell
docker compose -f .\docker-compose.prod.yml pull
docker compose -f .\docker-compose.prod.yml up -d
```

**Troubleshooting**
- If `docker compose config` reports errors, fix the YAML indicated in the message.
- If containers exit immediately, inspect logs and status:
```powershell
docker compose -f .\docker-compose.prod.yml ps
docker compose -f .\docker-compose.prod.yml logs --tail=200
docker compose -f .\docker-compose.prod.yml logs -f
```
- If ports conflict, either stop the host service on that port or change the port mapping in the compose file.

**Cleanup**
- Remove containers, networks, and anonymous volumes created by Compose:
```powershell
docker compose -f .\docker-compose.prod.yml down --volumes --remove-orphans
```

**Next steps (suggested)**
- For production deployments, use a CI/CD pipeline to build, scan, and push images to a registry and inject secrets from a secrets manager.
- Consider using Kubernetes or a managed container service if you need scaling, rolling updates, or advanced networking.

---
Created by the project helper: contains steps to run dev and a production-style local run with build.
