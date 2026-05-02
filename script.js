const API_KEY = "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";

const chat = document.getElementById("chat");

function addMensagem(texto, tipo) {
  const div = document.createElement("div");
  div.classList.add("msg", tipo);
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function enviarMensagem(mensagemUsuario) {
  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        messages: [
          { role: "user", content: mensagemUsuario }
        ]
      })
    });

    const dados = await resposta.json();

    // 🔥 MOSTRA STATUS HTTP
    if (!resposta.ok) {
      addMensagem("❌ ERRO HTTP: " + resposta.status, "bot");
      addMensagem("📦 DETALHE:\n" + JSON.stringify(dados, null, 2), "bot");
      return "Erro na API.";
    }

    const texto = dados?.choices?.[0]?.message?.content;

    // 🔥 RESPOSTA INVÁLIDA
    if (!texto) {
      addMensagem("❌ RESPOSTA INVÁLIDA DA API:\n" + JSON.stringify(dados, null, 2), "bot");
      return "Resposta inválida.";
    }

    return texto;

  } catch (erro) {
    // 🔥 ERRO DE REDE OU FETCH
    addMensagem("❌ ERRO DE CONEXÃO:\n" + erro, "bot");
    return "Erro ao responder.";
  }
}

// BOTÃO DE ENVIO
document.getElementById("botao").addEventListener("click", async () => {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto) return;

  addMensagem(texto, "user");
  input.value = "";

  addMensagem("Pensando...", "bot");

  const resposta = await enviarMensagem(texto);

  // remove "Pensando..."
  chat.lastChild.remove();

  addMensagem(resposta, "bot");
});
