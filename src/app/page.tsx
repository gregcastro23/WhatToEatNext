export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">What to Eat Next</h1>
          <p className="text-indigo-600 mb-4">
            Food recommendations based on the current celestial energies
          </p>
          
          <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Application is loading...</p>
          </div>
        </div>
        
        {/* Navigation Jump Links */}
        <nav className="flex flex-wrap justify-center gap-4 mb-8 bg-white rounded-lg shadow-md p-4 sticky top-2 z-10">
          <a href="#cuisine" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cuisine Recommendations
          </a>
          <a href="#ingredients" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Ingredient Recommendations
          </a>
        </nav>
        
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          <div id="cuisine" className="bg-white rounded-lg shadow-md p-5 w-full">
            <h2 className="text-xl font-semibold mb-4">Cuisine Recommendations</h2>
            <p className="text-gray-600">Cuisine recommendations will be loaded here once the application is fully functional.</p>
          </div>
          
          <div id="ingredients" className="bg-white rounded-lg shadow-md p-5 w-full">
            <h2 className="text-xl font-semibold mb-4">Ingredient Recommendations</h2>
            <p className="text-gray-600">Ingredient recommendations will be loaded here once the application is fully functional.</p>
          </div>
        </div>
        
        <footer className="mt-12 text-center">
          <div className="mx-auto mb-4" style={{ maxWidth: '250px' }}>
            <form action="https://www.paypal.com/ncp/payment/SVN6Q368TKKLS" method="post" target="_blank">
              <input 
                type="submit" 
                value="HELP" 
                style={{
                  textAlign: 'center',
                  border: 'none',
                  borderRadius: '0.25rem',
                  width: '100%',
                  padding: '0 2rem',
                  height: '2.625rem',
                  fontWeight: 'bold',
                  backgroundColor: '#FFD140',
                  color: '#000000',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: '1rem',
                  lineHeight: '1.25rem',
                  cursor: 'pointer'
                }}
              />
            </form>
          </div>
        </footer>
      </div>
    </div>
  );
}
