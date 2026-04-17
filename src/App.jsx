import {BrowserRouter,Routes,Route} from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import PrivateRoute from "./components/PrivateRoute";
import Tasks from "./pages/Tasks";
import ProjectDetails from "./pages/ProjectDetails";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Members from "./pages/Members";
import Navbar from "./components/Navbar";

export default function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<ProtectedRoute>
                                          <Dashboard />
                                          </ProtectedRoute>}/>
        <Route path="/create-project" element={<ProtectedRoute>
                                              <CreateProject />
                                              </ProtectedRoute>}/>
        <Route path="/edit-project/:id" element={<ProtectedRoute>
                                                 <EditProject />
                                                 </ProtectedRoute>}/>
        <Route path="/tasks" element={<ProtectedRoute>
                                      <Tasks />
                                      </ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute>
                                             <ProjectDetails />
                                             </ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute>
                                         <Projects />
                                         </ProtectedRoute>}/>
        <Route path="/notifications" element={<ProtectedRoute>
                                              <Notifications />
                                              </ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute>
                                        <Profile />
                                        </ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute>
                                        <Members />
                                        </ProtectedRoute>} />
        <Route path="/navbar" element={<ProtectedRoute>
                                        <Navbar />
                                        </ProtectedRoute>} />
        
      </Routes>
    </BrowserRouter>
  );
}