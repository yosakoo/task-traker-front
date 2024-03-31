import React, { useState, useEffect } from 'react';
import styles from './auth.module.css';
import { useDebounce } from 'use-debounce';


const AuthenticatedPage = ({ userName }) => {
  
  const [tasksResponse, setTasksResponse] = useState({ completed: [], pending: [] });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [timeCompleted, setTimeCompleted] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [debouncedEditedDescription] = useDebounce(editedDescription, 300);
  const [debounceEditedTitle] = useDebounce(editedTitle, 1000);
  const getCookie = (name) => {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
};
  

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token=')).split('=')[1];
      if (!accessToken) {
        throw new Error('Токен доступа не найден в куках');
      }

      const response = await fetch('http://149.154.64.114:8080/api/tasks/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const completed = data.completed ? data.completed : [];
        const pending = data.pending ? data.pending : [];
        setTasksResponse({ completed, pending });
      } else  {
        const refreshToken = getCookie('refresh_token');
        if (refreshToken) {
          const refreshResponse = await fetch('http://149.154.64.114:8080/api/users/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const accessToken = refreshData.access_token;
            const newRefreshToken = refreshData.refresh_token;
          
            document.cookie = `access_token=${accessToken}; path=/; domain=149.154.64.114; samesite=None`;
            document.cookie = `refresh_token=${newRefreshToken}; path=/; domain=149.154.64.114;  samesite=None`;
          } else {
            console.error('Ошибка при обновлении токена');
            window.location.href = '/'; 
          }
        } else {
          console.error('Refresh token not found');
          window.location.href = '/'; 
        }
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      window.location.href = '/';
    }
  };

  fetchTasks();
  }, []);

  
  const handleLogout = () => {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/';
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
    setEditedTitle(task.title);
    setEditedDescription(task.text);
    if (task.status === 'completed') {
      setTimeCompleted(task.time);
    } else {
      setTimeCompleted('');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleAddTask = async () => {
    try {
      const accessTokenRow = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      if (!accessTokenRow) {
        console.error('Токен доступа не найден в куках');
        window.location.href = '/';
        return;
      }
      const accessToken = accessTokenRow.split('=')[1];
      
      if (newTaskTitle.trim() === '') {
        throw new Error('Заголовок задачи не может быть пустым');
      }
  
      const newTask = {
        title: newTaskTitle.trim()
      };
  
      const response = await fetch('http://149.154.64.114:8080/api/tasks/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(newTask)
      });
      if (response.ok) {
        const newTaskId = await response.text();
        const newTask = { id: newTaskId, title: newTaskTitle.trim(),status: "pending" };
        setTasksResponse(prevState => ({
          ...prevState,
          pending: [...prevState.pending, newTask]
        }));
        setNewTaskTitle('');
      } else  {
        const refreshToken = getCookie('refresh_token');
        if (refreshToken) {
          const refreshResponse = await fetch('http://149.154.64.114:8080/api/users/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const accessToken = refreshData.access_token;
            const newRefreshToken = refreshData.refresh_token;
          
            document.cookie = `access_token=${accessToken}; path=/; domain=149.154.64.114; samesite=None`;
            document.cookie = `refresh_token=${newRefreshToken}; path=/; domain=149.154.64.114;  samesite=None`;
          } else {
            console.error('Ошибка при обновлении токена');
            window.location.href = '/'; 
          }
        } else {
          console.error('Refresh token not found');
          window.location.href = '/'; 
        }
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      window.location.href = '/'; 
    }
  };
  
  const handleCheckboxChange = async () => {
    try {
      const accessTokenRow = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      if (!accessTokenRow) {
        console.error('Токен доступа не найден в куках');
        window.location.href = '/';
        return;
      }
      const accessToken = accessTokenRow.split('=')[1];
  
      let updatedTask = { ...selectedTask, status: selectedTask.status === 'completed' ? 'pending' : 'completed' };
  
      if (updatedTask.status === 'completed') {
        updatedTask.time = new Date().toISOString();
      } else {
        delete updatedTask.time;
      }
  
      const response = await fetch(`http://149.154.64.114:8080/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updatedTask)
      });
  
      if (response.ok) {
        const updatedTasksResponse = { ...tasksResponse };
        updatedTasksResponse[selectedTask.status] = updatedTasksResponse[selectedTask.status].filter(task => task.id !== selectedTask.id);
        updatedTasksResponse[updatedTask.status].push(updatedTask);
        setTasksResponse(updatedTasksResponse);
        setSelectedTask(updatedTask);
        if (updatedTask.status === 'completed') {
          updatedTask.time = new Date().toISOString();
          setTimeCompleted(updatedTask.time);
        } else {
          updatedTask.time = null;
          setTimeCompleted(null);
        }
      } else  {
        const refreshToken = getCookie('refresh_token');
        if (refreshToken) {
          const refreshResponse = await fetch('http://149.154.64.114:8080/api/users/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const accessToken = refreshData.access_token;
            const newRefreshToken = refreshData.refresh_token;
          
            document.cookie = `access_token=${accessToken}; path=/; domain=149.154.64.114; samesite=None`;
            document.cookie = `refresh_token=${newRefreshToken}; path=/; domain=149.154.64.114;  samesite=None`;
          } else {
            console.error('Ошибка при обновлении токена');
            window.location.href = '/'; 
          }
        } else {
          console.error('Refresh token not found');
          window.location.href = '/'; 
        }
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      window.location.href = '/'; 
    }
  };
  
  const handleDelete = async () => {
    try {
      const accessTokenRow = document.cookie.split('; ').find(row => row.startsWith('access_token='));
      if (!accessTokenRow) {
        console.error('Токен доступа не найден в куках');
        window.location.href = '/';
        return;
      }
      const accessToken = accessTokenRow.split('=')[1];
  
      const response = await fetch(`http://149.154.64.114:8080/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
  
      if (response.ok) {
        const updatedTasksResponse = {
          completed: tasksResponse.completed.filter(task => task.id !== selectedTask.id),
          pending: tasksResponse.pending.filter(task => task.id !== selectedTask.id)
        };
        setTasksResponse(updatedTasksResponse);
        closeModal();
      } else  {
        const refreshToken = getCookie('refresh_token');
        if (refreshToken) {
          const refreshResponse = await fetch('http://149.154.64.114:8080/api/users/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const accessToken = refreshData.access_token;
            const newRefreshToken = refreshData.refresh_token;
          
            document.cookie = `access_token=${accessToken}; path=/; domain=149.154.64.114; samesite=None`;
            document.cookie = `refresh_token=${newRefreshToken}; path=/; domain=149.154.64.114;  samesite=None`;
          } else {
            console.error('Ошибка при обновлении токена');
            window.location.href = '/'; 
          }
        } else {
          console.error('Refresh token not found');
          window.location.href = '/'; 
        }
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      window.location.href = '/'; 
    }
  
  };

  const handleTitleChange = (event) => {
    setEditedTitle(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setEditedDescription(event.target.value);
  };

  useEffect(() => {
    const saveChanges = async () => {
      try {
        const accessTokenRow = document.cookie.split('; ').find(row => row.startsWith('access_token='));
        if (!accessTokenRow) {
          console.error('Токен доступа не найден в куках');
          window.location.href = '/'; 
          return;
        }
        const accessToken = accessTokenRow.split('=')[1];
        
        if (!editedTitle.trim() && !editedDescription.trim()) {
          return;
        }
  
        const updatedTask = { ...selectedTask, title: editedTitle, text: editedDescription };
  
        const response = await fetch(`http://149.154.64.114:8080/api/tasks/${updatedTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(updatedTask)
        });
  
        if (response.ok) {
          const updatedTasksResponse = { ...tasksResponse };
          updatedTasksResponse[selectedTask.status] = updatedTasksResponse[selectedTask.status].filter(task => task.id !== selectedTask.id);
          updatedTasksResponse[updatedTask.status].push(updatedTask);
          setTasksResponse(updatedTasksResponse);
          setSelectedTask(updatedTask);
        } else  {
          const refreshToken = getCookie('refresh_token');
          if (refreshToken) {
            const refreshResponse = await fetch('http://149.154.64.114:8080/api/users/auth/refresh', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: refreshToken })
            });
  
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              const accessToken = refreshData.access_token;
              const newRefreshToken = refreshData.refresh_token;
            
              document.cookie = `access_token=${accessToken}; path=/; domain=149.154.64.114; samesite=None`;
              document.cookie = `refresh_token=${newRefreshToken}; path=/; domain=149.154.64.114;  samesite=None`;
            } else {
              console.error('Ошибка при обновлении токена');
              window.location.href = '/'; 
            }
          } else {
            console.error('Refresh token not found');
            window.location.href = '/'; 
          }
        }
      } catch (error) {
        console.error('Произошла ошибка:', error);
        window.location.href = '/';
      }
    };
  
    saveChanges();
  }, [debounceEditedTitle, debouncedEditedDescription]);
  



  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Добро пожаловать, {userName}!</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>Выйти</button>
      </div>
      <div className={styles.addTaskSection}>
    <div className={styles.addTaskContainer}>
      <input 
        type="text" 
        value={newTaskTitle} 
        onChange={(e) => setNewTaskTitle(e.target.value)} 
        placeholder="Введите заголовок новой задачи" 
      />
      <button className={styles.addButton} onClick={handleAddTask}>Добавить</button>
    </div>
  </div>
  <div className={styles.container}>
    <div className={`${styles.rectangle} ${styles.taskSection}`}>
      <h2 className={styles.sectionTitle}>Выполненные задачи:</h2>
      <ul className={styles.taskList}>
        {tasksResponse.completed.map(task => (
          <li key={task.id} onClick={() => openModal(task)}>{task.title}</li>
        ))}
      </ul>
    </div>
    <div className={`${styles.rectangle} ${styles.taskSection}`}>
      <h2 className={styles.sectionTitle}>Невыполненные задачи:</h2>
      <ul className={styles.taskList}>
        {tasksResponse.pending.map(task => (
          <li key={task.id} onClick={() => openModal(task)}>{task.title}</li>
        ))}
      </ul>
    </div>
  </div>
    {isModalOpen && selectedTask && (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <h2>{selectedTask.title}</h2>
          <div>
            <label htmlFor="title">Заголовок:</label>
            <input id="title" type="text" value={editedTitle} onChange={handleTitleChange} />
          </div>
          <div>
            <label htmlFor="description">Описание:</label>
            <textarea id="description" value={editedDescription} onChange={handleDescriptionChange} />
          </div>
          <div>
            <input id="completed" type="checkbox" checked={selectedTask.status === 'completed'} onChange={handleCheckboxChange} />
            <label htmlFor="completed">Выполнено</label>
          </div>
          {timeCompleted && <p>Время сдачи: {new Date(timeCompleted).toLocaleString()}</p>}

          <button onClick={handleDelete}>Удалить</button>
          <button onClick={closeModal}>Закрыть</button>
        </div>
      </div>
    )}
  </main>
);
};

export default AuthenticatedPage;
