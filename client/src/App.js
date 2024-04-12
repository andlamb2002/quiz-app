import React, { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api');
      const data = await response.json();
      setData(data);
    }
    fetchData();
  }
  , []);

  return (
    <div>
      {data && data.message}
    </div>
  );
}

export default App;
