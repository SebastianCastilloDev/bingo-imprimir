import "./style.css";
import { generateBingoPDF } from "./pdf";

document.querySelector("#app").innerHTML = `
  <div class="container">
    <h1>Bingo Generator</h1>
    
    <div class="card">
      <form id="bingo-form">
        <div class="form-group">
          <label for="quantity">Cantidad de Cartones</label>
          <input type="number" id="quantity" name="quantity" min="1" max="500" value="20" required>
        </div>
        
        <div class="form-group">
          <label for="layout">Cartones por Página (A4)</label>
          <select id="layout" name="layout">
            <option value="4">4 cartones por página</option>
            <option value="6">6 cartones por página</option>
          </select>
        </div>
        
        <button type="submit" id="generate-btn">Generar PDF</button>
      </form>
    </div>
  </div>
`;

document.getElementById("bingo-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const quantity = parseInt(document.getElementById("quantity").value, 10);
  const layout = parseInt(document.getElementById("layout").value, 10);

  const btn = document.getElementById("generate-btn");
  const originalText = btn.innerText;

  btn.disabled = true;
  btn.innerText = "Generando...";

  try {
    generateBingoPDF(quantity, layout);
  } catch (error) {
    console.error(error);
    alert("Ocurrió un error al generar el PDF.");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
});
