'use client'

interface LoadingProps {
  fullScreen?: boolean;
  variant?: 'spinner' | 'dots' | 'bar';
  text?: string;
}

const Loading = ({ fullScreen = false, variant = 'spinner', text = 'Loading...' }: LoadingProps) => {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[200px]'}`}>
      {variant === 'spinner' && (
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      )}
      <span className="ml-3">{text}</span>
    </div>
  )
}

export default Loading