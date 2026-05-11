const BACKEND_URL = "https://SEU-WORKER-NAME.workers.dev"; // ← TROQUE PELO SEU URL DO CLOUDFLARE AQUI

// ===== CHAT =====
const chat = document.getElementById("chat");

// adiciona mensagem na tela
function addMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.className = `msg ${tipo}`;
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ===== CONTROLE =====
let fila = [];
let processando = false;
let bloqueado = false;

// ===== BOTÃO =====
document.getElementById("botao").addEventListener("click", () => {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto || bloqueado) return;

  input.value = "";
  fila.push(texto);
  processarFila();
});

// ===== FILA =====
async function processarFila() {
  if (processando) return;
  processando = true;

  while (fila.length > 0) {
    if (bloqueado) {
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    const mensagem = fila.shift();

    addMensagem(mensagem, "user");

    const pensando = document.createElement("div");
    pensando.className = "msg bot";
    pensando.textContent = "Pensando...";
    chat.appendChild(pensando);
    chat.scrollTop = chat.scrollHeight;

    const resposta = await enviarComRetry(mensagem);

    pensando.remove();
    addMensagem(resposta, "bot");

    // cooldown anti-spam de 5 segundos
    bloqueado = true;
    await new Promise(r => setTimeout(r, 5000));
    bloqueado = false;
  }

  processando = false;
}

// ===== ENVIO PARA BACKEND SEGURO =====
async function enviarMensagem(texto) {
  const res = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: texto })
  });

  if (!res.ok) throw new Error("Erro na API");

  const data = await res.json();
  return data.reply || "Sem resposta da IA";
}

// ===== RETRY AUTOMÁTICO =====
async function enviarComRetry(texto, tentativas = 3) {
  for (let i = 0; i < tentativas; i++) {
    try {
      return await enviarMensagem(texto);
    } catch (err) {
      console.log(`Tentativa ${i+1} falhou`);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  return "❌ Não consegui responder agora. Tente novamente mais tarde.";
}