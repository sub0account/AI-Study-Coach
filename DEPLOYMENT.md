# AI Study Coach - Deployment Guide

This app is configured to deploy on multiple hosting platforms. Choose the one that best fits your needs.

## Quick Start

Before deploying anywhere, ensure:
1. You have a valid OpenAI API key
2. All environment variables are set in the platform's dashboard
3. Node.js 20+ is available

## Deployment Options

### 1. **Render** (Recommended - Free tier available)

**Setup:**
1. Go to [render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Select this repository
5. Choose Node as the environment
6. Set these environment variables in Render dashboard:
   - `EXPO_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key
   - `EXPO_PUBLIC_BLINK_PROJECT_ID`: ai-study-coach-4q81bc8z
   - `EXPO_PUBLIC_BLINK_PUBLISHABLE_KEY`: blnk_pk_qLKmPsvlOLFD52SgZvlzn3C8G1WvpXWY
   - `NODE_ENV`: production
7. The `render.yaml` configuration will be auto-detected
8. Deploy!

**Advantages:**
- Free tier with generous limits
- Auto-deploys on git push
- Built-in SSL
- Easy environment variable management

**URL Structure:** `https://your-service-name.onrender.com`

---

### 2. **Vercel** (Great for Next.js, also works here)

**Setup:**
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will detect the `vercel.json` configuration
4. Set environment variables in Vercel dashboard
5. Deploy!

**Advantages:**
- Extremely fast CDN
- Serverless functions
- Great for production apps
- Free tier available

**Note:** Free tier has limitations; paid plans recommended for production.

---

### 3. **Netlify**

**Setup:**
1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Netlify will detect the `netlify.toml` configuration
4. Set environment variables in Netlify dashboard
5. Deploy!

**Advantages:**
- Simple deployment
- Good for static sites with build process
- Free tier available

---

### 4. **Docker** (For any platform with Docker support)

**Local Testing:**
```bash
docker-compose up
```

Access at `http://localhost:3000`

**Deploy to any Docker-compatible platform:**
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform
- Railway

**Build and push image:**
```bash
docker build -t ai-study-coach:latest .
docker tag ai-study-coach:latest your-registry/ai-study-coach:latest
docker push your-registry/ai-study-coach:latest
```

**Advantages:**
- Maximum portability
- Full control over environment
- Works anywhere Docker runs
- Production-ready

---

### 5. **Heroku** (Legacy - now paid only)

Heroku's free tier is no longer available, but you can still deploy with:

```bash
heroku login
heroku create your-app-name
git push heroku main
```

Set environment variables:
```bash
heroku config:set EXPO_PUBLIC_OPENAI_API_KEY=your-key
```

---

### 6. **Self-Hosted (Your Own Server)**

**Requirements:**
- Node.js 20+
- Linux/macOS/Windows server
- Internet connection

**Setup:**
```bash
# Clone the repository
git clone https://github.com/sub0account/AI-Study-Coach.git
cd AI-Study-Coach

# Install dependencies
npm install

# Build the web version
npm run build:web

# Set environment variables
export EXPO_PUBLIC_OPENAI_API_KEY=your-key
export NODE_ENV=production

# Start the app
npx serve -s dist -l 3000
```

**For background service, use PM2:**
```bash
npm install -g pm2
pm2 start "npx serve -s dist -l 3000" --name ai-study-coach
pm2 startup
pm2 save
```

---

## Environment Variables

### Required (All Platforms):
```
NODE_ENV=production
EXPO_NO_TELEMETRY=1
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

### Optional (Blink Integration):
```
EXPO_PUBLIC_BLINK_PROJECT_ID=ai-study-coach-4q81bc8z
EXPO_PUBLIC_BLINK_PUBLISHABLE_KEY=blnk_pk_qLKmPsvlOLFD52SgZvlzn3C8G1WvpXWY
```

**Never commit `.env.local` or expose API keys in code!**

---

## Troubleshooting

### "Build failed" on deployment
- Ensure Node.js 20+ is specified
- Check that all dependencies are in `package.json`
- Verify `npm run build:web` works locally first

### App won't start
- Check environment variables are set correctly
- Verify `EXPO_PUBLIC_OPENAI_API_KEY` is set
- Check build logs for specific errors

### Slow performance
- Consider upgrading from free tier
- Use CDN (Vercel, Netlify have built-in)
- Optimize assets and code

### Port issues
- Default port is 3000
- Most platforms auto-assign ports - set via env var `PORT`
- Docker compose uses port 3000

---

## Monitoring

### Render
- Built-in metrics and logs in dashboard
- Email alerts available

### Vercel
- Analytics and monitoring in dashboard
- Real-time metrics

### Docker
- Use container orchestration tools (Kubernetes, Docker Swarm)
- Monitor with Prometheus, Grafana, etc.

---

## Updates

To update your deployed app:
1. Push changes to GitHub
2. Most platforms (Render, Vercel, Netlify) auto-deploy
3. For Docker, rebuild and push new image
4. For self-hosted, git pull and restart service

---

## Support

For platform-specific issues:
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Netlify**: https://docs.netlify.com
- **Docker**: https://docs.docker.com
