import { createClient } from '@supabase/supabase-js';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Upwork Engine</h1>
          <p className="text-gray-600 mt-1">AI-powered job intake system</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Вакансии</h2>
            <p className="text-gray-600 mt-1">Всего: {jobs.length}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>

                  <div className="flex gap-4 text-sm text-gray-600 mb-3">
                    {job.budget && (
                      <span className="font-medium text-green-600">
                        {job.budget} ({job.budget_type})
                      </span>
                    )}
                    {job.experience_level && (
                      <span>{job.experience_level}</span>
                    )}
                    {job.client_rank && (
                      <span className={`font-medium ${
                        job.client_rank === 'Excellent' ? 'text-green-600' :
                        job.client_rank === 'Risky' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        Client: {job.client_rank}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">
                    {job.description}
                  </p>

                  {job.skills && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.split(',').slice(0, 5).map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 text-sm text-gray-500">
                    {job.client_country_name && (
                      <span>📍 {job.client_country_name}</span>
                    )}
                    {job.published_at && (
                      <span>
                        📅 {new Date(job.published_at).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                </div>

                <a
                  href={job.upwork_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Открыть →
                </a>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Вакансий пока нет</p>
            <p className="text-sm mt-2">Ожидайте данных от Volna webhook</p>
          </div>
        )}
      </main>
    </div>
  );
}