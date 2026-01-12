import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { StockRefreshProvider } from "@/context/StockRefreshContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Default from './pages/Default';
import Home from './pages/Home';
import NoPage from './pages/NoPage';

function App() {  
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route index element={<Default />} />
              <Route path="home" element={
                <StockRefreshProvider>
                  <Home />
                </StockRefreshProvider>
              } />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App