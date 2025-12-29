# Netlify Environment Variables Setup Guide

This guide will help you configure the `GEMINI_API_KEY` environment variable in Netlify.

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev)
2. Sign in with your Google account
3. Click "Get API Key" or navigate to API Keys section
4. Create a new API key for your project
5. Copy the API key (you'll need it in the next step)

## Step 2: Add Environment Variable in Netlify

1. Log in to your [Netlify Dashboard](https://app.netlify.com)
2. Select your site (devwrapped)
3. Go to **Site settings** → **Environment variables** (under Build & deploy)
4. Click **Add a variable**
5. Set the following:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Paste your Gemini API key here
   - **Scopes**: Select all contexts you want:
     - ✅ Production
     - ✅ Deploy Previews
     - ✅ Branch deploys
     - ✅ Preview Server & Agent Runners (optional)
6. Click **Add variable**

## Step 3: Verify Configuration

The environment variable will be available to your serverless function at:
- **Function**: `netlify/functions/gemini-proxy.ts`
- **Access**: `process.env.GEMINI_API_KEY`

## Step 4: Deploy

1. Commit and push your changes to your repository
2. Netlify will automatically:
   - Build your site
   - Deploy the serverless function
   - Make the API key available to the function via `process.env.GEMINI_API_KEY`

## How It Works

```
User Browser → Client Code → Netlify Function (/.netlify/functions/gemini-proxy)
                                    ↓
                            Reads GEMINI_API_KEY from process.env
                                    ↓
                            Calls Google Gemini API
                                    ↓
                            Returns AI insights to client
```

## Security Notes

✅ **API key is NEVER exposed to the client**
✅ **API key is NOT in your repository**
✅ **API key is NOT in build output**
✅ **Netlify secret scanner will NOT detect it**

## Troubleshooting

### Error: "GEMINI_API_KEY not configured"
- Make sure you've added the environment variable in Netlify
- Verify the variable name is exactly `GEMINI_API_KEY` (case-sensitive)
- Check that you've selected the correct deploy contexts
- Redeploy after adding the variable

### Error: "GEMINI_AUTH_INVALID"
- Your API key might be invalid or expired
- Generate a new key from Google AI Studio
- Update the environment variable in Netlify
- Redeploy

### Function Not Found
- Make sure `netlify/functions/gemini-proxy.ts` exists
- Verify `netlify.toml` is configured correctly
- Check Netlify build logs for function compilation errors

## Testing Locally (Optional)

To test the function locally with Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create a .env file (DO NOT COMMIT THIS)
echo "GEMINI_API_KEY=your_key_here" > .env

# Start local dev server
netlify dev
```

**Important**: Never commit `.env` files to your repository!


