import React from 'react';
import styles from './styles.module.css';

const UnauthenticatedPage = ({ openRegisterModal, openLoginModal }) => (
  <main className={styles.main}>
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h1 className={styles.title}>Добро пожаловать!</h1>
          <p className={styles.description}>Это сайт pet-project по курсу Сергея Жукова. Здесь вы можете создавать и управлять своими задачами.</p>
        </div>
        <img src="/blabo.svg" alt="Изображение" className={styles.image} />
      </div>
      <div className={styles.buttons}>
        <button onClick={openRegisterModal} className={styles.button}>Регистрация</button>
        <button onClick={openLoginModal} className={styles.button}>Авторизация</button>
      </div>
    </div>
  </main>
);

export default UnauthenticatedPage;
