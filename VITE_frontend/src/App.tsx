import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import Home from './pages/Home';
import Default from './pages/Default';
import NoPage from './pages/NoPage';
// import { Button } from "@/components/ui/button"


function App() {  
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {/* <Button>Click me</Button> */}
        <BrowserRouter>
          <Routes>
            <Route path="/">
              <Route index element={<Default />} />
              <Route path="home" element={<Home />} />
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