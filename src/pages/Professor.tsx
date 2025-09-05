import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import QuestionnaireUpload from "@/components/QuestionnaireUpload";
import { Users, FileText, BarChart3, Plus } from "lucide-react";

interface Student {
  nomeCompleto: string;
  cpf: string;
  idade: number;
  genero: string;
  corPele: string;
  escolaridade: string;
  telefone: string;
  score: number;
  rank: string;
}

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

const Professor = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAuthToken } = useAuth();
  const { toast } = useToast();

  const loadStudents = async () => {
    try {
      const response = await fetch('https://aprender-em-movimento.onrender.com/get_students_data');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados dos estudantes",
        variant: "destructive",
      });
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await fetch('https://aprender-em-movimento.onrender.com/api/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perguntas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perguntas",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadStudents(), loadQuestions()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  const getRank = (score: number) => {
    const ranks = [
      { score: 0, title: "Aluno Novo (Iniciante)" },
      { score: 1, title: "Cordão Cru (Iniciante)" },
      { score: 3, title: "Cordão Amarelo (Estagiário)" },
      { score: 5, title: "Cordão Laranja (Graduado)" },
      { score: 8, title: "Cordão Azul (Instrutor)" },
      { score: 12, title: "Cordão Verde (Professor)" },
      { score: 18, title: "Cordão Roxo (Mestre)" },
      { score: 25, title: "Cordão Marrom (Contramestre)" },
      { score: 35, title: "Cordão Vermelho (Mestre)" }
    ];

    let currentRank = ranks[0].title;
    for (let rank of ranks) {
      if (score >= rank.score) currentRank = rank.title;
      else break;
    }
    return currentRank;
  };

  const deleteQuestion = async (theme: string, question: string) => {
    const token = getAuthToken();
    if (!token) return;

    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      const response = await fetch('https://aprender-em-movimento.onrender.com/delete_question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme, question })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Pergunta excluída com sucesso",
        });
        loadQuestions();
      } else {
        throw new Error('Erro ao excluir pergunta');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir pergunta",
        variant: "destructive",
      });
    }
  };

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.theme]) {
      acc[question.theme] = [];
    }
    acc[question.theme].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">
            Área do Professor
          </h1>
          <p className="text-gray-600">
            Gerencie questionários, visualize dados dos alunos e faça upload de novos conteúdos
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload XML
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Questionários
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Alunos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <QuestionnaireUpload />
          </TabsContent>

          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle>Questionários Disponíveis</CardTitle>
                <CardDescription>
                  {questions.length} perguntas em {Object.keys(groupedQuestions).length} temas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedQuestions).map(([theme, themeQuestions]) => (
                    <div key={theme} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-purple-600 mb-3 capitalize">
                        {theme} ({themeQuestions.length} perguntas)
                      </h3>
                      <div className="space-y-2">
                        {themeQuestions.map((question, index) => (
                          <div key={question.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="font-medium">{question.question}</p>
                              <p className="text-sm text-gray-600">
                                {question.options.length} opções | Resposta: {question.options[question.correctOptionIndex]}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteQuestion(question.theme, question.question)}
                            >
                              Excluir
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(groupedQuestions).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum questionário encontrado. Faça upload de um arquivo XML para começar.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Dados dos Alunos</CardTitle>
                <CardDescription>
                  {students.length} alunos cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Idade</TableHead>
                        <TableHead>Gênero</TableHead>
                        <TableHead>Escolaridade</TableHead>
                        <TableHead>Pontuação</TableHead>
                        <TableHead>Graduação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{student.nomeCompleto}</TableCell>
                          <TableCell>{student.cpf}</TableCell>
                          <TableCell>{student.idade}</TableCell>
                          <TableCell>{student.genero}</TableCell>
                          <TableCell>{student.escolaridade}</TableCell>
                          <TableCell>{student.score || 0}</TableCell>
                          <TableCell>{getRank(student.score || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {students.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum aluno cadastrado ainda.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Professor;