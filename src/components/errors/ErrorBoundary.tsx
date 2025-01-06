'use client'

import React, { Component, ErrorInfo } from 'react'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/errorHandler'

interface Props {
  children: React.ReactNode
  FallbackComponent: React.ComponentType<{
    error: Error
    resetErrorBoundary: () => void
  }>
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}

interface State {
  error: Error | null
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error)
    errorHandler.handleError(error, {
      context: 'ErrorBoundary',
      errorInfo
    })
    this.props.onError?.(error, errorInfo)
  }

  resetErrorBoundary = () => {
    this.props.onReset?.()
    this.setState({ error: null, hasError: false })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <this.props.FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      )
    }

    return this.props.children
  }
} 