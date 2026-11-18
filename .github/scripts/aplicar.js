// Lê o pedido (issue) enviado pelo site e grava em extras.json
const fs = require('fs');
const CIDADES = ['cwb', 'foz', 'rio', 'out'];
const body = process.env.BODY || '';
const m = body.match(/```json\s*([\s\S]*?)```/);
if (!m) { console.error('Pedido sem bloco JSON.'); process.exit(1); }
const p = JSON.parse(m[1]);
const lista = fs.existsSync('extras.json') ? JSON.parse(fs.readFileSync('extras.json', 'utf8') || '[]') : [];
const txt = (v, max) => String(v || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
let msg;
if (p.acao === 'adicionar') {
  const c = p.corrida || {};
  const r = {
    id: txt(c.id, 20).replace(/[^a-z0-9]/gi, '') || Date.now().toString(36),
    n: txt(c.n, 120), d: txt(c.d, 10), c: CIDADES.includes(c.c) ? c.c : 'out',
    km: txt(c.km, 120), org: txt(c.org, 160), ct: txt(c.ct, 200), s: c.s === 'prev' ? 'prev' : 'ok'
  };
  if (!r.n || !/^2027-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(r.d)) { console.error('Nome ou data inválidos.'); process.exit(1); }
  if (lista.some(x => x.id === r.id)) { console.error('Essa corrida já foi adicionada.'); process.exit(1); }
  lista.push(r);
  msg = `Corrida "${r.n}" adicionada em ${r.d.split('-').reverse().join('/')}.`;
} else if (p.acao === 'remover') {
  const i = lista.findIndex(x => x.id === String(p.id));
  if (i < 0) { console.error('Corrida não encontrada.'); process.exit(1); }
  msg = `Corrida "${lista[i].n}" removida.`;
  lista.splice(i, 1);
} else { console.error('Ação desconhecida.'); process.exit(1); }
lista.sort((a, b) => a.d.localeCompare(b.d));
fs.writeFileSync('extras.json', JSON.stringify(lista, null, 2) + '\n');
fs.writeFileSync(process.env.RUNNER_TEMP + '/msg.txt', msg);
console.log(msg);
