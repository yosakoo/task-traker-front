import React, { useState } from 'react';
import styles from './styles.module.css';

const TaskModal = ({ task, onUpdate, onDelete, onClose }) => {
  const [title, setTitle] = useState(task ? task.title : '');
  const [text, setText] = useState(task ? task.text : '');
  const [completed, setCompleted] = useState(task ? task.completed : false);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleCheckboxChange = () => {
    setCompleted(!completed);
  };

  const handleUpdate = () => {
    onUpdate({ ...task, title, text, completed });
  };

  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <label>Title:</label>
        <input type="text" value={title} onChange={handleTitleChange} />
        <label>Description:</label>
        <textarea value={text} onChange={handleTextChange} />
        <label>
          <input type="checkbox" checked={completed} onChange={handleCheckboxChange} />
          Completed
        </label>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleDelete}>Delete</button>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TaskModal;