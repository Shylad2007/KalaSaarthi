import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">KalaSaarthi Foundation</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}
