import "./style.css";
import { getPaperSize, PAPER_SIZES } from "./modules/bingo/domain/paper-sizes";
import { exportToPDF } from "./modules/export/infrastructure/pdf-exporter";

let state = {
  quantity: 20,
  layout: 4,
  paperSizeId: "A4",
};

function render() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <div class="container">
      <header>
        <h1>Bingo Generator</h1>
        <p class="subtitle">Generación profesional de cartones</p>
      </header>
      
      <div class="card">
        <section class="config-section">
          <label>1. Tamaño de Papel</label>
          <div class="button-group size-selector">
            ${Object.values(PAPER_SIZES)
              .map(
                (size) => `
              <button 
                class="btn-toggle ${state.paperSizeId === size.id ? "active" : ""}" 
                data-size-id="${size.id}"
              >
                ${size.name}
              </button>
            `,
              )
              .join("")}
          </div>
        </section>

        <section class="config-section">
          <label>2. Cartones por Página</label>
          <div class="button-group layout-selector">
            <button class="btn-toggle ${state.layout === 4 ? "active" : ""}" data-layout="4">4 Cartones</button>
            <button class="btn-toggle ${state.layout === 6 ? "active" : ""}" data-layout="6">6 Cartones</button>
          </div>
        </section>

        <section class="config-section">
          <label for="quantity">3. Cantidad Total de Cartones</label>
          <input type="number" id="quantity" min="1" max="1000" value="${state.quantity}">
        </section>
        
        <button id="generate-btn" class="btn-primary">Generar y Descargar PDF</button>
      </div>
      
      <footer>
        <p>Bingo Bounded Context • DDD Architecture</p>
      </footer>
    </div>
  `;

  attachEventListeners();
}

function attachEventListeners() {
  // Size selection
  document.querySelectorAll(".size-selector button").forEach((btn) => {
    btn.onclick = () => {
      state.paperSizeId = btn.dataset.sizeId;
      render();
    };
  });

  // Layout selection
  document.querySelectorAll(".layout-selector button").forEach((btn) => {
    btn.onclick = () => {
      state.layout = parseInt(btn.dataset.layout, 10);
      render();
    };
  });

  // Quantity input
  document.getElementById("quantity").onchange = (e) => {
    state.quantity = parseInt(e.target.value, 10);
  };

  // Generate action
  document.getElementById("generate-btn").onclick = async () => {
    const btn = document.getElementById("generate-btn");
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generando...';

    try {
      const paperSize = getPaperSize(state.paperSizeId);
      // Simular un pequeño delay para feedback visual
      await new Promise((r) => setTimeout(r, 800));
      exportToPDF(state.quantity, state.layout, paperSize);
    } catch (e) {
      console.error(e);
      alert("Error generando el documento");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  };
}

render();
