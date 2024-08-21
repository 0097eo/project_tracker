import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Home from './Pages/Home';
import Navigation from './Components/Navigation';
import VerifyEmail from './Utils/VerifyEmail';
import AdminDashboard from './Pages/AdminDashboard';
import StudentDashboard from './Pages/StudentDashboard';

const App = () => {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/signup' element={<Signup/>} />
          <Route path='/verify-email' element={<VerifyEmail/>} />
          <Route path='/admin-dashboard' element={<AdminDashboard/>} />
          <Route path='/student-dashboard' element={<StudentDashboard/>} />
        </Routes>
      </div>
 
    </Router>
  )
}

export default App