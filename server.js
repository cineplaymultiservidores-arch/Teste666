const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos do site
app.use(express.static(__dirname));

// Rota simples para verificar se o servidor está funcionando
app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    service: "Mines V3",
    status: "online",
    mode: "TESTE",
    realPayments: false
  });
});

// Qualquer outra página abre o index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Mines V3 rodando na porta ${PORT}`);
});
