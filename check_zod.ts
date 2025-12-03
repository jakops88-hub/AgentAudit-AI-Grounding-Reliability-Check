import * as z from 'zod';
console.log(Object.keys(z));
try {
  const s = z.string();
  s.parse(123);
} catch (e) {
  if (e instanceof z.ZodError) {
    console.log('ZodError keys:', Object.keys(e));
    console.log('Has errors?', 'errors' in e);
    console.log('Has issues?', 'issues' in e);
  }
}
