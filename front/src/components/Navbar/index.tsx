import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/">Users & Tasks</Link>
      </div>

      {user && (
        <div className="navbar__center">
          {user.role === "admin" && <Link to="/users">Users</Link>}
          <Link to="/tasks">Tasks</Link>
        </div>
      )}

      <div className="navbar__right">
        {!user ? (
          <>
            <Link to="/register" className="navbar__link">
              Register
            </Link>
            <Link to="/login" className="navbar__link">
              Login
            </Link>
          </>
        ) : (
          <div className="navbar__user" onClick={() => setShowMenu(!showMenu)}>
            <span className="navbar__username">{user.userName}</span>
            {showMenu && (
              <div className="navbar__dropdown">
                <button onClick={() => navigate("/profile")}>Perfil</button>
                <button onClick={handleLogout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
