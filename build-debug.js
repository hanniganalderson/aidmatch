const { execSync } = require('child_process');

try {
  console.log('Starting build with verbose output...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error.message);
  process.exit(1);
} 