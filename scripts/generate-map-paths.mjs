/**
 * Script para gerar SVG paths reais das cidades do ABC Paulista
 * Fonte: OpenStreetMap via Overpass API
 * 
 * Rode com: node scripts/generate-map-paths.mjs
 */

// IDs OSM das relações administrativas de cada cidade (admin_level=8)
// Fonte: https://www.openstreetmap.org/relation/
const CITIES = [
  { name: 'São Bernardo do Campo', osmId: 297216 },
  { name: 'Santo André',           osmId: 297392 },
  { name: 'São Caetano do Sul',    osmId: 297395 },
  { name: 'Mauá',                  osmId: 297211 },
  { name: 'Ribeirão Pires',        osmId: 297221 },
  { name: 'Diadema',               osmId: 297196 },
  { name: 'Rio Grande da Serra',   osmId: 297218 },
  { name: 'Suzano',                osmId: 297390 },
];

// Tamanho do viewBox SVG
const SVG_SIZE = 100;

function coordsToSvgPath(coords, bbox) {
  const { minLon, maxLon, minLat, maxLat } = bbox;
  const lonRange = maxLon - minLon;
  const latRange = maxLat - minLat;
  const scale = Math.max(lonRange, latRange);
  const padX = (scale - lonRange) / 2;
  const padY = (scale - latRange) / 2;

  const points = coords.map(([lon, lat]) => {
    const x = ((lon - minLon + padX) / scale) * SVG_SIZE;
    // Inverte Y porque SVG tem Y crescendo para baixo
    const y = ((maxLat + padY - lat) / scale) * SVG_SIZE;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return `M${points.join(' L')} Z`;
}

async function fetchBoundary(city) {
  const url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city.name)}&state=S%C3%A3o%20Paulo&country=Brazil&format=json&polygon_geojson=1`;
  
  console.log(`Buscando ${city.name}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'MotorzABCMapGenerator/1.0 (contato@motorz.com.br)',
      'Accept-Language': 'pt-BR',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} para ${city.name}`);
  
  const dataList = await res.json();
  const data = dataList[0];
  
  if (!data || !data.geojson || !data.geojson.coordinates) {
    throw new Error(`Sem coordenadas GeoJSON para ${city.name}`);
  }

  // Extrai as coordenadas (trata Polygon ou MultiPolygon)
  const allCoords = [];
  const coordsData = data.geojson.type === 'MultiPolygon' 
    ? data.geojson.coordinates.flat(1) 
    : data.geojson.coordinates;

  for (const ring of coordsData) {
    for (const pt of ring) {
      if (Array.isArray(pt) && pt.length === 2) {
        allCoords.push(pt);
      }
    }
  }

  if (allCoords.length === 0) throw new Error(`Coordenadas vazias para ${city.name}`);

  // Bounding box
  const lons = allCoords.map(c => c[0]);
  const lats = allCoords.map(c => c[1]);
  const bbox = {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  };

  // Simplifica pegando 1 ponto a cada N para não sobrecarregar o SVG e ter um visual "clean/tech"
  const step = Math.max(1, Math.floor(allCoords.length / 100));
  const simplified = allCoords.filter((_, i) => i % step === 0);

  return {
    name: city.name,
    path: coordsToSvgPath(simplified, bbox),
    bbox,
    totalPoints: allCoords.length,
    usedPoints: simplified.length,
  };
}

async function main() {
  const results = [];

  for (const city of CITIES) {
    try {
      const result = await fetchBoundary(city);
      results.push(result);
      console.log(`  ✓ ${city.name} — ${result.usedPoints} pontos usados de ${result.totalPoints}`);
      // Delay para não sobrecarregar a API
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`  ✗ Erro em ${city.name}:`, err.message);
    }
  }

  const fs = await import('fs');
  const fileContent = 'export const mapPaths = [\n' + results.map(r => `  "${r.path}", // ${r.name}`).join('\n') + '\n];\n';
  fs.writeFileSync('paths.js', fileContent);
  console.log('Salvo em paths.js');
}

main().catch(console.error);
