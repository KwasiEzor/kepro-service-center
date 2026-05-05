export function validateEnv() {
  const required = ['GEMINI_API_KEY'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nCreate .env file with:');
    missing.forEach((key) => console.error(`${key}=your_value_here`));
    process.exit(1);
  }

  console.log('✅ Environment validated');
}
