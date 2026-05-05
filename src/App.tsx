import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Quote from './pages/Quote';
import Contact from './pages/Contact';
import Brands from './pages/Brands';
import AdminPreview from './pages/AdminPreview';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="about" element={<About />} />
        <Route path="brands" element={<Brands />} />
        <Route path="contact" element={<Contact />} />
        <Route path="quote" element={<Quote />} />
        <Route path="faq" element={<FAQ />} />
      </Route>
      <Route path="admin" element={<AdminPreview />} />
    </Routes>
  );
}

export default App;
