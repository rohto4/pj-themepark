import { deriveFinaleRecipe, type GuestState } from './guest-state';

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function motifRows(motifs: readonly string[]) {
  return motifs
    .slice(0, 8)
    .map((motif, index) => {
      const y = 1050 + index * 56;
      const indexLabel = String(index + 1).padStart(2, '0');
      return `<g transform="translate(128 ${y})"><text class="index">${indexLabel}</text><line x1="48" x2="876" y1="-9" y2="-9"/><text class="motif" x="68">${escapeXml(motif)}</text></g>`;
    })
    .join('');
}

export function nightChartFilename(state: GuestState) {
  return `morrowlight-${state.nightId}.svg`;
}

export function buildNightChartSvg(state: GuestState) {
  const finale = state.finale ?? deriveFinaleRecipe(state);
  const title = escapeXml(finale.title);
  const nightId = escapeXml(state.nightId);
  const motifs = motifRows(finale.motifIds);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" role="img" aria-labelledby="title description">
  <title id="title">Morrowlight Night Chart: ${title}</title>
  <desc id="description">A personal illustrated record of one journey through Morrowlight.</desc>
  <defs>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0v32" fill="none" stroke="#171532" stroke-opacity=".08"/></pattern>
    <radialGradient id="glow"><stop stop-color="#ffe0a0" stop-opacity=".8"/><stop offset="1" stop-color="#f2a75f" stop-opacity="0"/></radialGradient>
  </defs>
  <style>
    text{font-family:Georgia,serif;fill:#171532}.label,.index{font-family:Arial,sans-serif;font-size:17px;font-weight:700;letter-spacing:5px;text-transform:uppercase}.title{font-size:104px;font-style:italic}.motif{font-family:Arial,sans-serif;font-size:26px}.night{font-family:Arial,sans-serif;font-size:18px;letter-spacing:4px}line{stroke:#171532;stroke-opacity:.28}
  </style>
  <rect width="1200" height="1600" fill="#fff8dc"/>
  <rect width="1200" height="1600" fill="url(#grid)"/>
  <rect x="56" y="56" width="1088" height="1488" fill="none" stroke="#171532" stroke-width="2"/>
  <text class="label" x="128" y="150">MORROWLIGHT · NIGHT CHART</text>
  <line x1="128" x2="1072" y1="184" y2="184"/>
  <text class="title" x="128" y="330">${title}</text>
  <text class="night" x="132" y="394">${nightId}</text>
  <g transform="translate(600 700)">
    <circle r="280" fill="none" stroke="#171532" stroke-opacity=".2" stroke-dasharray="4 16"/>
    <circle r="195" fill="none" stroke="#171532" stroke-opacity=".32"/>
    <circle r="118" fill="url(#glow)"/>
    <path d="M0-112 24-24 112 0 24 24 0 112-24 24-112 0-24-24Z" fill="#171532"/>
    <circle r="22" fill="#fff8dc"/>
    <path d="M-230-108 190 147M-172 188 228-132" fill="none" stroke="#f2a75f" stroke-width="3"/>
  </g>
  <text class="label" x="128" y="982">TRACES THE PARK REMEMBERED</text>
  ${motifs}
  <text class="night" x="128" y="1500">THE PARK NOTICED HOW YOU PLAYED.</text>
  <text class="label" x="1072" y="1500" text-anchor="end">ADMIT ONE NIGHT</text>
</svg>`;
}
