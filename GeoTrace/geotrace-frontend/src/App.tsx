import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageContainer } from './components/layout/PageContainer';
import { TracerouteProvider, useTracerouteContext } from './context/TracerouteContext';
import { Home } from './pages/Home';
import { TraceResults } from './pages/TraceResults';
import { History } from './pages/History';
import { About } from './pages/About';

function AppLayout() {
  const { backendConnected } = useTracerouteContext();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar backendConnected={backendConnected} />
      <PageContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<TraceResults />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </PageContainer>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TracerouteProvider>
        <AppLayout />
      </TracerouteProvider>
    </BrowserRouter>
  );
}
