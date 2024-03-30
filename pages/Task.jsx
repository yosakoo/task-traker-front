import React, { useState } from 'react';
import styles from './styles.module.css';
import TaskModal from './TaskModal';

const Task = ({ task, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);

  const handleTaskClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <div className={styles.task} onClick={handleTaskClick}>
        <h3>{task && task.title}</h3>
        <p>{task && task.text}</p>
      </div>
      {showModal && (
        <TaskModal task={task} onUpdate={onUpdate} onDelete={onDelete} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Task;