'use client'

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      <span className="ml-3">Loading...</span>
    </div>
  )
}

export default Loading