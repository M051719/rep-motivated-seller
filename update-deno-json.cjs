// update-deno-json.js
const fs = require('fs');
const path = require('path');

const denoJsonPath = path.join(process.cwd(), 'deno.json');
const newImports = {
  "supabase": "npm:@supabase/supabase-js@2.45.4",
  "lodash": "npm:lodash@4.17.21",
  "@std/path": "jsr:@std/path@1.0.8"
};

let denoConfig = {};
if (fs.existsSync(denoJsonPath)) {
  denoConfig = JSON.parse(fs.readFileSync(denoJsonPath, 'utf8'));
}

denoConfig.imports = { ...(denoConfig.imports || {}), ...newImports };

fs.writeFileSync(denoJsonPath, JSON.stringify(denoConfig, null, 2));
console.log('Updated deno.json imports!');