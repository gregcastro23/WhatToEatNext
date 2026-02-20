import type { NextPageContext } from "next";

interface ErrorProps {
  statusCode: number | undefined;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div
      style={{ padding: "20px", textAlign: "center", fontFamily: "sans-serif" }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
        {statusCode ? `${statusCode} - Server Error` : "An error occurred"}
      </h1>
      <p style={{ color: "#666" }}>
        {statusCode === 404
          ? "The page you are looking for does not exist."
          : "An unexpected error has occurred."}
      </p>
      <a
        href="/"
        style={{
          color: "#6b46c1",
          textDecoration: "underline",
          marginTop: "1rem",
          display: "inline-block",
        }}
      >
        Return Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
