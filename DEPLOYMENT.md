# 🚀 Production Deployment Guide

## Overview

Your TechHub Zimbabwe website with PayNow integration is now ready for production deployment.

---

## 📊 Project Summary

### Components
✅ **Frontend** - Static HTML/CSS/JavaScript (index.html, style.css, script.js)
✅ **Backend** - Node.js Express server (paynow-server.js)
✅ **Payment Gateway** - PayNow Zimbabwe integration
✅ **Credentials** - Configured in .env file
✅ **Documentation** - Complete guides and examples

### Credentials Status
```
✓ Integration ID: 23629
✓ Integration Key: 0ac007f7-e809-424d-9d25-433d27335488
✓ Environment configured
✓ .gitignore setup (prevents credential leakage)
```

---

## 🏗️ Deployment Options

### Option 1: Heroku (Easiest)

#### Prerequisites
- Heroku account (free tier available)
- Git and Heroku CLI installed
- Your PayNow credentials (already configured)

#### Steps

**1. Login to Heroku:**
```bash
heroku login
```

**2. Create Heroku app:**
```bash
cd /Users/michaelnyemudzo/dummy
heroku create techhub-zimbabwe
```

**3. Set environment variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
```
(Credentials are already in .env, configure them via Heroku dashboard)

**4. Deploy:**
```bash
git push heroku main
```

**5. View application:**
```bash
heroku open
```

**6. View logs:**
```bash
heroku logs --tail
```

**Benefits:**
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Easy deployment
- ✅ Good for testing

**Limitations:**
- ❌ App sleeps after 30 min inactivity (free tier)
- ❌ Limited database storage

---

### Option 2: AWS (Scalable)

#### Using Elastic Beanstalk

**1. Install AWS CLI:**
```bash
brew install awscli
aws configure
```

**2. Initialize Elastic Beanstalk:**
```bash
eb init -p node.js-18 techhub-zimbabwe --region us-east-1
```

**3. Create environment:**
```bash
eb create production
```

**4. Set environment variables:**
```bash
eb setenv PAYNOW_INTEGRATION_ID=23629
eb setenv PAYNOW_INTEGRATION_KEY=0ac007f7-e809-424d-9d25-433d27335488
eb setenv NODE_ENV=production
```

**5. Deploy:**
```bash
eb deploy
```

**Benefits:**
- ✅ Highly scalable
- ✅ Auto-scaling available
- ✅ RDS database integration
- ✅ Production-grade

**Estimated Cost:**
- EC2 instance: $10-50/month
- RDS database: $10-20/month
- Total: $20-70/month

---

### Option 3: DigitalOcean (Balanced)

#### Using App Platform

**1. Create account:** https://www.digitalocean.com

**2. Connect GitHub repository**

**3. Create new app:**
- Select repository
- Choose Node.js 18 runtime
- Set environment variables:
  - PAYNOW_INTEGRATION_ID=23629
  - PAYNOW_INTEGRATION_KEY=0ac007f7-e809-424d-9d25-433d27335488
  - NODE_ENV=production

**4. Deploy**

**Benefits:**
- ✅ Affordable ($12+/month)
- ✅ Reliable performance
- ✅ Good documentation
- ✅ PostgreSQL/MongoDB available

---

### Option 4: Railway (Modern)

#### Steps

**1. Create account:** https://railway.app

**2. Create new project:**
```bash
railway init
```

**3. Link PayNow credentials:**
```bash
railway variables
# Add PAYNOW_INTEGRATION_ID=23629
# Add PAYNOW_INTEGRATION_KEY=...
```

**4. Deploy:**
```bash
railway up
```

**Benefits:**
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Good UI
- ✅ Modern infrastructure

---

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Free)

**1. Create account:** https://www.mongodb.com/cloud/atlas

**2. Create cluster**

**3. Get connection string:**
```
mongodb+srv://user:password@cluster.mongodb.net/techhub
```

**4. Set in environment:**
```bash
heroku config:set DATABASE_URL=mongodb+srv://...
```

**5. Use in paynow-server.js:**
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
```

---

### Option 2: PostgreSQL

**1. On Heroku:**
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

**2. Install driver:**
```bash
npm install pg
```

