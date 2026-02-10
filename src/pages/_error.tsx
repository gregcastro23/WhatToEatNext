import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        {statusCode ? `${statusCode} - Server Error` : 'An error occurred'}
      </h1>
      <p style={{ color: '#666' }}>
        {statusCode === 404
          ? 'The page you are looking for could not be found.'
          : 'An unexpected error has occurred.'}
      </p>
      <a href="/" style={{ color: '#7c3aed', marginTop: '1rem', display: 'inline-block' }}>
        Return Home
      </a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
