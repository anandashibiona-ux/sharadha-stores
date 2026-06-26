import { LoadingSpinner } from './LoadingSpinner'

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted">Loading...</p>
    </div>
  )
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="font-serif text-xl text-charcoal mb-2">{title}</h3>
      {description && <p className="text-sm text-muted mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-12 h-12 rounded-full bg-error-light flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="font-serif text-lg text-charcoal mb-2">Something went wrong</h3>
      <p className="text-sm text-muted mb-6">{message || 'Unable to load data. Please try again.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">Try again</button>
      )}
    </div>
  )
}
