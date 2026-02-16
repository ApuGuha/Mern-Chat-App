import { useState } from 'react';
import './App.css';
import Home from "./pages/Home";
import ChatPage from './pages/ChatPage';
import { Routes, Route} from "react-router-dom";


function App() {
  return (
    <>
    <Routes>
      <Route path='/' element= {<Home/>}/>
      <Route path='/chats' element= {<ChatPage/>}/>
    </Routes>
    </>
  )
}

export default App
