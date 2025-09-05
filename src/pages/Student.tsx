import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Play, Trophy, Clock, CheckCircle } from "lucide-react";

interface Question {
  id: string;
  theme: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  feedback: {
    title: string;
    text: string;
    illustration: string;
  };
}

const Student = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [timeLeft, setTimeLeft] = useState(20);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const capoeiraRanks = [
    { score: 0, title: "Aluno Novo (Iniciante)", color: "bg-gray-400" },
    { score: 1, title: "Cordão Cru (Iniciante)", color: "bg-yellow-200" },
    { score: 3, title: "Cordão Amarelo (Estagiário)", color: "bg-yellow-400" },
    { score: 5, title: "Cordão Laranja (Graduado)", color: "bg-orange-400" },
    { score: 8, title: "Cordão Azul (Instrutor)", color: "bg-blue-400" },
    { score: 12, title: "Cordão Verde (Professor)", color: "bg-green-400" },
    { score: 18, title: "Cordão Roxo (Mestre)", color: "bg-purple-400" },
    { score: 25, title: "Cordão Marrom (Contramestre)", color: "bg-amber-600" },
    { score: 35, title: "Cordão Vermelho (Mestre)", color: "bg-red-500" }
  ];

  const getCurrentRank = (userScore: number) => {
    let currentRank = capoeiraRanks[0];
    for (let rank of capoeiraRanks) {
      if (userScore >= rank.score) currentRank = rank;
      else break;
    }
    return currentRank;
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch('https://aprender-em-movimento.onrender.com/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      } else {
        throw new Error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      // Fallback com dados mockados para demonstração
      const mockQuestions = [
        {
          id: 'mock1',
          theme: 'capoeira',
          question: 'Qual é o instrumento principal da capoeira?',
          options: ['Berimbau', 'Pandeiro', 'Atabaque', 'Caxixi'],
          correctOptionIndex: 0,
          feedback: {
            title: 'Correto!',
            text: 'O berimbau é o instrumento principal que conduz a roda de capoeira.',
            illustration: ''
          }
        },
        {
          id: 'mock2',
          theme: 'tecnologia',
          question: 'O que significa HTML?',
          options: ['HyperText Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'High Tech Modern Language'],
          correctOptionIndex: 0,
          feedback: {
            title: 'Parabéns!',
            text: 'HTML é a linguagem de marcação padrão para criar páginas web.',
            illustration: ''
          }
        }
      ];
      setQuestions(mockQuestions);
      toast({
        title: "Modo Demonstração",
        description: "Carregando perguntas de exemplo pois a API está indisponível.",
      });
    }
  };

  useEffect(() => {
    loadQuestions();
    if (user?.score) {
      setScore(user.score);
    }
  }, [user]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQuizActive && timeLeft > 0 && !showFeedback) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showFeedback) {
      handleAnswer();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isQuizActive, showFeedback]);

  const startQuiz = () => {
    let filteredQuestions = questions;
    
    if (selectedTheme && selectedTheme !== "all") {
      filteredQuestions = questions.filter(q => q.theme === selectedTheme);
    }
    
    if (filteredQuestions.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhuma pergunta encontrada para o tema selecionado",
        variant: "destructive",
      });
      return;
    }

    // Embaralhar perguntas
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled);
    setCurrentQuestion(shuffled[0]);
    setQuestionIndex(0);
    setSelectedOption(null);
    setIsQuizActive(true);
    setShowFeedback(false);
    setTimeLeft(20);
  };

  const handleAnswer = () => {
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    const nextIndex = questionIndex + 1;
    
    if (nextIndex < quizQuestions.length) {
      setQuestionIndex(nextIndex);
      setCurrentQuestion(quizQuestions[nextIndex]);
      setSelectedOption(null);
      setShowFeedback(false);
      setTimeLeft(20);
    } else {
      endQuiz();
    }
  };

  const endQuiz = () => {
    setIsQuizActive(false);
    setCurrentQuestion(null);
    setShowFeedback(false);
    
    const finalRank = getCurrentRank(score);
    
    toast({
      title: "Quiz concluído!",
      description: `Pontuação: ${score} | Graduação: ${finalRank.title}`,
    });
  };

  const themes = [...new Set(questions.map(q => q.theme))];
  const currentRank = getCurrentRank(score);

  if (!user) {
    return <div>Acesso negado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">
            Área do Aluno
          </h1>
          <p className="text-gray-600">
            Bem-vindo, {user.nomeCompleto.split(' ')[0]}!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Painel do usuário */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Seu Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Pontuação Atual</p>
                  <p className="text-2xl font-bold">{score}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Graduação Atual</p>
                  <div className={`p-3 rounded-lg ${currentRank.color} text-white text-center font-semibold`}>
                    {currentRank.title}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Progresso para próxima graduação</p>
                  <Progress 
                    value={Math.min((score / (currentRank.score + 3)) * 100, 100)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Graduações disponíveis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Sistema de Graduação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {capoeiraRanks.map((rank, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded ${rank.color}`}></div>
                      <span className={score >= rank.score ? 'font-semibold' : 'text-gray-500'}>
                        {rank.title} ({rank.score}+ pontos)
                      </span>
                      {score >= rank.score && <CheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área do quiz */}
          <div className="lg:col-span-2">
            {!isQuizActive ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-purple-600" />
                    Iniciar Quiz
                  </CardTitle>
                  <CardDescription>
                    Escolha um tema ou deixe em branco para questões aleatórias
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tema (opcional)</label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os temas (aleatório)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os temas (aleatório)</SelectItem>
                        {themes.map(theme => (
                          <SelectItem key={theme} value={theme}>
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={startQuiz}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Começar Quiz
                  </Button>

                  <div className="text-sm text-gray-600">
                    <p>• Cada pergunta tem 20 segundos para ser respondida</p>
                    <p>• Ganhe 1 ponto por resposta correta</p>
                    <p>• Avance nas graduações da capoeira conforme sua pontuação</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pergunta {questionIndex + 1} de {quizQuestions.length}</span>
                    <div className="flex items-center gap-2 text-red-500">
                      <Clock className="w-4 h-4" />
                      {timeLeft}s
                    </div>
                  </CardTitle>
                  <Progress value={(questionIndex / quizQuestions.length) * 100} />
                </CardHeader>
                <CardContent>
                  {currentQuestion && !showFeedback && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium mb-1">
                          {currentQuestion.theme.toUpperCase()}
                        </p>
                        <h3 className="text-lg font-semibold">
                          {currentQuestion.question}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedOption === index ? "default" : "outline"}
                            className={`w-full text-left p-4 h-auto justify-start ${
                              selectedOption === index 
                                ? "bg-purple-600 hover:bg-purple-700" 
                                : "hover:bg-purple-50"
                            }`}
                            onClick={() => setSelectedOption(index)}
                          >
                            <span className="font-semibold mr-2">{String.fromCharCode(65 + index)})</span>
                            {option}
                          </Button>
                        ))}
                      </div>

                      <Button 
                        onClick={handleAnswer}
                        disabled={selectedOption === null}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Responder
                      </Button>
                    </div>
                  )}

                  {showFeedback && currentQuestion && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        selectedOption === currentQuestion.correctOptionIndex 
                          ? "bg-green-50 border-green-200" 
                          : "bg-red-50 border-red-200"
                      } border`}>
                        <h3 className="text-lg font-semibold mb-2">
                          {selectedOption === currentQuestion.correctOptionIndex 
                            ? currentQuestion.feedback.title || "Correto!"
                            : "Ops, não foi dessa vez!"
                          }
                        </h3>
                        
                        {currentQuestion.feedback.illustration && (
                          <img 
                            src={currentQuestion.feedback.illustration} 
                            alt="Feedback"
                            className="w-full max-w-sm mx-auto mb-4 rounded"
                          />
                        )}
                        
                        <p>
                          {selectedOption === currentQuestion.correctOptionIndex 
                            ? currentQuestion.feedback.text || "Boa resposta!"
                            : `A resposta correta era: "${currentQuestion.options[currentQuestion.correctOptionIndex]}". ${currentQuestion.feedback.text || ""}`
                          }
                        </p>
                      </div>

                      <Button 
                        onClick={nextQuestion}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        {questionIndex + 1 < quizQuestions.length ? "Próxima Pergunta" : "Finalizar Quiz"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Student;