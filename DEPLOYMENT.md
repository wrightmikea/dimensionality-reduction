# Deployment Guide

## How to Make Your GitHub Repository Public

To enable the free GitHub Pages live demo, you need to make your repository public:

1. **Go to your repository on GitHub**
   - Navigate to: https://github.com/wrightmikea/dimensionality-reduction

2. **Access Repository Settings**
   - Click on the "Settings" tab (gear icon at the top)

3. **Navigate to the Danger Zone**
   - Scroll down to the bottom of the Settings page
   - Find the "Danger Zone" section (it has a red background)

4. **Change Visibility**
   - Click "Change visibility"
   - Select "Make public"
   - GitHub will ask you to confirm by typing the repository name
   - Type: `wrightmikea/dimensionality-reduction`
   - Click "I understand, change repository visibility"

## Enable GitHub Pages

After making the repository public:

1. **Go to Settings > Pages**
   - In your repository, click "Settings"
   - Click "Pages" in the left sidebar

2. **Configure GitHub Pages**
   - Under "Build and deployment"
   - Source: Select "GitHub Actions"
   - Save the changes

3. **Trigger the Deployment**
   - Go to the "Actions" tab
   - Click on "Deploy to GitHub Pages" workflow
   - Click "Run workflow" > "Run workflow"

4. **Wait for Deployment**
   - The deployment will take 2-3 minutes
   - Once complete, your site will be live at:
     https://wrightmikea.github.io/dimensionality-reduction/

## GitHub Actions Workflows

Two workflows have been created:

### 1. Deploy to GitHub Pages (`.github/workflows/deploy.yml`)
- **Triggers**: Automatically on push to main branch
- **What it does**:
  - Builds the project (transpiles src/ to dist/)
  - Injects build information (commit SHA, timestamp, build host)
  - Deploys to GitHub Pages

### 2. Generate Screenshot (`.github/workflows/screenshot.yml`)
- **Triggers**: Manually via "Run workflow" button
- **What it does**:
  - Builds the project
  - Starts a dev server
  - Uses Playwright to capture a screenshot of the PCA visualization
  - Commits the screenshot to the repository

## Local Development

For local development with screenshots:

```bash
# Install Playwright browsers (one-time setup)
npx playwright install chromium

# Build and start dev server
npm start

# In another terminal, capture screenshot
npm run screenshot
```

## Build Information in Footer

The footer displays build information:
- **Commit SHA**: Git commit hash (first 7 characters)
- **Build Host**: "GitHub Actions" (in CI) or "local" (locally)
- **Timestamp**: Build time in ISO format

This information is automatically injected during the GitHub Actions build process.

## Copyright

Copyright (c) 2025 Michael A. Wright

Licensed under the MIT License. See LICENSE file for details.