**3. Use in code:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});
```

---

## 🔐 Security Checklist

### Before Deployment

- [ ] HTTPS enforced (not HTTP)
- [ ] Credentials in environment variables (not hardcoded)
- [ ] .env file in .gitignore
- [ ] API keys rotated
- [ ] CORS configured properly
- [ ] Input validation implemented
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Headers configured (helmet.js)
- [ ] Secrets management setup

### Add Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Add Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

---

## 📝 Configuration Files

### Production .env Example

```env
# PayNow Credentials
PAYNOW_INTEGRATION_ID=23629
PAYNOW_INTEGRATION_KEY=0ac007f7-e809-424d-9d25-433d27335488

# Environment
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/techhub

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxx...

# App URLs
APP_URL=https://techhubzw.com
RETURN_URL=https://techhubzw.com/payment-return
RESULT_URL=https://techhubzw.com/payment-result

# Security
SESSION_SECRET=your-secret-key-here
```

### Procfile (for Heroku)

Create file: `Procfile`
```
web: node paynow-server.js
```

### Runtime.txt (Python version for Heroku)

Create file: `runtime.txt`
```
node-18.12.1
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "techhub-zimbabwe"
          heroku_email: "your-email@example.com"
          
      - name: Run tests
        run: npm test
```

---

## 📊 Monitoring

### Application Performance

**1. Add error tracking (Sentry):**
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**2. Add logging (Winston):**
```bash
npm install winston
```

**3. Add metrics (Prometheus):**
```bash
npm install prom-client
```

---

## 🧪 Pre-Deployment Testing

### Local Testing
```bash
npm install
npm run start:server
```

### Test Payment Flow
1. Visit http://localhost:3000/health
2. Create test payment via API
3. Verify webhook receives response
4. Check database updates

### Run Tests
```bash
npm test
```

---

## 📈 Post-Deployment

### Monitor Performance
- Check Heroku/AWS dashboards
- Monitor error logs
- Track payment success rate
- Monitor API response times

### Daily Tasks
- Check PayNow transaction history
- Verify order confirmations sent
- Monitor customer support emails
- Review error logs

### Weekly Tasks
- Review analytics
- Check payment reconciliation
- Backup database
- Update dependencies

### Monthly Tasks
- Security audit
- Performance review
- Cost analysis
- Customer feedback review

---

## 🆘 Troubleshooting

### App Won't Start
```bash
# Check logs
heroku logs --tail

# Restart app
heroku restart

# Check Node.js version
heroku config:get BUILDPACK_LANGUAGE
```

### Database Connection Error
```
Error: ECONNREFUSED or DATABASE_URL undefined
```

**Fix:**
```bash
# Verify DATABASE_URL is set
heroku config

# Reconnect database
heroku addons:destroy heroku-postgresql:hobby-dev
heroku addons:create heroku-postgresql:hobby-dev
```

### PayNow API Errors
- Verify credentials in .env
- Check signature generation
- Monitor API logs
- Contact PayNow support

---

## 💰 Cost Estimates

### Monthly Running Costs

| Platform | Tier | Cost | Suitable For |
|----------|------|------|-------------|
| Heroku | Free | $0 | Testing |
| Heroku | Standard | $7-25 | Small apps |
| DigitalOcean | Basic | $12-15 | Small business |
| AWS | Free | $0-20 | Variable traffic |
| AWS | Production | $50-200 | High traffic |

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] .env file created locally
- [ ] .gitignore includes .env
- [ ] No hardcoded secrets
- [ ] Database migrated
- [ ] API endpoints tested
- [ ] PayNow credentials verified

### Deployment
- [ ] Choose hosting platform
- [ ] Create account
- [ ] Set environment variables
- [ ] Deploy application
- [ ] Verify app is running
- [ ] Check health endpoint
- [ ] Test payment flow

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test all features
- [ ] Verify PayNow integration
- [ ] Check email notifications
- [ ] Monitor performance
- [ ] Set up backups
- [ ] Configure monitoring

---

## 🎯 Next Steps

1. **Choose a platform** - Heroku, AWS, DigitalOcean, or Railway
2. **Deploy application** - Follow platform instructions
3. **Configure PayNow** - Update webhook URL to production
4. **Test thoroughly** - Run complete payment flow
5. **Monitor performance** - Set up logging and alerts
6. **Go live** - Update DNS to point to production URL

---

## 📞 Support Resources

- **Heroku Docs:** https://devcenter.heroku.com/
- **AWS Docs:** https://aws.amazon.com/documentation/
- **DigitalOcean Docs:** https://docs.digitalocean.com/
- **PayNow Help:** https://www.paynow.co.zw/merchant/management

---

**Your application is ready for production!** 🚀

Choose a deployment option above and follow the steps to go live.
