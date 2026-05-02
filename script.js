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
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "user", content: mensagemUsuario }
        ]
      })
    });

    const dados = await resposta.json();

    // MOSTRA ERRO NA TELA (MOBILE FRIENDLY)
    if (!resposta.ok) {
      alert("ERRO DA API:\n" + JSON.stringify(dados, null, 2));
      return "Erro na API.";
    }

    const texto = dados?.choices?.[0]?.message?.content;

    if (!texto) {
      alert("RESPOSTA INVÁLIDA:\n" + JSON.stringify(dados, null, 2));
      return "Resposta vazia da IA.";
    }

    return texto;

  } catch (erro) {
    alert("ERRO DE CONEXÃO:\n" + erro);
    return "Erro ao responder.";
  }
}

document.getElementById("botao").addEventListener("click", async () => {
  const input = document.getElementById("input");
  const texto = input.value.trim();

  if (!texto) return;

  addMensagem(texto, "user");
  input.value = "";

  addMensagem("Pensando...", "bot");

  const resposta = await enviarMensagem(texto);

  chat.lastChild.remove();
  addMensagem(resposta, "bot");
});
