
import { Routes,Route} from 'react-router-dom'
import Landing from "./pages/landing"
import "./App.css"
import Authentication from './pages/Authentication'
import VideoMeet from './pages/VideoMeet'
function App() {

  return (
       <>
          <Routes>
            <Route path="/" element={<Landing/>}></Route>
            <Route path="/auth" element={<Authentication/>}></Route>
            <Route path="/:url" element={<VideoMeet/>}></Route>
          </Routes>
       </> 
  )
}

export default App
