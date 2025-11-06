# PostgreSQL 17 Password Reset Instructions

## Current Situation

You're currently in a sudo bash shell (bash-3.2#). You need to exit and run the script properly.

## Steps to Execute:

### 1. Exit the current sudo shell:

```bash
exit
```

### 2. Run the reset script with the correct command:

```bash
sudo bash /Users/GregCastro/Desktop/WhatToEatNext/reset_postgres_password.sh
```

**Note:** There should be NO line break between "sudo bash" and the path!

### 3. Enter your Mac password when prompted

The script will then automatically:

- Backup pg_hba.conf
- Temporarily enable trust authentication
- Reset postgres password to 'password'
- Restore secure authentication
- Test the connection

---

## Alternative: Manual Steps (if script doesn't work)

If you prefer to do it manually, here are the commands to run from the bash-3.2# prompt you're currently in:

```bash
# 1. Backup current config
cp /Library/PostgreSQL/17/data/pg_hba.conf /Library/PostgreSQL/17/data/pg_hba.conf.backup

# 2. Create temporary trust config
cat > /Library/PostgreSQL/17/data/pg_hba.conf << 'EOF'
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
EOF

# 3. Set permissions
chown postgres:daemon /Library/PostgreSQL/17/data/pg_hba.conf
chmod 600 /Library/PostgreSQL/17/data/pg_hba.conf

# 4. Reload PostgreSQL
su - postgres -c "/Library/PostgreSQL/17/bin/pg_ctl reload -D /Library/PostgreSQL/17/data"

# 5. Wait 2 seconds
sleep 2

# 6. Set new password
su - postgres -c "/Library/PostgreSQL/17/bin/psql -d postgres -c \"ALTER USER postgres WITH PASSWORD 'password';\""

# 7. Restore secure config
cat > /Library/PostgreSQL/17/data/pg_hba.conf << 'EOF'
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
EOF

# 8. Set permissions again
chown postgres:daemon /Library/PostgreSQL/17/data/pg_hba.conf
chmod 600 /Library/PostgreSQL/17/data/pg_hba.conf

# 9. Reload PostgreSQL again
su - postgres -c "/Library/PostgreSQL/17/bin/pg_ctl reload -D /Library/PostgreSQL/17/data"

# 10. Exit sudo shell
exit
```

After completing either method, let me know and I'll continue with the database setup!
