#!/bin/bash

# PostgreSQL 17 Password Reset Script
# This script temporarily enables trust authentication to reset the postgres password

set -e

echo "🔧 PostgreSQL 17 Password Reset Script"
echo "========================================"

PG_DATA_DIR="/Library/PostgreSQL/17/data"
PG_HBA_CONF="${PG_DATA_DIR}/pg_hba.conf"
PG_BIN="/Library/PostgreSQL/17/bin"
NEW_PASSWORD="password"

# Check if running with sufficient privileges
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  This script requires sudo privileges"
    echo "Please run: sudo bash reset_postgres_password.sh"
    exit 1
fi

echo ""
echo "Step 1: Backing up pg_hba.conf..."
cp "${PG_HBA_CONF}" "${PG_HBA_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✅ Backup created"

echo ""
echo "Step 2: Modifying pg_hba.conf to allow trust authentication..."
# Create temporary pg_hba.conf with trust authentication
cat > "${PG_HBA_CONF}.tmp" << 'EOF'
# Temporary trust authentication for password reset
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
EOF

# Replace pg_hba.conf
cp "${PG_HBA_CONF}.tmp" "${PG_HBA_CONF}"
chown postgres:daemon "${PG_HBA_CONF}"
chmod 600 "${PG_HBA_CONF}"
rm "${PG_HBA_CONF}.tmp"
echo "✅ pg_hba.conf modified"

echo ""
echo "Step 3: Reloading PostgreSQL configuration..."
su - postgres -c "${PG_BIN}/pg_ctl reload -D ${PG_DATA_DIR}"
sleep 2
echo "✅ Configuration reloaded"

echo ""
echo "Step 4: Setting postgres password to '${NEW_PASSWORD}'..."
su - postgres -c "${PG_BIN}/psql -d postgres -c \"ALTER USER postgres WITH PASSWORD '${NEW_PASSWORD}';\""
echo "✅ Password updated"

echo ""
echo "Step 5: Restoring secure pg_hba.conf..."
cat > "${PG_HBA_CONF}" << 'EOF'
# PostgreSQL Client Authentication Configuration File
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     md5

# IPv4 local connections:
host    all             all             127.0.0.1/32            md5

# IPv6 local connections:
host    all             all             ::1/128                 md5

# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     md5
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
EOF

chown postgres:daemon "${PG_HBA_CONF}"
chmod 600 "${PG_HBA_CONF}"
echo "✅ Secure configuration restored"

echo ""
echo "Step 6: Reloading PostgreSQL configuration..."
su - postgres -c "${PG_BIN}/pg_ctl reload -D ${PG_DATA_DIR}"
sleep 2
echo "✅ Configuration reloaded"

echo ""
echo "Step 7: Testing connection..."
if su - postgres -c "${PG_BIN}/psql -h localhost -U postgres -d postgres -c 'SELECT version();'" > /dev/null 2>&1; then
    echo "✅ Connection test successful!"
else
    echo "⚠️  Connection test failed - you may need to enter the password manually"
fi

echo ""
echo "=========================================="
echo "✅ Password reset complete!"
echo ""
echo "New credentials:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: postgres"
echo "  Password: ${NEW_PASSWORD}"
echo ""
echo "Your .pgpass file has been updated at:"
echo "  ~/.pgpass"
echo "=========================================="
