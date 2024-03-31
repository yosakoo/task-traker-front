import React, { useState, useEffect } from 'react';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import AuthenticatedPage from './AuthenticatedPage';
import UnauthenticatedPage from './UnauthenticatedPage';

const Home = () => {
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const [userName, setUserName] = useState("");

    const fetchUserData = async (accessToken, refreshToken) => {
        try {
            if (!accessToken || !refreshToken) {
                throw new Error('Токены не найдены в куках');
            }
    
            const response = await fetch('http://149.154.64.114:8080/api/users/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
    
            if (response.ok) {
                const userData = await response.json();
                setUserName(userData.name);
                setIsLoggedIn(true);
                
            } else if (response.status === 401) {
                const refreshResponse = await fetch('http://149.154.64.114:8080/api/users/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: refreshToken })
                });
    
                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    console.log(refreshData)
                    console.log(refreshData.access_token)
                    accessToken = refreshData.access_token;
                    refreshToken = refreshData.refresh_token;
                
                    document.cookie = `access_token=${accessToken}; path=/; domain=149.154.64.114;  samesite=None`;
                    document.cookie = `refresh_token=${refreshToken}; path=/; domain=149.154.64.114;  samesite=None`;
                    
                    console.log(getCookie('refresh_token'))
                    await fetchUserData(accessToken, refreshToken);
                } else {
                    throw new Error('Ошибка при обновлении токена');
                }
                
                
            } else {
                throw new Error('Пользователь не авторизован');
            }
        } catch (error) {
            setIsLoggedIn(false);
            setUserName("");
            console.error('Ошибка при проверке авторизации:', error);
        }
    };
    
    useEffect(() => {
        const accessToken = getCookie('access_token');
        const refreshToken = getCookie('refresh_token');
        
        fetchUserData(accessToken, refreshToken);
    }, []);
    
    
    const getCookie = (name) => {
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find(row => row.startsWith(`${name}=`));
        return cookie ? cookie.split('=')[1] : null;
    };
    
    const openRegisterModal = () => {
        setIsRegisterModalOpen(true);
    };

    const openLoginModal = () => {
        setIsLoginModalOpen(true); 
    };

    const closeRegisterModal = () => {
        setIsRegisterModalOpen(false); 
        setError(null);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false); 
        setError(null); 
    };

    const handleRegisterSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        fetch('http://149.154.64.114:8080/api/users/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            setLoading(false);
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    if (errorMessage.includes('this email is already taken')) {
                        setError('Этот email уже занят');
                    } else {
                        throw new Error('Ошибка при регистрации');
                    }
                });
            }
            return response.json();
        })
        .catch(error => {
            setLoading(false);
            setError(error.message);
        })
        .then(data => {
            if (data) {
                const accessToken = data.access_token;
                const refreshToken = data.refresh_token;
                document.cookie = `access_token=${accessToken}; path=/`; 
                document.cookie = `refresh_token=${refreshToken}; path=/`;
                
                setIsRegisterModalOpen(false);
                setIsLoggedIn(true); 
                fetchUserData(accessToken, refreshToken); 
            }
        });
        
    };
    
    const handleLoginSubmit = (event) => {
        event.preventDefault();
        setLoading(true); 
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        fetch('http://149.154.64.114:8080/api/users/sign-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(errorMessage => {
                    if (errorMessage.includes('user not found')) {
                        throw new Error('Пользователь не найден');
                    } else {
                        throw new Error('Ошибка при регистрации');
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            setLoading(false);
            const accessToken = data.access_token;
            const refreshToken = data.refresh_token;
            document.cookie = `access_token=${accessToken}; path=/`; 
            document.cookie = `refresh_token=${refreshToken}; path=/`;
    
            setIsLoginModalOpen(false); 
            setIsLoggedIn(true); 
    
            fetchUserData(accessToken, refreshToken); 
        })
        .catch(error => {
            setLoading(false);
            setError(error.message); 
        });
    };
    
    
    
    return (
        <>
          {isLoggedIn ? (
            <AuthenticatedPage userName={userName} />
          ) : (
            <UnauthenticatedPage openRegisterModal={openRegisterModal} openLoginModal={openLoginModal} />
          )}
          {isRegisterModalOpen && <RegisterModal isOpen={isRegisterModalOpen} onClose={closeRegisterModal} onSubmit={handleRegisterSubmit} error={error}/>}
          {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} onSubmit={handleLoginSubmit} error={error}/>}
        </>
      );
};

export default Home;
