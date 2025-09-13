// estava funcionando antes do botao de menu
/*import "../styles/header.css";

function Header() {
  return (
    <header>
      SISBAR
    </header>
  );
}

export default Header;
*/
/*
import { useState } from "react";
import "../styles/header.css";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <header>
      <div className="header-container">
        <span className="header-title">SISBAR</span>
        <div className="hamburger" onClick={toggleMenu}>
          &#9776; {/* símbolo do hamburger ☰ }
        </div>
      </div>

      {/* Menu que aparece ao clicar no hamburger /}
      {menuAberto && (
        <div className="menu-dropdown">
          <p>Home</p>
          <p>Perfil</p>
          <p>Sair</p>
        </div>
      )}
    </header>
  );
}

export default Header;

*/

// antes do cadastro de products
/*
import { useState } from "react";
import "../styles/header.css";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <header>
      <div className="header-container">
        <span className="header-title">SISBAR</span>
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>

      {/* Renderiza o menu e overlay apenas se menuAberto for true /}
      {menuAberto && (
        <>
          <div className="side-menu open">
            <p onClick={toggleMenu}>Home</p>
            <p onClick={toggleMenu}>Perfil</p>
            <p onClick={toggleMenu}>Sair</p>
          </div>
          <div className="overlay" onClick={toggleMenu}></div>
        </>
      )}
    </header>
  );
}

export default Header;
*/
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ necessário
import "../styles/header.css";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [submenuAberto, setSubmenuAberto] = useState(null);
  const [submenuAninhado, setSubmenuAninhado] = useState(null);
  const navigate = useNavigate(); // permite navegação programática

  const toggleMenu = () => setMenuAberto(!menuAberto);
  
  const toggleSubmenu = (submenu) => {
    setSubmenuAberto(submenuAberto === submenu ? null : submenu);
    setSubmenuAninhado(null); // fecha submenus aninhados ao trocar de submenu principal
  };
  
  const toggleSubmenuAninhado = (submenu) => {
    setSubmenuAninhado(submenuAninhado === submenu ? null : submenu);
  };

  const goTo = (path) => {
    navigate(path);
    setMenuAberto(false); // fecha o menu após clicar
    setSubmenuAberto(null); // fecha submenus
    setSubmenuAninhado(null); // fecha submenus aninhados
  };

  return (
    <header>
      <div className="header-container">
        <span className="header-title">SISBAR</span>
        <div className="hamburger" onClick={toggleMenu}>
          &#9776;
        </div>
      </div>

      {menuAberto && (
        <>
          <div className="side-menu open">
            <p onClick={() => goTo("/home")}>Home</p>
            
            <div className="menu-item-with-submenu">
              <p onClick={() => toggleSubmenu('produtos')} className="menu-item-parent">
                Produtos {submenuAberto === 'produtos' ? '▼' : '▶'}
              </p>
              {submenuAberto === 'produtos' && (
                <div className="submenu">
                  <p onClick={() => goTo("/product")} className="submenu-item">Cadastrar</p>
                  <p onClick={() => goTo("/product/list")} className="submenu-item">Listar</p>
                  <div className="menu-item-with-submenu submenu-nested">
                    <p onClick={() => toggleSubmenuAninhado('grupos-unidades')} className="submenu-item-parent">
                      Grupos e Unidades {submenuAninhado === 'grupos-unidades' ? '▼' : '▶'}
                    </p>
                    {submenuAninhado === 'grupos-unidades' && (
                      <div className="submenu-nested">
                        <p onClick={() => goTo("/product/groups-units?tab=grupos")} className="submenu-item-nested">Listar Grupos</p>
                        <p onClick={() => goTo("/product/groups-units?tab=unidades")} className="submenu-item-nested">Listar Unidades</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="menu-item-with-submenu">
              <p onClick={() => toggleSubmenu('clientes')} className="menu-item-parent">
                Clientes {submenuAberto === 'clientes' ? '▼' : '▶'}
              </p>
              {submenuAberto === 'clientes' && (
                <div className="submenu">
                  <p onClick={() => goTo("/customer")} className="submenu-item">Cadastrar</p>
                  <p onClick={() => goTo("/customer/list")} className="submenu-item">Listar</p>
                </div>
              )}
            </div>
            
            <div className="menu-item-with-submenu">
              <p onClick={() => toggleSubmenu('funcionarios')} className="menu-item-parent">
                Funcionários {submenuAberto === 'funcionarios' ? '▼' : '▶'}
              </p>
              {submenuAberto === 'funcionarios' && (
                <div className="submenu">
                  <p onClick={() => goTo("/employee")} className="submenu-item">Cadastrar</p>
                  <p onClick={() => goTo("/employee/list")} className="submenu-item">Listar</p>
                </div>
              )}
            </div>
            
            <p onClick={() => goTo("/pdv")} className="menu-item-pdv">PDV - Vendas</p>
            
            <p onClick={() => goTo("/perfil")}>Perfil</p>
            <p onClick={() => goTo("/sair")}>Sair</p>
          </div>
          <div className="overlay" onClick={toggleMenu}></div>
        </>
      )}
    </header>
  );
}

export default Header;
