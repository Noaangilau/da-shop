import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="pt-[88px] min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <p className="text-muted text-[10px] tracking-[0.4em] uppercase mb-4">Something went wrong</p>
          <h1 className="text-midnight font-black uppercase tracking-wide text-3xl mb-6">
            Page Didn't Load
          </h1>
          <p className="text-muted text-sm mb-8 leading-relaxed">
            We hit an unexpected error. Try reloading, or head back to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-midnight text-white text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 hover:bg-midnight/80 transition-colors"
            >
              Reload
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="border border-[#E5E5E5] text-midnight text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 hover:border-midnight transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    )
  }
}
