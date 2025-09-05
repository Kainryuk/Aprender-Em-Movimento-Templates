import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Trophy, Brain } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Usar useEffect para navegação para evitar setState durante render
  useEffect(() => {
    if (!loading && user) {
      if (user.userType === 'professor') {
        navigate('/professor');
      } else {
        navigate('/student');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  // Se usuário está logado, o useEffect cuidará da navegação
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
        
        <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Saber em Movimento
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uma plataforma educacional interativa que combina aprendizado com movimento, 
              inspirada na capoeira e na educação inclusiva.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Brain className="w-12 h-12 text-primary mx-auto mb-2" />
                <CardTitle>Aprendizado Interativo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Questionários dinâmicos com feedback instantâneo
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Trophy className="w-12 h-12 text-accent mx-auto mb-2" />
                <CardTitle>Sistema de Graduação</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Progrida através dos cordões da capoeira conforme aprende
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle>Múltiplos Temas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Tecnologia, História, Ciência e muito mais
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <CardTitle>Gestão Educacional</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Professores podem gerenciar conteúdos e acompanhar progresso
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Comece sua jornada educacional agora!
            </h2>
            <div className="space-x-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/login')}
              >
                Fazer Login
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/register')}
              >
                Criar Conta
              </Button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Index;
