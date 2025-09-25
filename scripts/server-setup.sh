#!/bin/bash

# RoyalQ Salebot - Server Security Setup Script
# This script sets up secure MongoDB and application configuration on the server

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
   exit 1
fi

log "Starting RoyalQ Salebot server security setup..."

# 1. Install MongoDB if not present
if ! command -v mongod &> /dev/null; then
    log "Installing MongoDB..."
    
    # For Ubuntu/Debian
    if command -v apt &> /dev/null; then
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-org
    # For CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y mongodb-org
    else
        error "Unsupported operating system. Please install MongoDB manually."
        exit 1
    fi
    
    success "MongoDB installed"
else
    success "MongoDB already installed"
fi

# 2. Create MongoDB directories
log "Creating MongoDB directories..."
sudo mkdir -p /var/lib/mongodb
sudo mkdir -p /var/log/mongodb
sudo mkdir -p /var/run/mongodb
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown -R mongodb:mongodb /var/log/mongodb
sudo chown -R mongodb:mongodb /var/run/mongodb
success "MongoDB directories created"

# 3. Copy secure MongoDB configuration
log "Setting up secure MongoDB configuration..."
sudo cp config/mongod-server.conf /etc/mongod.conf
sudo chown root:root /etc/mongod.conf
sudo chmod 644 /etc/mongod.conf
success "MongoDB configuration updated"

# 4. Start MongoDB
log "Starting MongoDB service..."
sudo systemctl enable mongod
sudo systemctl start mongod
sleep 5

# Check if MongoDB is running
if sudo systemctl is-active --quiet mongod; then
    success "MongoDB service started"
else
    error "Failed to start MongoDB service"
    exit 1
fi

# 5. Create application user
log "Creating application database and user..."
mongosh --eval "
use royalq_salebot;
db.createUser({
  user: 'royalq_user',
  pwd: '$(openssl rand -base64 32)',
  roles: [
    { role: 'readWrite', db: 'royalq_salebot' }
  ]
});
" || warning "User creation failed (may already exist)"

# 6. Create backup directory
log "Creating backup directory..."
sudo mkdir -p /var/backups/royalq-salebot
sudo chown -R $USER:$USER /var/backups/royalq-salebot
success "Backup directory created"

# 7. Setup firewall rules
log "Configuring firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw deny 27017/tcp  # Block MongoDB from external access
    success "Firewall configured"
elif command -v firewall-cmd &> /dev/null; then
    sudo systemctl enable firewalld
    sudo systemctl start firewalld
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --permanent --remove-port=27017/tcp
    sudo firewall-cmd --reload
    success "Firewall configured"
else
    warning "No firewall found. Please configure manually."
fi

# 8. Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    log "Installing PM2..."
    npm install -g pm2
    success "PM2 installed"
else
    success "PM2 already installed"
fi

# 9. Create systemd service for PM2
log "Creating PM2 systemd service..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
success "PM2 systemd service created"

# 10. Setup log rotation
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/royalq-salebot > /dev/null <<EOF
/var/log/mongodb/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 mongodb mongodb
    postrotate
        /bin/kill -SIGUSR1 \$(cat /var/run/mongodb/mongod.pid 2> /dev/null) 2> /dev/null || true
    endscript
}
EOF
success "Log rotation configured"

# 11. Create backup cron job
log "Setting up automated backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * cd $(pwd) && npm run backup-secure >> /var/log/royalq-backup.log 2>&1") | crontab -
success "Automated backups scheduled"

# 12. Generate secure environment file
log "Creating secure environment file..."
if [ ! -f .env ]; then
    cp env.server.example .env
    # Generate secure secrets
    JWT_SECRET=$(openssl rand -base64 64)
    SESSION_SECRET=$(openssl rand -base64 64)
    
    sed -i "s/CHANGE_THIS_TO_STRONG_RANDOM_STRING_64_CHARS_MIN/$JWT_SECRET/g" .env
    sed -i "s/CHANGE_THIS_TO_STRONG_RANDOM_STRING_64_CHARS_MIN/$SESSION_SECRET/g" .env
    
    success "Secure environment file created"
    warning "Please update API keys and other settings in .env file"
else
    warning ".env file already exists, skipping creation"
fi

# 13. Install dependencies
log "Installing application dependencies..."
npm ci --production
success "Dependencies installed"

# 14. Initialize database
log "Initializing database..."
npm run init-db
success "Database initialized"

# 15. Test application
log "Testing application..."
npm run quick-test
success "Application test passed"

# 16. Start application with PM2
log "Starting application with PM2..."
pm2 start src/server.js --name royalq-salebot --env production
pm2 save
success "Application started with PM2"

# Final status
log "Server setup completed successfully!"
echo ""
success "MongoDB: Running securely on localhost only"
success "Application: Running with PM2"
success "Firewall: Configured to block external MongoDB access"
success "Backups: Scheduled daily at 2 AM"
success "Logs: Rotated daily with 30-day retention"
echo ""
warning "Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Configure your domain and SSL certificates"
echo "3. Test the application: curl http://localhost:3000/health"
echo "4. Monitor logs: pm2 logs royalq-salebot"
echo ""
success "RoyalQ Salebot is now running securely on your server!"
