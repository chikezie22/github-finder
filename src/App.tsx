import { Toaster } from 'sonner';
import UserSearch from './components/user-search';

const App = () => {
  return (
    <div className="container">
      <h1>Github Finder</h1>
      <UserSearch />
      <Toaster />
    </div>
  );
};

export default App;
