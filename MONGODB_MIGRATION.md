# MongoDB Migration Guide

## Prerequisites
1. Ensure you have `mongodump` and `mongorestore` installed locally
2. Have your MongoDB Atlas connection string ready
3. Backup your current Atlas data

## Step 1: Add Environment Variables

Add to your VPS `.env` file:
```bash
# MongoDB Configuration
MONGO_ROOT_USER=root
MONGO_ROOT_PASSWORD=<generate-strong-password>
MONGO_APP_USER=zenvy_app
MONGO_APP_PASSWORD=<generate-strong-password>
```

## Step 2: Deploy MongoDB Container

```bash
# On your VPS
cd /root/zenvy
docker stack deploy -c docker-compose.prod.yml zenvy

# Wait for MongoDB to be healthy
docker service ls
```

## Step 3: Export from Atlas

```bash
# On your local machine
mongodump --uri="mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME" \
  --out=./atlas_backup
```

## Step 4: Transfer to VPS

```bash
# Compress the backup
tar -czf atlas_backup.tar.gz atlas_backup/

# Transfer to VPS
scp atlas_backup.tar.gz root@72.61.249.155:/root/mongodb_backup/

# On VPS, extract
ssh root@72.61.249.155
cd /root/mongodb_backup
tar -xzf atlas_backup.tar.gz
```

## Step 5: Import to Local MongoDB

```bash
# Find the MongoDB container name
docker ps | grep mongodb

# Import the data
docker exec -i zenvy_mongodb mongorestore \
  --username=root \
  --password=YOUR_ROOT_PASSWORD \
  --authenticationDatabase=admin \
  --db=zenvy_production \
  /backup/atlas_backup/YOUR_DATABASE_NAME
```

## Step 6: Verify Data

```bash
# Connect to MongoDB
docker exec -it zenvy_mongodb mongosh \
  -u root \
  -p YOUR_ROOT_PASSWORD \
  --authenticationDatabase admin

# In mongosh:
use zenvy_production
db.users.countDocuments()
db.events.countDocuments()
db.orders.countDocuments()
exit
```

## Step 7: Update Server Environment

The `MONGO_URI` is already set in docker-compose.prod.yml, but verify:
```bash
MONGO_URI=mongodb://root:PASSWORD@mongodb:27017/zenvy_production?authSource=admin
```

## Step 8: Restart Services

```bash
docker service update --force zenvy_server
```

## Step 9: Test Application

1. Visit your website
2. Test login
3. Test event browsing
4. Test ticket purchase
5. Check admin dashboard

## Step 10: Set Up Automated Backups

```bash
# Copy backup script to VPS
scp scripts/mongodb-backup.sh root@72.61.249.155:/root/scripts/

# Make executable
ssh root@72.61.249.155
chmod +x /root/scripts/mongodb-backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/scripts/mongodb-backup.sh >> /var/log/mongodb-backup.log 2>&1
```

## Rollback Plan

If issues occur:
```bash
# Update server to use Atlas again
docker service update \
  --env-add MONGO_URI="YOUR_ATLAS_URI" \
  zenvy_server
```

## Monitoring

```bash
# Check MongoDB logs
docker service logs zenvy_mongodb -f

# Check MongoDB stats
docker exec zenvy_mongodb mongosh \
  -u root -p PASSWORD \
  --authenticationDatabase admin \
  --eval "db.serverStatus()"

# Check disk usage
docker exec zenvy_mongodb du -sh /data/db
```
