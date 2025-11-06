# PostgreSQL 17 Setup Complete

## Summary

Successfully upgraded WhatToEatNext project to PostgreSQL 17.6.

## Configuration Details

### PostgreSQL 17 Instances

#### Local (Native Installation)

- **Version**: PostgreSQL 17.6
- **Host**: localhost
- **Port**: 5432
- **Installation Path**: /Library/PostgreSQL/17
- **Databases**: whattoeatnext, alchm_kitchen
- **Users**: postgres (superuser), user (application)

#### Docker (Containerized)

- **Version**: PostgreSQL 17.6 Alpine
- **Container**: whattoeatnext-postgres-17
- **Host**: localhost (external) / postgres (internal)
- **Port**: 5434 (external) / 5432 (internal)
- **Databases**: whattoeatnext, alchm_kitchen
- **User**: user (application)
- **Image**: postgres:17-alpine

### Databases Created

1. **whattoeatnext** (main application database)
2. **alchm_kitchen** (backend service database)

**Note**: Both databases exist in both local and Docker installations

### Users

- **postgres** (superuser) - Local only
  - Password: `password`
- **user** (application user) - Both local and Docker
  - Password: `password`
  - Has full privileges on both databases

### Updated Files

1. **~/.pgpass** - Passwordless authentication for psql
2. **backend/.env** - Already configured correctly for PostgreSQL 17
3. **backend/docker-compose.yml** - Updated to postgres:17-alpine with health checks
4. **backend/init-databases.sh** - Automatic database initialization script

### Docker Containers

- Removed old PostgreSQL 15 containers and volumes
- New PostgreSQL 17 container:
  - `whattoeatnext-postgres-17` (port 5434)
  - Health checks enabled
  - Automatic database initialization
  - Fresh PostgreSQL 17 data
- Other container still running:
  - `planetary-postgres-dev` (PostgreSQL 15, port 5433)

## Connection Strings

### For Backend Services

```
DATABASE_URL=postgresql://user:password@localhost:5432/whattoeatnext
```

### For Direct psql Access

```bash
/Library/PostgreSQL/17/bin/psql -h localhost -U postgres -d whattoeatnext
/Library/PostgreSQL/17/bin/psql -h localhost -U user -d whattoeatnext
```

### Add to PATH (Optional)

Add this to your `~/.zshrc` or `~/.bash_profile`:

```bash
export PATH="/Library/PostgreSQL/17/bin:$PATH"
```

Then you can use `psql` directly without the full path.

## Next Steps

1. **Run Database Migrations**

   ```bash
   cd backend
   python3 scripts/init_database.py
   ```

2. **Start Backend Services**

   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Verify Connection in Your App**
   The backend services should now connect to PostgreSQL 17 on localhost:5432

## Useful Commands

### Check PostgreSQL Status

```bash
/Library/PostgreSQL/17/bin/pg_isready -h localhost -p 5432
```

### List Databases

```bash
/Library/PostgreSQL/17/bin/psql -h localhost -U postgres -l
```

### Connect to Database

```bash
/Library/PostgreSQL/17/bin/psql -h localhost -U user -d whattoeatnext
```

### Restart PostgreSQL (if needed)

```bash
sudo su - postgres -c "/Library/PostgreSQL/17/bin/pg_ctl restart -D /Library/PostgreSQL/17/data"
```

## Security Notes

- PostgreSQL 17 is configured with md5 password authentication
- Passwords are stored in `~/.pgpass` (chmod 600) for convenience
- For production, consider using stronger passwords and SSL connections
- Backup files created at: `/Library/PostgreSQL/17/data/pg_hba.conf.backup.*`

## Troubleshooting

### Cannot Connect

1. Check PostgreSQL is running: `ps aux | grep postgres`
2. Verify port 5432 is listening: `lsof -i :5432`
3. Check authentication: Review `/Library/PostgreSQL/17/data/pg_hba.conf`

### Password Issues

Run the reset script again:

```bash
sudo bash /Users/GregCastro/Desktop/WhatToEatNext/reset_pg_simple.sh
```

---

_Setup completed on November 6, 2025_
_PostgreSQL 17.6 on macOS_
