#!/bin/sh

set -e

echo "Starting deployment of backend services"

git reset --hard origin/main

git pull

pnpm install

pnpm prisma migrate deploy

pnpm prisma:generate

pnpm build

pm2 reload ecosystem.config.js --only prod_api

echo "Deployed successfully to prod"
