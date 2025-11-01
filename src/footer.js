/**
 * Footer component with copyright, GitHub link, and build information
 * Copyright (c) 2025 Michael A. Wright
 */

/**
 * Creates and appends a footer to the document body
 * Build info is injected at build time via environment variables
 */
function createFooter() {
  const footer = document.createElement('footer');
  footer.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid #e0e0e0;
    padding: 8px 16px;
    font-size: 12px;
    color: #666;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  `;

  // Left side: Copyright
  const copyright = document.createElement('div');
  copyright.textContent = 'Copyright (c) 2025 Michael A. Wright';

  // Center: GitHub link
  const github = document.createElement('a');
  github.href = 'https://github.com/wrightmikea/dimensionality-reduction';
  github.target = '_blank';
  github.rel = 'noopener noreferrer';
  github.textContent = 'GitHub';
  github.style.cssText = 'color: #0366d6; text-decoration: none;';
  github.onmouseover = () => github.style.textDecoration = 'underline';
  github.onmouseout = () => github.style.textDecoration = 'none';

  // Right side: Build info
  const buildInfo = document.createElement('div');
  buildInfo.style.cssText = 'font-family: monospace; font-size: 11px; color: #999;';

  // These will be replaced at build time by the GitHub Actions workflow
  const commitSha = typeof BUILD_COMMIT !== 'undefined' ? BUILD_COMMIT : 'dev';
  const buildHost = typeof BUILD_HOST !== 'undefined' ? BUILD_HOST : 'local';
  const buildTime = typeof BUILD_TIMESTAMP !== 'undefined' ? BUILD_TIMESTAMP : new Date().toISOString();

  buildInfo.textContent = `Build: ${commitSha.substring(0, 7)} | ${buildHost} | ${buildTime}`;
  buildInfo.title = `Full SHA: ${commitSha}\nHost: ${buildHost}\nTimestamp: ${buildTime}`;

  footer.appendChild(copyright);
  footer.appendChild(github);
  footer.appendChild(buildInfo);

  // Add footer to body when DOM is ready
  if (document.body) {
    document.body.appendChild(footer);
    // Add padding to body to prevent content from being hidden behind footer
    document.body.style.paddingBottom = '40px';
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(footer);
      document.body.style.paddingBottom = '40px';
    });
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFooter);
  } else {
    createFooter();
  }
}
