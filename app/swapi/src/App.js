import {useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
 useEffect(()=>{
  fetch('/json/films.json')
    .then(response => response.json())
    .then(setData).then(console.log(data));
 }, []);
  
 return (
   <div className='App-header'>
      {data.map(film => 
       <div key={film.pk}>{film.pk} - {film.fields.title}</div>)}
    </div>
  );
}

export default App;
