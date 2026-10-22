import { writeFile } from "node:fs/promises";
import type { KanbanEntry } from "./types.js";
import { LANES } from "./types.js";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function renderKanbanHtml(entries: KanbanEntry[], outputPath: string): Promise<void> {
  const lanes = LANES;
  const cardsByLane = new Map(lanes.map((l) => [l, entries.filter((e) => e.lane === l)]));

  const columns = lanes
    .map((lane) => {
      const cards = (cardsByLane.get(lane) ?? [])
        .map(
          (e) => `<div class="card" draggable="true" data-id="${esc(e.id)}" data-lane="${esc(e.lane)}" data-priority="${e.priority}" data-date="${esc(e.createdAt)}" data-tags="${esc((e.tags ?? []).join(","))}">
  <div class="card-head"><span class="badge">P${e.priority}</span><span class="status">${esc(e.status)}</span></div>
  <div class="title">${esc(e.title)}</div>
  <div class="summary">${esc(e.summary)}</div>
</div>`
        )
        .join("\n");
      return `<section class="lane" data-lane="${esc(lane)}"><h2>${esc(lane)}</h2><div class="cards">${cards}</div></section>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kanban Board</title>
<style>
body{font-family:system-ui,sans-serif;margin:0;padding:1rem;background:#f5f5f5}
.board{display:flex;gap:1rem;overflow-x:auto}
.lane{flex:1;min-width:220px;background:#fff;border-radius:8px;padding:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.1)}
.lane h2{margin:.5rem;font-size:1rem}
.cards{min-height:60px}
.card{background:#fafafa;border:1px solid #ddd;border-radius:6px;padding:.5rem;margin:.5rem 0;cursor:grab}
.card-head{display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:.25rem}
.badge{background:#3b82f6;color:#fff;border-radius:4px;padding:0 .25rem}
.status{color:#666}
.title{font-weight:600;margin-bottom:.25rem}
.summary{font-size:.85rem;color:#444}
.controls{margin-bottom:1rem;display:flex;gap:.5rem;flex-wrap:wrap}
</style>
</head>
<body>
<h1>Kanban Board</h1>
<div class="controls">
  <select id="laneFilter"><option value="">All lanes</option>${lanes.map((l) => `<option value="${esc(l)}">${esc(l)}</option>`).join("")}</select>
  <select id="sort"><option value="priority">Priority</option><option value="date">Date</option><option value="name">Name</option></select>
</div>
<div class="board">${columns}</div>
<script>
const board=document.querySelector('.board');
function applyFilter(){
  const lf=document.getElementById('laneFilter').value;
  document.querySelectorAll('.lane').forEach(lane=>{
    lane.style.display = (!lf || lane.dataset.lane===lf)?'':'none';
  });
}
function applySort(){
  const key=document.getElementById('sort').value;
  document.querySelectorAll('.lane').forEach(lane=>{
    const c=lane.querySelector('.cards');
    const cards=[...c.querySelectorAll('.card')];
    cards.sort((a,b)=>{
      if(key==='priority') return (+a.dataset.priority)-(+b.dataset.priority);
      if(key==='date') return a.dataset.date.localeCompare(b.dataset.date);
      return a.querySelector('.title').textContent.localeCompare(b.querySelector('.title').textContent);
    });
    cards.forEach(card=>c.appendChild(card));
  });
}
document.getElementById('laneFilter').addEventListener('change',applyFilter);
document.getElementById('sort').addEventListener('change',applySort);
let dragged=null;
document.addEventListener('dragstart',e=>{if(e.target.classList.contains('card')){dragged=e.target;e.target.style.opacity='0.5';}});
document.addEventListener('dragend',e=>{if(e.target.classList.contains('card')){e.target.style.opacity='1';dragged=null;}});
document.querySelectorAll('.cards').forEach(c=>{
  c.addEventListener('dragover',e=>e.preventDefault());
  c.addEventListener('drop',e=>{e.preventDefault();if(dragged){c.appendChild(dragged);dragged.dataset.lane=c.closest('.lane').dataset.lane;}});
});
</script>
</body>
</html>`;
  await writeFile(outputPath, html, "utf8");
}