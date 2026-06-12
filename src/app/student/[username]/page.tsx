import { PublicPortfolioPage } from '@/components/portfolio/PublicPortfolioPage';

export default function StudentPortfolioPage() {
  return <PublicPortfolioPage />;
}

export function generateMetadata({ params }: { params: { username: string } }) {
  return {
    title: `Student Portfolio - CampusCred`,
    description: 'View this verified student portfolio on CampusCred. See certificates, completed tasks, internships, and CampusCred Score.',
  };
}
