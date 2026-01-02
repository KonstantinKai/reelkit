import { Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';

function App() {
  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
}

export default App;
