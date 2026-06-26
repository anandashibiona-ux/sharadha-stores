import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 animate-fade-in py-12">
      <div className="text-center max-w-lg w-full">
        
        {/* Beautiful Graphic */}
        <div className="relative w-48 h-48 mx-auto mb-10">
          <div className="absolute inset-0 bg-orange-100 rounded-full animate-pulse blur-2xl opacity-60"></div>
          <div className="relative bg-white border border-gray-100 shadow-2xl rounded-full w-full h-full flex flex-col items-center justify-center overflow-hidden">
            <div className="text-7xl mb-2">🌿</div>
            <div className="font-mono text-gray-300 text-sm font-bold tracking-widest">404 ERROR</div>
          </div>
          
          {/* Decorative floating badges */}
          <div className="absolute -top-4 -left-4 bg-yellow-50 text-yellow-600 font-bold px-4 py-2 rounded-2xl -rotate-12 shadow-sm border border-yellow-100 text-xs">
            Lost?
          </div>
          <div className="absolute -bottom-2 -right-4 bg-orange-50 text-orange-600 font-bold px-4 py-2 rounded-2xl rotate-6 shadow-sm border border-orange-100 text-xs">
            Not Found
          </div>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl text-gray-900 mb-5 font-bold tracking-tight">Oops! Page Not Found</h1>
        <p className="text-gray-500 mb-10 leading-relaxed text-base sm:text-lg">
          Looks like we've misplaced this recipe! The page or product you are looking for doesn't exist, has been moved, or an incorrect link was followed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="btn-primary py-3.5 px-8 font-bold text-sm shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 rounded-lg"
          >
            Return to Store
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="py-3.5 px-8 font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all rounded-lg"
          >
            Go Back
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-sm text-gray-400">
          If you believe this is a system error, please contact support.
        </div>
      </div>
    </div>
  )
}
