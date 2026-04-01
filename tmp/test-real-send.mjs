import { sendResetCodeEmail } from "../src/lib/mail.js";
import 'dotenv/config';

async function testRealEmail() {
  console.log("🚀 Iniciando Teste de E-mail Real (Resend)...");
  const email = "ciellolisboa023@gmail.com";
  const code = "023023";
  
  const res = await sendResetCodeEmail(email, code);
  console.log("Resultado do Envio:", JSON.stringify(res, null, 2));
}

testRealEmail();
