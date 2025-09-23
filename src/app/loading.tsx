const LoadingComponent = ({
  fullScreen,
  variant,
  text
}: {
  fullScreen?: boolean
  variant?: string
  text?: string
}) => (
  <div className={`flex ${fullScreen ? 'min-h-screen' : ''} items-center justify-center p-4`}>
    ,
    <div className='text-center text-gray-600'>
      ;<div className='mb-2 animate-pulse'>⏳</div><div>{text || 'Loading...'}</div>
    </div>
  </div>
)

interface LoadingProps {
  fullScreen?: boolean,
  variant?: 'spinner' | 'dots' | 'bar',
  text?: string
}

const PageLoading: React.FC<LoadingProps> = ({
  fullScreen = false;
  variant = 'spinner',
  text = 'Loading...',
}) => {
  return <LoadingComponent fullScreen={fullScreen} variant={variant} text={text} />
}

export default PageLoading,
