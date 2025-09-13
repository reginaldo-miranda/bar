import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mesas.css';

const Mesas = () => {
  const navigate = useNavigate();
  const [mesas, setMesas] = useState([]);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modalNovaMesa, setModalNovaMesa] = useState(false);
  const [tipoMesaSelecionado, setTipoMesaSelecionado] = useState('todos');
  const [novaMesa, setNovaMesa] = useState({
    numero: '',
    nome: '',
    capacidade: 4,
    observacoes: '',
    tipo: 'interna'
  });

  // Tipos de mesa
  const tiposMesa = [
    { id: 'todos', nome: 'Todas', icon: '🪑' },
    { id: 'interna', nome: 'Interna', icon: '🏠' },
    { id: 'externa', nome: 'Externa', icon: '🌳' },
    { id: 'vip', nome: 'VIP', icon: '⭐' },
    { id: 'reservada', nome: 'Reservada', icon: '📅' },
    { id: 'balcao', nome: 'Balcão', icon: '🍺' }
  ];

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    carregarMesas();
  };

  const carregarMesas = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/mesa/list');
      if (response.ok) {
        const data = await response.json();
        setMesas(data);
      }
    } catch {
      console.error('Erro ao carregar mesas');
    }
  };



  const criarNovaMesa = async () => {
    if (!novaMesa.numero || !novaMesa.nome) {
      setErro('Preencha número e nome da mesa');
      return;
    }

    setLoading(true);
    setErro('');
    
    try {
      const response = await fetch('http://localhost:4000/api/mesa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novaMesa)
      });

      if (response.ok) {
        setSucesso('Mesa criada com sucesso!');
        setModalNovaMesa(false);
        setNovaMesa({ numero: '', nome: '', capacidade: 4, observacoes: '', tipo: 'interna' });
        carregarMesas();
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.error || 'Erro ao criar mesa');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const abrirMesa = async (mesaId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/mesa/${mesaId}/abrir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numeroClientes: 1 })
      });

      if (response.ok) {
        setSucesso('Mesa aberta com sucesso!');
        carregarMesas();
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao abrir mesa');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    }
  };

  const fecharMesa = async (mesaId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/mesa/${mesaId}/fechar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        setSucesso('Mesa fechada com sucesso!');
        carregarMesas();
        setTimeout(() => setSucesso(''), 3000);
      } else {
        const errorData = await response.json();
        setErro(errorData.message || 'Erro ao fechar mesa');
      }
    } catch {
      setErro('Erro ao conectar com o servidor');
    }
  };

  const mesasFiltradas = mesas.filter(mesa => 
    tipoMesaSelecionado === 'todos' || mesa.tipo === tipoMesaSelecionado
  );

  return (
    <div className="mesas-container">
      <div className="mesas-header">
        <h1>🪑 Gerenciamento de Mesas</h1>
        <div className="header-actions">
          <button 
            className="btn-nova-mesa"
            onClick={() => setModalNovaMesa(true)}
          >
            ➕ Nova Mesa
          </button>
          <button 
            className="btn-voltar-pdv"
            onClick={() => navigate('/pdv')}
          >
            ← Voltar ao PDV
          </button>
        </div>
      </div>

      {erro && <div className="erro-msg">{erro}</div>}
      {sucesso && <div className="sucesso-msg">{sucesso}</div>}

      <div className="mesas-layout">
        {/* Filtros de Tipo */}
        <div className="filtros-section">
          <h3>Filtrar por Tipo</h3>
          <div className="tipos-mesa-filtro">
            {tiposMesa.map(tipo => (
              <button
                key={tipo.id}
                className={`tipo-mesa-btn ${tipoMesaSelecionado === tipo.id ? 'active' : ''}`}
                onClick={() => setTipoMesaSelecionado(tipo.id)}
              >
                {tipo.icon} {tipo.nome}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Mesas */}
        <div className="mesas-grid-container">
          <h3>Mesas ({mesasFiltradas.length})</h3>
          <div className="mesas-grid">
            {mesasFiltradas.map(mesa => (
              <div key={mesa._id} className={`mesa-card ${mesa.status}`}>
                <div className="mesa-info">
                  <div className="mesa-numero">Mesa {mesa.numero}</div>
                  <div className="mesa-nome">{mesa.nome}</div>
                  <div className="mesa-tipo">{tiposMesa.find(t => t.id === mesa.tipo)?.icon} {mesa.tipo}</div>
                  <div className="mesa-capacidade">👥 {mesa.capacidade} pessoas</div>
                  <div className={`mesa-status-badge ${mesa.status}`}>
                    {mesa.status === 'livre' && '✅ Livre'}
                    {mesa.status === 'ocupada' && '🔴 Ocupada'}
                    {mesa.status === 'reservada' && '📅 Reservada'}
                    {mesa.status === 'manutencao' && '🔧 Manutenção'}
                  </div>
                  {mesa.status === 'ocupada' && mesa.horaAbertura && (
                    <div className="mesa-tempo">
                      ⏱️ {Math.floor((new Date() - new Date(mesa.horaAbertura)) / (1000 * 60))}min
                    </div>
                  )}
                  {mesa.observacoes && (
                    <div className="mesa-observacoes">{mesa.observacoes}</div>
                  )}
                </div>
                <div className="mesa-actions">
                  {mesa.status === 'livre' && (
                    <button 
                      className="btn-abrir-mesa"
                      onClick={() => abrirMesa(mesa._id)}
                    >
                      🔓 Abrir Mesa
                    </button>
                  )}
                  {mesa.status === 'ocupada' && (
                    <>
                      <button 
                        className="btn-ir-pdv"
                        onClick={() => navigate('/pdv', { state: { mesaId: mesa._id } })}
                      >
                        📱 Ir para PDV
                      </button>
                      <button 
                        className="btn-fechar-mesa"
                        onClick={() => fecharMesa(mesa._id)}
                      >
                        🔒 Fechar Mesa
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {mesasFiltradas.length === 0 && (
            <div className="sem-mesas">
              <p>Nenhuma mesa encontrada para o filtro selecionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Mesa */}
      {modalNovaMesa && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Nova Mesa</h3>
              <button 
                className="modal-close"
                onClick={() => setModalNovaMesa(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Número da Mesa: *</label>
                <input
                  type="text"
                  value={novaMesa.numero}
                  onChange={(e) => setNovaMesa({...novaMesa, numero: e.target.value})}
                  placeholder="Ex: 5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nome da Mesa: *</label>
                <input
                  type="text"
                  value={novaMesa.nome}
                  onChange={(e) => setNovaMesa({...novaMesa, nome: e.target.value})}
                  placeholder="Ex: Mesa 5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacidade:</label>
                <input
                  type="number"
                  value={novaMesa.capacidade}
                  onChange={(e) => setNovaMesa({...novaMesa, capacidade: parseInt(e.target.value)})}
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label>Tipo da Mesa:</label>
                <select
                  value={novaMesa.tipo}
                  onChange={(e) => setNovaMesa({...novaMesa, tipo: e.target.value})}
                >
                  <option value="interna">🏠 Interna</option>
                  <option value="externa">🌳 Externa</option>
                  <option value="vip">⭐ VIP</option>
                  <option value="reservada">📅 Reservada</option>
                  <option value="balcao">🍺 Balcão</option>
                </select>
              </div>
              <div className="form-group">
                <label>Observações:</label>
                <input
                  type="text"
                  value={novaMesa.observacoes}
                  onChange={(e) => setNovaMesa({...novaMesa, observacoes: e.target.value})}
                  placeholder="Ex: Mesa próxima à janela"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancelar"
                onClick={() => setModalNovaMesa(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-criar"
                onClick={criarNovaMesa}
                disabled={loading}
              >
                {loading ? 'Criando...' : 'Criar Mesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mesas;