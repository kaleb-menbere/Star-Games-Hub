name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies & Build Frontend
        run: |
          cd frontend
          npm install
          npm run build
          
      - name: Deploy to VPS
        uses: appleboy/scp-action@v0.1.4
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "frontend/build/*,backend/*"
          target: "/root/Star-Games-Hub"
          strip_components: 1
          
      - name: Execute deployment commands
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.VPS_HOST }}
          username: root
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /root/Star-Games-Hub/backend
            npm install
            pm2 restart star-games-backend
            
            # Copy frontend build to nginx
            sudo cp -r /root/Star-Games-Hub/frontend/build/* /var/www/game-center/
            sudo chown -R www-data:www-data /var/www/game-center