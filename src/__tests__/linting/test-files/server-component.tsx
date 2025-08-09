// Next.js 15 Server Component
async function ServerComponent() {
  const data = await fetch('https://api.example.com/data');
  const json = await data.json();

  return (
    <div>
      <h1>Server Component</h1>
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
}

export default ServerComponent;
