require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const testJobs = [
  {
    title: 'Full-Stack Developer for E-commerce Platform',
    description: 'We are looking for an experienced full-stack developer to build a modern e-commerce platform with React and Node.js. Must have experience with payment gateways and inventory management systems.',
    budget: '$5000-$10000',
    budget_type: 'fixed',
    experience_level: 'Expert',
    client_rank: 'Excellent',
    skills: 'React, Node.js, PostgreSQL, Stripe, Docker',
    client_country_name: 'United States',
    published_at: '2025-09-27T10:30:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef1',
    raw: { source: 'test_data' }
  },
  {
    title: 'Mobile App Developer (React Native)',
    description: 'Need a skilled React Native developer to create a cross-platform mobile app for fitness tracking. Integration with health APIs required.',
    budget: '$3000-$6000',
    budget_type: 'fixed',
    experience_level: 'Intermediate',
    client_rank: 'Good',
    skills: 'React Native, TypeScript, Firebase, REST API',
    client_country_name: 'United Kingdom',
    published_at: '2025-09-27T09:15:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef2',
    raw: { source: 'test_data' }
  },
  {
    title: 'Python Backend Engineer for AI Startup',
    description: 'Join our AI startup as a backend engineer. Work with FastAPI, PostgreSQL, and ML models. Experience with LLMs is a plus.',
    budget: '$70-$90',
    budget_type: 'hourly',
    experience_level: 'Expert',
    client_rank: 'Excellent',
    skills: 'Python, FastAPI, PostgreSQL, Docker, OpenAI API',
    client_country_name: 'Canada',
    published_at: '2025-09-27T08:00:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef3',
    raw: { source: 'test_data' }
  },
  {
    title: 'WordPress Developer - Theme Customization',
    description: 'Looking for a WordPress expert to customize an existing theme. Need responsive design improvements and plugin integration.',
    budget: '$500-$1000',
    budget_type: 'fixed',
    experience_level: 'Intermediate',
    client_rank: 'Good',
    skills: 'WordPress, PHP, CSS, JavaScript, Elementor',
    client_country_name: 'Australia',
    published_at: '2025-09-27T07:45:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef4',
    raw: { source: 'test_data' }
  },
  {
    title: 'DevOps Engineer - AWS Infrastructure',
    description: 'Seeking DevOps engineer to set up and maintain AWS infrastructure. Experience with Kubernetes, Terraform, and CI/CD pipelines required.',
    budget: '$60-$80',
    budget_type: 'hourly',
    experience_level: 'Expert',
    client_rank: 'Excellent',
    skills: 'AWS, Kubernetes, Terraform, Docker, Jenkins',
    client_country_name: 'Germany',
    published_at: '2025-09-27T06:30:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef5',
    raw: { source: 'test_data' }
  },
  {
    title: 'UI/UX Designer for SaaS Dashboard',
    description: 'Need a talented UI/UX designer to redesign our SaaS dashboard. Must provide Figma designs and work closely with development team.',
    budget: '$2000-$4000',
    budget_type: 'fixed',
    experience_level: 'Intermediate',
    client_rank: 'Good',
    skills: 'Figma, UI Design, UX Design, Prototyping',
    client_country_name: 'Netherlands',
    published_at: '2025-09-27T05:00:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef6',
    raw: { source: 'test_data' }
  },
  {
    title: 'Blockchain Developer - Smart Contracts',
    description: 'Looking for blockchain developer to create and audit smart contracts on Ethereum. Solidity expertise required.',
    budget: '$100-$150',
    budget_type: 'hourly',
    experience_level: 'Expert',
    client_rank: 'Risky',
    skills: 'Solidity, Ethereum, Web3.js, Hardhat, Smart Contracts',
    client_country_name: 'Singapore',
    published_at: '2025-09-27T04:20:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef7',
    raw: { source: 'test_data' }
  },
  {
    title: 'Data Scientist - ML Model Development',
    description: 'Seeking data scientist to develop predictive ML models for customer churn. Experience with scikit-learn and TensorFlow needed.',
    budget: '$50-$70',
    budget_type: 'hourly',
    experience_level: 'Expert',
    client_rank: 'Excellent',
    skills: 'Python, TensorFlow, scikit-learn, Pandas, Jupyter',
    client_country_name: 'United States',
    published_at: '2025-09-27T03:10:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef8',
    raw: { source: 'test_data' }
  },
  {
    title: 'Vue.js Frontend Developer',
    description: 'Need Vue.js developer for ongoing project. Must be comfortable with Vuex, Vue Router, and component-based architecture.',
    budget: '$35-$50',
    budget_type: 'hourly',
    experience_level: 'Intermediate',
    client_rank: 'Average',
    skills: 'Vue.js, Vuex, JavaScript, HTML, CSS, Tailwind',
    client_country_name: 'Poland',
    published_at: '2025-09-27T02:00:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef9',
    raw: { source: 'test_data' }
  },
  {
    title: 'QA Automation Engineer',
    description: 'Looking for QA automation engineer to build test frameworks. Experience with Selenium, Cypress, and CI/CD integration required.',
    budget: '$40-$60',
    budget_type: 'hourly',
    experience_level: 'Intermediate',
    client_rank: 'Good',
    skills: 'Selenium, Cypress, JavaScript, Jest, GitHub Actions',
    client_country_name: 'India',
    published_at: '2025-09-27T01:00:00Z',
    upwork_url: 'https://www.upwork.com/jobs/~01234567890abcdef10',
    raw: { source: 'test_data' }
  }
];

async function seedTestData() {
  console.log('Загрузка тестовых данных в Supabase...');

  const { data, error } = await supabase
    .from('jobs')
    .insert(testJobs);

  if (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }

  console.log('Успешно добавлено 10 тестовых вакансий!');
  process.exit(0);
}

seedTestData();