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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6 max-w-md">
          <p className="text-mute text-[10px] tracking-[0.4em] uppercase mb-4">Something went wrong</p>
          <h1 className="text-ink font-black uppercase tracking-wide text-3xl mb-6">
            Page Didn't Load
          </h1>
          <p className="text-mute text-sm mb-8 leading-relaxed">
            We hit an unexpected error. Try reloading, or head back to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-ink text-white text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 hover:bg-ink/80 transition-colors"
            >
              Reload
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="border border-rule text-ink text-[11px] tracking-[0.15em] uppercase font-bold px-8 py-3.5 hover:border-ink transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </main>
    )
  }
}
