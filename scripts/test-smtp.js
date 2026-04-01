const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
  console.log("🔍 [TESTE SMTP] Iniciando com:", process.env.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465, 
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Manda pra você mesmo
      subject: "Teste de Conexão - ENEM 2026",
      text: "Se você recebeu isso, a Senha de App está OK!",
    });
    console.log("✅ [SUCESSO] E-mail enviado! ID:", info.messageId);
  } catch (err) {
    console.error("❌ [ERRO DE AUTENTICAÇÃO]:", err.message);
  }
}

testSMTP();
