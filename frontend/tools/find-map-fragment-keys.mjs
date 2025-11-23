import fs from 'fs';
import path from 'path';
import { sync as globSync } from 'glob';
import { parse } from '@babel/parser';
const root = process.cwd();
const searchDir = path.join(root, '');

const patterns = ['**/*.tsx', '**/*.jsx', '**/*.ts', '**/*.js'];

function findFiles() {
  const files = [];
  for (const p of patterns) {
    const matches = globSync(p, { cwd: searchDir, ignore: ['**/node_modules/**', '**/.next/**', '**/.git/**'] });
    for (const m of matches) files.push(path.join(searchDir, m));
  }
  return files;
}

function readFile(file) {
  return fs.readFileSync(file, 'utf8');
}

function reportMatches(matches) {
  if (matches.length === 0) {
    console.log('✅ Aucun cas trouvé de `.map` retournant un fragment JSX sans clé.');
    return;
  }

  console.log(`⚠️ ${matches.length} occurrence(s) trouvée(s):`);
  for (const m of matches) {
    console.log(`- ${m.file}:${m.line}:${m.column} — param='${m.paramName || ''}' candidateKey='${m.candidateKey || ''}'`);
  }
}

function analyzeFile(file) {
  const code = readFile(file);
  let ast;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'decorators-legacy'],
    });
  } catch (err) {
    return [];
  }

  const matches = [];

  // simple recursive walker
  function walk(node, cb) {
    if (!node || typeof node !== 'object') return;
    cb(node);
    for (const key of Object.keys(node)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) walk(c, cb);
      } else if (child && typeof child === 'object' && child.type) {
        walk(child, cb);
      }
    }
  }

  function findReturnedJSXInFunction(fnNode) {
    if (!fnNode) return null;
    if (fnNode.body && (fnNode.body.type === 'JSXFragment' || fnNode.body.type === 'JSXElement')) return fnNode.body;
    let found = null;
    walk(fnNode.body, (n) => {
      if (found) return;
      if (n.type === 'ReturnStatement' && n.argument && (n.argument.type === 'JSXFragment' || n.argument.type === 'JSXElement')) {
        found = n.argument;
      }
    });
    return found;
  }

  walk(ast, (node) => {
    if (node.type === 'CallExpression' && node.callee && node.callee.type === 'MemberExpression') {
      const prop = node.callee.property;
      if (!prop || prop.type !== 'Identifier' || prop.name !== 'map') return;
      const args = node.arguments || [];
      if (args.length === 0) return;
      const cb = args[0];
      if (!cb || (cb.type !== 'ArrowFunctionExpression' && cb.type !== 'FunctionExpression')) return;

      const returnedNode = findReturnedJSXInFunction(cb);
      if (!returnedNode) return;
      if (returnedNode.type === 'JSXFragment') {
        let paramName = null;
        if (cb.params && cb.params.length > 0) {
          const p0 = cb.params[0];
          if (p0.type === 'Identifier') paramName = p0.name;
        }

        let candidateKey = null;
        walk(returnedNode, (n) => {
          if (candidateKey) return;
          if (n.type === 'MemberExpression' && n.object && n.object.type === 'Identifier' && n.property && n.property.type === 'Identifier') {
            if (n.object.name === paramName) {
              const propName = n.property.name;
              if (['id', 'gameId', 'slug', 'uuid'].includes(propName)) {
                candidateKey = `${paramName}.${propName}`;
              } else if (!candidateKey) {
                candidateKey = `${paramName}.${propName}`;
              }
            }
          }
        });

        const loc = returnedNode.loc ? returnedNode.loc.start : (cb.loc ? cb.loc.start : { line: 0, column: 0 });
        matches.push({ file, line: loc.line, column: loc.column, paramName, candidateKey });
      }
    }
  });

  return matches;
}

async function main() {
  const files = findFiles().filter(f => f.startsWith(path.join(process.cwd(), 'app')) || f.startsWith(path.join(process.cwd(), 'components')) || f.startsWith(path.join(process.cwd(), 'pages')) || f.includes('/frontend/') );
  // ensure unique
  const uniqueFiles = Array.from(new Set(files));
  const allMatches = [];
  for (const f of uniqueFiles) {
    const ms = analyzeFile(f);
    for (const m of ms) allMatches.push(m);
  }

  const shouldFix = process.argv.includes('--fix');

  if (!shouldFix) {
    reportMatches(allMatches);
    return;
  }

  // --fix : apply simple textual fixes when candidateKey is available
  const fixes = [];
  for (const m of allMatches) {
    if (!m.candidateKey || !m.paramName) continue;
    try {
      const content = fs.readFileSync(m.file, 'utf8');
      const lines = content.split(/\r?\n/);
      const startLine = Math.max(0, m.line - 1);
      // compute char index of startLine and column
      let index = 0;
      for (let i = 0; i < startLine; i++) index += lines[i].length + 1;
      index += m.column || 0;

      // find opening fragment '<>' after index
      const openPos = content.indexOf('<>', index);
      if (openPos === -1) {
        // sometimes fragment has attributes (unlikely) or whitespace, try '< >' fallback
        // ignore
        continue;
      }

      // find closing fragment '</>' after openPos
      const closePos = content.indexOf('</>', openPos + 2);
      if (closePos === -1) continue;

      const keyExpr = m.candidateKey;

      // prepare new content: replace open and close with React.Fragment forms
      let newContent = content.slice(0, openPos) + `<React.Fragment key={${keyExpr}}>` + content.slice(openPos + 2);
      // adjust closePos due to added length
      const addedLen = `<React.Fragment key={${keyExpr}}>` .length - 2;
      const adjustedClose = closePos + addedLen;
      newContent = newContent.slice(0, adjustedClose) + `</React.Fragment>` + newContent.slice(adjustedClose + 3);

      // ensure React import exists; if not, add at top after other imports
      const importReactRegex = /(^|\n)import\s+React(?:,|\s+\*\s+as\s+React|\s+from)?/m;
      if (!importReactRegex.test(newContent)) {
        // find last import position
        const importMatches = [...newContent.matchAll(/^import .*$/gm)];
        let insertPos = 0;
        if (importMatches.length > 0) {
          const last = importMatches[importMatches.length - 1];
          insertPos = last.index + last[0].length;
          newContent = newContent.slice(0, insertPos) + '\nimport React from "react";' + newContent.slice(insertPos);
        } else {
          newContent = 'import React from "react";\n' + newContent;
        }
      }

      fs.writeFileSync(m.file, newContent, 'utf8');
      fixes.push(m.file);
      console.log(`✔ Fixed ${m.file} (key: ${keyExpr})`);
    } catch (err) {
      console.error('Failed to fix', m.file, err.message || err);
    }
  }

  if (fixes.length === 0) {
    console.log('Aucune correction automatique effectuée (pas de candidateKey détectée ou échec).');
  } else {
    console.log(`Corrections appliquées à ${fixes.length} fichier(s). Pense à relancer le serveur dev.`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
