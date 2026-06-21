import { useNavigate } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <AppShell>
    <div className="flex flex-col items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-display font-bold text-primary/30 mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Page Not Found</h2>
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    </div>
    </AppShell>
  )
}
