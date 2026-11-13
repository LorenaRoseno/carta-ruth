/* ========== 1. ELEMENTOS DO CANVA ========== */
// Por enquanto, usamos símbolos como exemplo.
// Quando você baixar seus PNGs do Canva, coloque-os na pasta assets/
// e escreva o caminho no campo "imagem".
// Exemplo: { simbolo: "⚡", imagem: "assets/raio.png" }
const elementosMagicos = [
  { simbolo: "⚡", imagem: "" },
  { simbolo: "✦", imagem: "" },
  { simbolo: "🦉", imagem: "" },
  { simbolo: "🧹", imagem: "" },
  { simbolo: "✨", imagem: "" },
  { simbolo: "🔑", imagem: "" },
  { simbolo: "✧", imagem: "" },
  { simbolo: "📜", imagem: "" }
];

const fundoMagico = document.querySelector("#fundo-magico");

function criarElementosFlutuantes() {
  const quantidade = 25;

  for (let i = 0; i < quantidade; i++) {
    const modelo = elementosMagicos[i % elementosMagicos.length];
    const elemento = document.createElement("span");
    elemento.className = "elemento-flutuante";

    // Cada símbolo tem posição, tamanho e velocidade próprios.
    elemento.style.setProperty("--posicao", `${Math.random() * 96}%`);
    elemento.style.setProperty("--tamanho", `${18 + Math.random() * 27}px`);
    elemento.style.setProperty("--duracao", `${17 + Math.random() * 18}s`);
    elemento.style.setProperty("--atraso", `${-Math.random() * 35}s`);
    elemento.style.setProperty("--desvio", `${-60 + Math.random() * 120}px`);
    elemento.style.setProperty("--opacidade", `${0.10 + Math.random() * 0.20}`);


    if (modelo.imagem) {
      const imagem = document.createElement("img");
      imagem.src = modelo.imagem;
      imagem.alt = ""; // Decorativo: não precisa ser lido por leitor de tela.
      elemento.appendChild(imagem);
    } else {
      elemento.textContent = modelo.simbolo;
    }

    fundoMagico.appendChild(elemento);
  }
}

/* ========== 2. ABRIR E FECHAR A CARTA ========== */
const inicio = document.querySelector("#inicio");
const leitura = document.querySelector("#leitura");
const botaoAbrir = document.querySelector("#abrir-carta");
const botaoFechar = document.querySelector("#fechar-carta");
const movimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");


/* ========== MÚSICA DA CARTA ========== */

const musicaCarta = new Audio(
  "assets/song/Ninguém-Explica-Deus.mp3"
);

musicaCarta.preload = "auto";
musicaCarta.loop = true;
musicaCarta.volume = 0.3;


let estado = "fechada";


function abrirCarta() {
  if (estado !== "fechada") return;


  musicaCarta.currentTime = 0;
  musicaCarta.volume = 0;

  musicaCarta.play().catch((erro) => {
    console.warn("Não foi possível iniciar a música:", erro);
  });


  estado = "abrindo";
  botaoAbrir.disabled = true;

  // Verifica se o envelope já estava virado.
  const jaVirado = inicio.classList.contains("virado");

  // Garante que o verso apareça antes da abertura.
  inicio.classList.add("virado");

  const tempoGiro = movimentoReduzido.matches || jaVirado
    ? 0
    : 850;

  window.setTimeout(() => {
    // Abre a aba e retira o papel.
    inicio.classList.add("abrindo");

    const tempoAbertura = movimentoReduzido.matches
      ? 0
      : 950;

    window.setTimeout(() => {
      inicio.hidden = true;
      leitura.hidden = false;
      leitura.classList.add("entrando");


      musicaCarta.currentTime = 0;
      musicaCarta.volume = 0.3;


      estado = "aberta";
      atualizarPagina(0);
      botaoFechar.focus();
    }, tempoAbertura);

  }, tempoGiro);
}


function fecharCarta() {
  if (estado !== "aberta") return;

  musicaCarta.pause();
  musicaCarta.currentTime = 0;

  leitura.hidden = true;
  leitura.classList.remove("entrando");
  inicio.hidden = false;
  inicio.classList.remove("abrindo", "virado");
  botaoAbrir.setAttribute("aria-label", "Abrir a carta");
  botaoAbrir.disabled = false;
  estado = "fechada";
  botaoAbrir.focus();
}


/* ========== INTERAÇÃO COM O ENVELOPE ========== */

// Mouse: vira ao entrar e retorna ao sair.
botaoAbrir.addEventListener("pointerenter", (evento) => {
  if (evento.pointerType === "mouse" && estado === "fechada") {
    inicio.classList.add("virado");
  }
});

botaoAbrir.addEventListener("pointerleave", (evento) => {
  if (evento.pointerType === "mouse" && estado === "fechada") {
    inicio.classList.remove("virado");
  }
});

// Toque: identifica quando o dedo desliza.
let inicioToqueX = null;
let deslizou = false;

botaoAbrir.addEventListener("touchstart", (evento) => {
  inicioToqueX = evento.touches[0].clientX;
  deslizou = false;
}, { passive: true });

botaoAbrir.addEventListener("touchmove", (evento) => {
  if (inicioToqueX === null || estado !== "fechada") return;

  const distancia = Math.abs(
    evento.touches[0].clientX - inicioToqueX
  );

  if (distancia >= 25) {
    inicio.classList.add("virado");
    deslizou = true;
  }
}, { passive: true });

botaoAbrir.addEventListener("touchend", () => {
  inicioToqueX = null;
}, { passive: true });

// Clique: abre a carta.
// Um deslize não deve ser confundido com um clique.
botaoAbrir.addEventListener("click", () => {
  if (deslizou) {
    deslizou = false;
    return;
  }

  abrirCarta();
});

botaoFechar.addEventListener("click", fecharCarta);

/* ========== 3. PÁGINAS E BOTÕES ========== */
const paginas = [...document.querySelectorAll(".pagina")];
const botaoAnterior = document.querySelector("#anterior");
const botaoProxima = document.querySelector("#proxima");
const contador = document.querySelector("#contador");
let paginaAtual = 0;

function atualizarPagina(numero) {
  if (numero < 0 || numero >= paginas.length) return;
  paginaAtual = numero;

  paginas.forEach((pagina, indice) => {
    pagina.hidden = indice !== paginaAtual;
  });

  contador.textContent = `Página ${paginaAtual + 1} de ${paginas.length}`;
  botaoAnterior.disabled = paginaAtual === 0;
  botaoProxima.disabled = paginaAtual === paginas.length - 1;
}

botaoAnterior.addEventListener("click", () => atualizarPagina(paginaAtual - 1));
botaoProxima.addEventListener("click", () => atualizarPagina(paginaAtual + 1));

// Bônus: as setas do teclado também viram as páginas.
document.addEventListener("keydown", (evento) => {
  if (estado !== "aberta") return;
  if (evento.key === "ArrowRight") atualizarPagina(paginaAtual + 1);
  if (evento.key === "ArrowLeft") atualizarPagina(paginaAtual - 1);
  if (evento.key === "Escape") fecharCarta();
});

/* ========== 4. INICIAR O SITE ========== */
criarElementosFlutuantes();
atualizarPagina(0);
