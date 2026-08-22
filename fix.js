const fs = require('fs');
const path = require('path');
function walk(dir, cb) {
  fs.readdirSync(dir).forEach(file => {
    let p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) walk(p, cb);
    else cb(p);
  });
}
walk('src/app', (p) => {
  if (p.endsWith('.ts') || p.endsWith('.tsx')) {
    let c = fs.readFileSync(p, 'utf8');
    if (c.includes('prisma.user.findFirst')) {
      let orig = c;
      if (!c.includes('requireUser')) {
        c = 'import { requireUser } from "@/lib/auth";\n' + c;
      }
      c = c.replace(/const user = await prisma\.user\.findFirst\(\{\s*include:\s*\{\s*profile:\s*true\s*\},?\s*\}\);/g, 'const user = await requireUser(true);');
      c = c.replace(/const user = await prisma\.user\.findFirst\(\);/g, 'const user = await requireUser();');
      
      // Also remove any lines checking if (!user) return/throw since requireUser handles it
      c = c.replace(/if \(!user\).*?(throw new Error|return).*?;/g, '');
      
      if (c !== orig) {
        fs.writeFileSync(p, c);
        console.log('Fixed ' + p);
      }
    }
  }
});
