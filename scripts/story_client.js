/* Job Market story — shared UI state (guide.html) */
(function () {
  const DATA = window.STORY_DATA;
  const meta = DATA.story_meta;
  const state = {
    selectedSector: DATA.defaultSector || meta.defaultSector,
    comparisonSector: null,
    hoveredSector: null,
    selectedCategory: meta.defaultCategory,
    activeSection: 'national',
  };

  const $ = (id) => document.getElementById(id);

  function allSectors() {
    return Object.keys(DATA.sectors).sort();
  }

  function sectorsInCategory(cat) {
    return (meta.categories[cat] || []).slice().sort();
  }

  function setSelectedSector(name, scroll) {
    if (!DATA.sectors[name]) return;
    state.selectedSector = name;
    if (state.comparisonSector === name) state.comparisonSector = null;
    renderAll();
    if (scroll) {
      $('sector-detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    syncUrl();
  }

  function setComparisonSector(name) {
    if (!name || !DATA.sectors[name] || name === state.selectedSector) {
      state.comparisonSector = null;
    } else {
      state.comparisonSector = name;
    }
    renderCompareChips();
    renderSectorChart();
    renderLegend();
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('sector', state.selectedSector);
    window.history.replaceState({}, '', url);
  }

  function hydrateFromUrl() {
    const p = new URLSearchParams(window.location.search).get('sector');
    if (p && DATA.sectors[p]) state.selectedSector = p;
  }

  function renderTop10() {
    const root = $('top10-list');
    if (!root) return;
    root.innerHTML = '';
    meta.top10Highest.forEach((row) => {
      const el = document.createElement('div');
      el.className = 'sector-rank-row';
      el.dataset.sector = row.sector;
      if (row.sector === state.selectedSector) el.classList.add('selected');
      if (row.sector === state.hoveredSector) el.classList.add('hover');
      el.innerHTML = `
        <span class="rank">${row.rank}</span>
        <span class="name">${row.sector}</span>
        <span class="mini-bar"><span class="mini-bar-fill" style="width:${row.barPct}%"></span></span>
        <span class="idx-val">${row.currentIndex.toFixed(0)}</span>`;
      el.addEventListener('mouseenter', () => {
        state.hoveredSector = row.sector;
        renderTop10();
      });
      el.addEventListener('mouseleave', () => {
        state.hoveredSector = null;
        renderTop10();
      });
      el.addEventListener('click', () => setSelectedSector(row.sector, true));
      root.appendChild(el);
    });
  }

  function renderSidebar() {
    const list = $('sector-nav-list');
    const catSel = $('category-select');
    if (!list || !catSel) return;
    const q = ($('sector-sidebar-search')?.value || '').toLowerCase();
    const items = sectorsInCategory(state.selectedCategory).filter(
      (s) => !q || s.toLowerCase().includes(q)
    );
    list.innerHTML = '';
    items.forEach((name) => {
      const li = document.createElement('li');
      li.className = 'sector-nav-item';
      if (name === state.selectedSector) li.classList.add('selected');
      li.textContent = name;
      li.addEventListener('click', () => setSelectedSector(name, false));
      list.appendChild(li);
    });
  }

  function renderMetrics() {
    const st = meta.sectorStats[state.selectedSector];
    if (!st) return;
    $('metric-baseline').textContent = `${st.currentIndex.toFixed(0)} vs 100`;
    $('metric-volatility').textContent = `Std. dev. ${st.volatilitySince2022}`;
    const titles = st.titles || DATA.titles[state.selectedSector] || '—';
    $('metric-titles').textContent = titles;
    $('drawdown-value').textContent = Math.round(st.drawdown);
    $('sector-detail-title').textContent = state.selectedSector;
    $('heatmap-selected').textContent = state.selectedSector;
  }

  function renderLegend() {
    const leg = $('chart-sector-legend');
    if (!leg) return;
    const cmp = state.comparisonSector
      ? `Compare: ${state.comparisonSector}`
      : 'Compare: click a sector';
    leg.innerHTML = `
      <span class="leg-solid">Current: ${state.selectedSector}</span>
      <span class="leg-dotted">${cmp}</span>`;
  }

  function sectorTrace(name, lineStyle) {
    const series = DATA.sectors[name] || [];
    const months = series.map((d) => d.month);
    const values = series.map((d) => d.index);
    const isSolid = lineStyle === 'solid';
    return {
      x: months,
      y: values,
      type: 'scatter',
      mode: 'lines',
      name: name,
      line: {
        color: isSolid ? '#4A7A5A' : '#9B8BB8',
        width: isSolid ? 2.5 : 2,
        dash: isSolid ? 'solid' : 'dot',
      },
      hovertemplate: `<b>${name}</b><br>%{x}<br>Index: %{y:.1f}<extra></extra>`,
    };
  }

  function renderSectorChart() {
    const st = meta.sectorStats[state.selectedSector];
    const series = DATA.sectors[state.selectedSector] || [];
    if (!series.length) return;
    const months = series.map((d) => d.month);
    const traces = [sectorTrace(state.selectedSector, 'solid')];
    if (state.comparisonSector) {
      traces.push(sectorTrace(state.comparisonSector, 'dot'));
    }
    const yMax = Math.max(
      200,
      (st?.peakIndex || 100) * 1.1,
      state.comparisonSector
        ? meta.sectorStats[state.comparisonSector]?.peakIndex || 0
        : 0
    );
    const shapes = [
      {
        type: 'line',
        x0: months[0],
        x1: months[months.length - 1],
        y0: 100,
        y1: 100,
        line: { dash: 'dash', color: '#999', width: 1 },
      },
      {
        type: 'rect',
        x0: '2024-01',
        x1: months[months.length - 1],
        y0: 0,
        y1: yMax,
        fillcolor: 'rgba(139, 175, 196, 0.1)',
        line: { width: 0 },
        layer: 'below',
      },
    ];
    const annotations = [];
    if (st) {
      annotations.push({
        x: st.peakMonth,
        y: st.peakIndex,
        text: `Peak ~${Math.round(st.peakIndex)}`,
        showarrow: true,
        arrowhead: 2,
        ax: 0,
        ay: -32,
        font: { size: 11 },
      });
      annotations.push({
        x: st.currentMonth,
        y: st.currentIndex,
        text: `Current ~${Math.round(st.currentIndex)}`,
        showarrow: true,
        arrowhead: 2,
        ax: 40,
        ay: 24,
        font: { size: 11 },
      });
    }
    Plotly.react(
      'chart-sector-detail',
      traces,
      {
        title: 'Job Posting Index (Feb 1, 2020 = 100)',
        paper_bgcolor: '#fff',
        plot_bgcolor: '#fff',
        margin: { t: 44, l: 52, r: 20, b: 44 },
        xaxis: { title: '' },
        yaxis: { title: 'Index (Feb 2020 = 100)', range: [0, yMax] },
        shapes,
        annotations,
        showlegend: false,
        hovermode: 'x unified',
      },
      { displayModeBar: false }
    );
  }

  function renderCompareChips() {
    document.querySelectorAll('.compare-chip').forEach((chip) => {
      const s = chip.dataset.sector;
      chip.classList.toggle('active', s === state.comparisonSector);
    });
  }

  function renderCompareSearch() {
    const q = ($('compare-search')?.value || '').toLowerCase();
    const ul = $('compare-results');
    if (!ul) return;
    ul.innerHTML = '';
    if (!q) return;
    allSectors()
      .filter((s) => s !== state.selectedSector && s.toLowerCase().includes(q))
      .slice(0, 8)
      .forEach((name) => {
        const li = document.createElement('li');
        li.textContent = name;
        li.addEventListener('click', () => {
          setComparisonSector(name);
          $('compare-search').value = '';
          ul.innerHTML = '';
        });
        ul.appendChild(li);
      });
  }

  function renderAll() {
    renderTop10();
    renderSidebar();
    renderMetrics();
    renderSectorChart();
    renderLegend();
    renderCompareChips();
  }

  function initAutomationClick() {
    const chart = $('chart-automation');
    if (!chart) return;
    chart.on('plotly_click', (ev) => {
      const pt = ev.points[0];
      if (pt && pt.text) setSelectedSector(pt.text, true);
    });
  }

  function initCategory() {
    const catSel = $('category-select');
    if (!catSel) return;
    Object.keys(meta.categories).forEach((cat) => {
      const o = document.createElement('option');
      o.value = cat;
      o.textContent = cat;
      catSel.appendChild(o);
    });
    catSel.value = state.selectedCategory;
    catSel.addEventListener('change', () => {
      state.selectedCategory = catSel.value;
      renderSidebar();
    });
  }

  function initCompare() {
    document.querySelectorAll('.compare-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const s = chip.dataset.sector;
        setComparisonSector(state.comparisonSector === s ? null : s);
      });
    });
    $('compare-search')?.addEventListener('input', renderCompareSearch);
  }

  function initSidebarSearch() {
    $('sector-sidebar-search')?.addEventListener('input', renderSidebar);
  }

  document.addEventListener('DOMContentLoaded', () => {
    hydrateFromUrl();
    initCategory();
    initCompare();
    initSidebarSearch();
    renderAll();
    initAutomationClick();
  });
})();
