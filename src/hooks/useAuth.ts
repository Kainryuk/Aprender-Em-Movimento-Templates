import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  uid: string;
  email: string;
  nomeCompleto: string;
  userType: 'aluno' | 'professor';
  cpf: string;
  score?: number;
  rank?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (cpf: string, password: string, userType: 'aluno' | 'professor') => {
    try {
      const response = await fetch('https://aprender-em-movimento.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf, password, userType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no login');
      }

      const data = await response.json();
      const userData = data.user;
      
      // Salvar no localStorage
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('authToken', data.token);
      
      setUser(userData);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${userData.nomeCompleto}`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Erro ao tentar fazer login",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch('https://aprender-em-movimento.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro no cadastro');
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Agora você pode fazer login",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Erro ao tentar fazer cadastro",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setUser(null);
    
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
    
    // Redirecionar para a página inicial após logout
    navigate('/');
  };

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    getAuthToken
  };
};