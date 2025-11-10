import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer__buttons">
        <button className="footer__btn">Register</button>
        <button className="footer__btn">Login</button>
      </div>
      <p className="footer__copy">© 2025 - Users & Tasks</p>
    </footer>
  );
};

export default Footer;
