#!/bin/bash
# ================================
# User Data Script: LittleJapan Node.js/Express
# ================================

# Update system packages
yum update -y

# Install Node.js (v20 LTS) and Git
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs git

# Install PM2 to manage Node.js process
npm install -g pm2

# Create directories for app and EFS mounts
mkdir -p /home/ec2-user/littlejapan
mkdir -p /mnt/efs/uploads
mkdir -p /mnt/efs/converted
chown -R ec2-user:ec2-user /mnt/efs

# Switch to home directory
cd /home/ec2-user/littlejapan

# Optional: clone your Node.js repo (replace with your repo URL)
git clone https://github.com/kuridangocc-boop/littlejapan-repo.git .

# Install Node.js dependencies
npm install

# Copy environment variables (adjust as needed)
cat <<EOT > .env
PORT=4000
ADMIN_USER=admin
ADMIN_PASS=yourpassword
JWT_SECRET=changeme
UPLOAD_DIR=/mnt/efs/uploads
CONVERTED_DIR=/mnt/efs/converted
DB_FILE=/mnt/efs/db/littlejapan.db
EOT

# Ensure upload/conversion directories exist
mkdir -p /mnt/efs/uploads /mnt/efs/converted /mnt/efs/db

# Start the Node.js app using PM2
pm2 start server.js --name littlejapan
pm2 startup systemd
pm2 save

# Open firewall for port 4000
firewall-cmd --add-port=4000/tcp --permanent
firewall-cmd --reload

# Done
echo "LittleJapan Node.js site deployed successfully!"
