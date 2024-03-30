import React, { useState } from 'react';
import styles from './styles.module.css';

const RegisterModal = ({ isOpen, onClose, onSubmit, error }) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setPasswordError('Пароль должен содержать не менее 6 символов.');
    } else {
      onSubmit(event);
    }
  };

  const handleChange = (event) => {
    setPassword(event.target.value);
    setPasswordError('');
  };

  return (
    isOpen && (
      <div id="register-modal" className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>Закрыть</button>
        <div id="modal-content" className={styles.modalContent}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Имя:</label><br />
            <input type="text" id="name" name="name" /><br />
            <label htmlFor="email">Почта:</label><br />
            <input type="email" id="email" name="email" /><br />
            <label htmlFor="password">Пароль:</label><br />
            <input type="password" id="password" name="password" value={password} onChange={handleChange} /><br />
            {passwordError && <p>{passwordError}</p>}
            <input type="submit" value="Зарегистрироваться" />
          </form>
          {error && <p>{error}</p>}
        </div>
      </div>
    )
  );
};

export default RegisterModal;
