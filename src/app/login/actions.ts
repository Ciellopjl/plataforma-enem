"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/logger";

export async function registerUser(formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return { success: false, error: "Por favor, preencha todos os campos." };
    }

    if (password.length < 6) {
      return { success: false, error: "Sua senha secreta precisa ter no mínimo 6 caracteres." };
    }

    // Regra Sênior: O Aluno exigiu a exclusividade de "Senhas do Google (Gmail)"
    if (!email.endsWith("@gmail.com")) {
      return { success: false, error: "Nosso sistema é exclusivo para contas @gmail.com." };
    }

    // Verifica se o Aluno já se cadastrou antes
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Esse Gmail já tem dono. Tente recuperar a senha ou faça Login." };
    }

    // Criptografia Militar com Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const generatedImage = `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`;

    // Cria o Aluno Blindado
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split("@")[0], // Pega o nome de usuário do email
        image: generatedImage      // Foto Premium Baseada no Email
      },
    });

    // Emite o Log do Painel Admin
    await logActivity("✨ Novo Aluno Cadastrado", "Criou a conta com Email e Senha.", newUser.id);

    return { success: true, message: "Cadastro de Elite aprovado. Faça login agora!" };
  } catch (error: any) {
    console.error("Erro no Registro:", error);
    return { success: false, error: "Erro interno ao processar a matrícula." };
  }
}
