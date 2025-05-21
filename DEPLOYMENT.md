# Deployment Guide for Event-Connect

This guide outlines the steps to deploy the Event-Connect application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional)
3. Git repository with your project code

## Deployment Steps

### 1. Prepare Your Project

1. Ensure your project has a `vercel.json` configuration file in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "client/dist/$1"
    }
  ]
}
```

2. Update your `client/vite.config.ts` to include the base URL:

```typescript
export default defineConfig({
  base: '/',
  // ... rest of your config
})
```

### 2. Deploy Using Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure your project:
   - Framework Preset: Other
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`
6. Add Environment Variables:
   - `NODE_ENV`: production
   - Add any other environment variables your app needs
7. Click "Deploy"

### 3. Deploy Using Vercel CLI (Alternative)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

## Post-Deployment

1. Verify your deployment at the provided Vercel URL
2. Set up a custom domain in the Vercel dashboard if needed
3. Configure environment variables in the Vercel dashboard
4. Set up automatic deployments for your main branch

## Troubleshooting

1. If you encounter build errors:
   - Check the build logs in Vercel dashboard
   - Verify all dependencies are in `package.json`
   - Ensure build commands are correct

2. If API routes aren't working:
   - Verify the `vercel.json` routes configuration
   - Check environment variables
   - Ensure server code is properly exported

3. If static files aren't serving:
   - Verify the build output directory
   - Check the base URL configuration
   - Ensure proper routing in `vercel.json`

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Deployment Guide](https://vercel.com/guides/deploying-nodejs-express-apis-vercel) 