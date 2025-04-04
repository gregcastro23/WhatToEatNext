import LoadingComponent from '@/components/ui/Loading';

interface LoadingProps {
  fullScreen?: boolean;
  variant?: 'spinner' | 'dots' | 'bar';
  text?: string;
}

const PageLoading: React.FC<LoadingProps> = ({ fullScreen = false, variant = 'spinner', text = 'Loading...' }) => {
  return (
    <LoadingComponent
      fullScreen={fullScreen}
      variant={variant}
      text={text}
    />
  );
}

export default PageLoading; 