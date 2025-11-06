#!/bin/bash
# Simple PostgreSQL password reset - run with: sudo bash reset_pg_simple.sh

echo "Step 1: Backup config..."
cp /Library/PostgreSQL/17/data/pg_hba.conf /Library/PostgreSQL/17/data/pg_hba.conf.backup.$(date +%s) && echo "OK" || echo "FAILED"

echo "Step 2: Enable trust auth..."
echo "local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust" > /Library/PostgreSQL/17/data/pg_hba.conf

chown postgres:daemon /Library/PostgreSQL/17/data/pg_hba.conf
chmod 600 /Library/PostgreSQL/17/data/pg_hba.conf

echo "Step 3: Reload PostgreSQL..."
su - postgres -c "/Library/PostgreSQL/17/bin/pg_ctl reload -D /Library/PostgreSQL/17/data"
sleep 3

echo "Step 4: Set password..."
su - postgres -c "/Library/PostgreSQL/17/bin/psql -d postgres -c \"ALTER USER postgres WITH PASSWORD 'password';\""

echo "Step 5: Restore secure auth..."
echo "local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5" > /Library/PostgreSQL/17/data/pg_hba.conf

chown postgres:daemon /Library/PostgreSQL/17/data/pg_hba.conf
chmod 600 /Library/PostgreSQL/17/data/pg_hba.conf

echo "Step 6: Reload PostgreSQL again..."
su - postgres -c "/Library/PostgreSQL/17/bin/pg_ctl reload -D /Library/PostgreSQL/17/data"
sleep 2

echo "Done! Password is now: password"
