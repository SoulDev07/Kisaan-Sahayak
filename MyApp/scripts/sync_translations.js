const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'languages_json');
const enPath = path.join(dir, 'en.json');

function flatten(obj, prefix = '') {
  const res = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(res, flatten(val, newKey));
    } else {
      res[newKey] = val;
    }
  }
  return res;
}

function unflatten(flat) {
  const res = {};
  for (const k of Object.keys(flat)) {
    const parts = k.split('.');
    let cur = res;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        cur[p] = flat[k];
      } else {
        cur[p] = cur[p] || {};
        cur = cur[p];
      }
    });
  }
  return res;
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enFlat = flatten(en);

const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json');
let totalAdded = 0;
const report = {};

for (const f of files) {
  const p = path.join(dir, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const flat = flatten(data);
  const missing = [];
  for (const key of Object.keys(enFlat)) {
    if (!(key in flat)) {
      flat[key] = enFlat[key];
      missing.push(key);
    }
  }
  if (missing.length) {
    const updated = unflatten(flat);
    fs.writeFileSync(p, JSON.stringify(updated, null, 2), 'utf8');
    report[f] = missing;
    totalAdded += missing.length;
  }
}

console.log('Sync complete. Total keys added:', totalAdded);
for (const f of Object.keys(report)) {
  console.log(`File: ${f} - keys added: ${report[f].length}`);
}
if (totalAdded === 0) console.log('No changes needed.');
