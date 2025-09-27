const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const prompts = [
  {
    name: 'filter_v1',
    prompt_type: 'filter',
    prompt_text: `You are an AI job filter for an Upwork freelancer specializing in AI/ML automation and development.

Analyze this job posting and determine if it's relevant and worth pursuing.

Job Details:
Title: {title}
Description: {description}
Budget: {budget} ({budget_type})
Skills: {skills}
Client Rating: {client_rank}
Experience Level: {experience_level}

Return ONLY a JSON object with this exact structure:
{
  "passed": true/false,
  "reason": "Brief explanation why this job passed or failed the filter"
}

Filter PASS if:
- Related to AI, ML, automation, web scraping, bots, API integration
- Budget is reasonable (>$100 for fixed or >$15/hr for hourly)
- Client is not flagged as Risky
- Clear requirements and scope

Filter FAIL if:
- Unrelated to AI/automation (graphic design, video editing, etc)
- Very low budget or unclear payment
- Suspicious or spam-like posting
- Requires skills completely outside expertise`,
    version: 1,
    is_active: true
  },
  {
    name: 'analysis_v1',
    prompt_type: 'analysis',
    prompt_text: `You are an AI analyst helping an Upwork freelancer evaluate job opportunities.

User Profile:
{user_profile}

Job Details:
Title: {title}
Description: {description}
Budget: {budget} ({budget_type})
Skills: {skills}
Client Rating: {client_rank}
Client Country: {client_country}
Experience Level: {experience_level}
Raw Data: {raw}

Provide a detailed analysis in JSON format:
{
  "overall_score": 0-100,
  "fit_score": 0-100,
  "client_quality_score": 0-100,
  "budget_score": 0-100,
  "competition_level": "low/medium/high",
  "recommendation": "apply/skip/maybe",
  "key_strengths": ["strength 1", "strength 2"],
  "concerns": ["concern 1", "concern 2"],
  "client_analysis": "Brief analysis of client quality and potential for long-term work",
  "negotiation_tips": "Suggestions for rate negotiation or project scope discussion",
  "estimated_time": "Estimate how long this project might take",
  "suggested_approach": "Brief suggestion on how to approach this project"
}

Consider:
- Match between required skills and user's expertise
- Budget appropriateness for scope
- Client history and reliability
- Competition likelihood
- Long-term relationship potential`,
    version: 1,
    is_active: true
  },
  {
    name: 'cover_letter_v1',
    prompt_type: 'cover_letter',
    prompt_text: `You are helping write a compelling Upwork cover letter.

User Profile:
{user_profile}

Job Details:
{job_details}

AI Analysis:
{ai_analysis}

Write a professional, concise cover letter (150-250 words) that:
- Directly addresses the client's needs
- Highlights relevant experience
- Shows understanding of the project
- Includes a clear call to action
- Is personalized (not generic)
- Professional but friendly tone

Return ONLY the cover letter text, no JSON wrapper.`,
    version: 1,
    is_active: true
  }
];

async function seedPrompts() {
  console.log('Заполнение базовых промптов...\n');

  for (const prompt of prompts) {
    const { data, error } = await supabase
      .from('ai_prompts')
      .upsert(prompt, { onConflict: 'name' });

    if (error) {
      console.error(`Ошибка при добавлении ${prompt.name}:`, error.message);
    } else {
      console.log(`✓ Добавлен промпт: ${prompt.name}`);
    }
  }

  console.log('\nБазовые промпты успешно добавлены!');
}

async function seedUserProfile() {
  console.log('\nСоздание базового профиля пользователя...\n');

  const defaultProfile = {
    user_id: 'default',
    email: 'user@example.com',
    full_name: 'AI Automation Specialist',
    skills: [
      'Python',
      'JavaScript',
      'AI/ML',
      'Web Scraping',
      'API Integration',
      'Automation',
      'OpenAI',
      'LangChain',
      'Next.js',
      'Node.js'
    ],
    experience: {
      years: 5,
      specialization: 'AI automation, web scraping, bot development',
      key_projects: [
        'AI-powered data extraction systems',
        'Custom automation workflows',
        'ChatGPT integrations'
      ]
    },
    constraints: {
      no_adult_content: true,
      no_crypto_trading: true,
      min_budget_fixed: 100,
      min_rate_hourly: 15
    },
    goals: {
      target_hourly_rate: 50,
      preferred_project_types: ['AI automation', 'web scraping', 'API development'],
      prefer_long_term: true
    },
    portfolio_items: [],
    hourly_rate_min: 25,
    hourly_rate_target: 50,
    availability_hours_per_week: 40
  };

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(defaultProfile, { onConflict: 'user_id' });

  if (error) {
    console.error('Ошибка при создании профиля:', error.message);
  } else {
    console.log('✓ Базовый профиль пользователя создан');
  }
}

async function main() {
  await seedPrompts();
  await seedUserProfile();
  console.log('\n✓ Все данные успешно добавлены!');
}

main().catch(console.error);