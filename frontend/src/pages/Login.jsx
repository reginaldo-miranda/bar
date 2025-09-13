// primeira tela funcionando

/*import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Simples: só valida se não está vazio
    if (email && senha) {
      // futuramente você chama a API Node aqui
      navigate("/home");
    } else {
      alert("Preencha os campos!");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "100px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
        />
        <button type="submit" style={{ width: "100%" }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;

*/

// esta bom antes do css
/* 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        senha
      });

      // Se chegou aqui, login deu certo
      console.log("Resposta da API:", res.data);

      // Redireciona para Home
      navigate("/home");
    } catch (err) {
      console.error(err);
      // Mostra mensagem de erro do backend
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro("Erro ao conectar com a API");
      }
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "100px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ display: "block", margin: "10px 0", width: "100%" }}
          required
        />
        <button type="submit" style={{ width: "100%" }}>
          Entrar
        </button>
      </form>
      {erro && <p style={{ color: "red", marginTop: "10px" }}>{erro}</p>}
    </div>
  );
}

export default Login;

*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", { email, senha });
      navigate("/home");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErro(err.response.data.error);
      } else {
        setErro("Erro ao conectar com a API");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {erro && <p>{erro}</p>}
    </div>
  );
}

export default Login;
