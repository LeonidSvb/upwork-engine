import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getJobs() {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(50);

  return jobs || [];
}

export default async function HomePage() {
  const jobs = await getJobs();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Upwork Engine</h1>
          <p className="text-muted-foreground mt-1">AI-powered job intake system</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Вакансии</h2>
            <p className="text-muted-foreground mt-1">Всего: {jobs.length}</p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">Вакансий пока нет</p>
            <p className="text-sm text-muted-foreground mt-2">Ожидайте данных от Volna webhook</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Вакансия</TableHead>
                  <TableHead>Бюджет</TableHead>
                  <TableHead>Опыт</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Навыки</TableHead>
                  <TableHead>Страна</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[300px]">
                        <div className="font-semibold text-sm mb-1">{job.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {job.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.budget && (
                        <div className="text-sm">
                          <div className="font-medium text-green-600">{job.budget}</div>
                          <div className="text-xs text-muted-foreground capitalize">{job.budget_type}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.experience_level && (
                        <Badge variant="secondary">{job.experience_level}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.client_rank && (
                        <Badge
                          variant={
                            job.client_rank === 'Excellent' ? 'default' :
                            job.client_rank === 'Risky' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {job.client_rank}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.skills && (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {job.skills.split(',').slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill.trim()}
                            </Badge>
                          ))}
                          {job.skills.split(',').length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.split(',').length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {job.client_country_name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {job.published_at && new Date(job.published_at).toLocaleDateString('ru-RU')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <a
                          href={job.upwork_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Открыть
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </div>
  );
}