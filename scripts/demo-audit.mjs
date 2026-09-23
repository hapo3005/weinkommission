import { runDemoAudit } from '../src/lib/demoAudit.js';

const audit = runDemoAudit();

for (const check of audit.checks) {
  const mark = check.pass ? '✓' : '✗';
  console.log(`${mark} ${check.label}: ${check.detail}`);
}

console.log(`\nDemo audit: ${audit.passed}/${audit.total} checks passed.`);

if (!audit.ok) {
  console.error(`Demo audit failed with ${audit.failed} issue(s).`);
  process.exit(1);
}
