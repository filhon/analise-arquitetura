// Módulo leve para inicializar e atualizar gráficos na aba Resultados
// Usa import dinâmico de chart.js para evitar carregar em ambientes de teste/server

type Candidate = {
  id: string;
  name: string;
  votes: number;
  role: string;
  isElected?: boolean;
};

let Chart: any = null;
let presenceChart: any = null;
let presbyteroBar: any = null;
let diaconoBar: any = null;

export async function initCharts() {
  if (typeof window === "undefined") return;
  if (!Chart) {
    // Import dinâmico para que testes/server não carreguem Chart.js
    const mod = await import("chart.js/auto");
    Chart = mod.default || mod;
  }

  // Inicializar apenas se elementos existirem
  const presenceCtx = document.getElementById(
    "chart-presence"
  ) as HTMLCanvasElement;
  if (presenceCtx && !presenceChart) {
    presenceChart = new Chart(presenceCtx, {
      type: "doughnut",
      data: {
        labels: ["Presentes", "Ausentes"],
        datasets: [
          {
            data: [0, 1],
            backgroundColor: ["#10b981", "#e5e7eb"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function (ctx: any) {
                const v = ctx.parsed;
                return `${ctx.label}: ${v}`;
              },
            },
          },
        },
      },
    });
  }
}

export async function updateCharts(
  results: {
    presbyteros: Candidate[];
    diaconos: Candidate[];
    totalVotes?: number;
  },
  attendance: { totalMembers: number; presentMembers: number }
) {
  // config parameter removed as it was not used
  if (typeof window === "undefined") return;
  if (!Chart) {
    await initCharts();
  }

  // Update presence chart
  if (presenceChart) {
    const present = attendance.presentMembers || 0;
    const total = attendance.totalMembers || 0;
    const absent = Math.max(total - present, 0);
    // Se não houver membros totais registrados, mostramos um estado vazio/fallback
    if (total === 0) {
      presenceChart.data.datasets[0].data = [0, 1];
      presenceChart.data.labels = ["Presentes", "Sem dados"];
    } else {
      presenceChart.data.datasets[0].data = [present, absent];
      presenceChart.data.labels = ["Presentes", "Ausentes"];
    }
    presenceChart.update();
  }

  // Prepare bar charts for presbíteros and diáconos
  const topN = 10;
  const pres = (results.presbyteros || [])
    .slice()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, topN);
  const dia = (results.diaconos || [])
    .slice()
    .sort((a, b) => b.votes - a.votes)
    .slice(0, topN);

  // Render barras e presence abaixo do bloco .results-summary-stats
  const container = document.getElementById("detailed-results-content");
  if (!container) return;

  // Procurar o elemento .results-summary-stats renderizado
  const statsBlock = container.querySelector(".results-summary-stats");
  // Se existir, inserimos os gráficos logo abaixo, senão adicionamos no topo
  const insertionPoint: Element = statsBlock || container;

  // Ensure chart wrappers exist (votes + presence)
  let mainWrapper = document.getElementById("results-charts-wrapper");
  if (!mainWrapper) {
    mainWrapper = document.createElement("div");
    mainWrapper.id = "results-charts-wrapper";
    mainWrapper.style.display = "grid";
    mainWrapper.style.gridTemplateColumns = "1fr";
    mainWrapper.style.gap = "1rem";

    // Presence chart row
    const presenceRow = document.createElement("div");
    presenceRow.className = "chart-row";
    presenceRow.innerHTML = `
      <div class="chart-card" style="max-height:220px;">
        <canvas id="chart-presence" aria-label="Gráfico de presença e quórum" role="img"></canvas>
      </div>
    `;

    // Votes charts row (two columns)
    const votesRow = document.createElement("div");
    votesRow.id = "votes-charts-wrapper";
    votesRow.style.display = "grid";
    votesRow.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
    votesRow.style.gap = "1rem";
    votesRow.innerHTML = `
      <div class="chart-card">
        <canvas id="chart-votes-presbyteros" aria-label="Votos Presbíteros" role="img"></canvas>
      </div>
      <div class="chart-card">
        <canvas id="chart-votes-diaconos" aria-label="Votos Diáconos" role="img"></canvas>
      </div>
    `;

    mainWrapper.appendChild(presenceRow);
    mainWrapper.appendChild(votesRow);

    // Inserimos o wrapper na posição desejada antes de inicializar os charts
    insertionPoint.insertAdjacentElement("afterend", mainWrapper);

    // Após inserir os elementos no DOM, inicializamos o Chart.js e aguardamos
    // para que presenceChart seja criado antes de prosseguir com updates.
    try {
      await initCharts();
    } catch (e) {
      // se falhar, continuamos sem bloquear a UI (por ex. em ambientes de teste)
    }
  }

  // Initialize or update presbytero bar
  const presCtx = document.getElementById(
    "chart-votes-presbyteros"
  ) as HTMLCanvasElement;
  if (presCtx) {
    const labels = pres.map((p) => p.name);
    const data = pres.map((p) => p.votes);

    if (!presbyteroBar) {
      presbyteroBar = new Chart(presCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Votos",
              data,
              backgroundColor: labels.map(() => "#3b82f6"),
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    } else {
      presbyteroBar.data.labels = labels;
      presbyteroBar.data.datasets[0].data = data;
      presbyteroBar.update();
    }
  }

  // Initialize or update diacono bar
  const diaCtx = document.getElementById(
    "chart-votes-diaconos"
  ) as HTMLCanvasElement;
  if (diaCtx) {
    const labels = dia.map((p) => p.name);
    const data = dia.map((p) => p.votes);

    if (!diaconoBar) {
      diaconoBar = new Chart(diaCtx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Votos",
              data,
              backgroundColor: labels.map(() => "#f97316"),
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    } else {
      diaconoBar.data.labels = labels;
      diaconoBar.data.datasets[0].data = data;
      diaconoBar.update();
    }
  }
}
