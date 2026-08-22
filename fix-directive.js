const fs = require('fs');
const files = [
  'src/app/actions/budget.ts',
  'src/app/actions/cycle.ts',
  'src/app/actions/friends.ts',
  'src/app/actions/goal.ts',
  'src/app/actions/recurring.ts',
  'src/app/actions/transaction.ts'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace('import { requireUser } from "@/lib/auth";\n"use server";', '"use server";\nimport { requireUser } from "@/lib/auth";');
  fs.writeFileSync(f, c);
});
