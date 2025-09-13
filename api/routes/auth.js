import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const router = express.Router();

// Rota de cadastro
router.post("/register", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // verificar se já existe
    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    // criptografar senha
    const hashedSenha = await bcrypt.hash(senha, 10);

    const novoUser = new User({ email, senha: hashedSenha });
    await novoUser.save();

    res.status(201).json({ message: "Usuário cadastrado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro no cadastro" });
  }
});

// Rota de login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const senhaCorreta = await bcrypt.compare(senha, user.senha);
    if (!senhaCorreta) return res.status(400).json({ error: "Senha incorreta" });

    res.json({ message: "Login bem-sucedido", user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Erro no login" });
  }
});

export default router;
