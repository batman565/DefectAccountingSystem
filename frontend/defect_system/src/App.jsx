import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router";
import { setNavigate } from "./Axios";
import { Login } from "./page/Login/Login";
import { Mainpage } from "./page/Main/Main";
import { ObjectDetails } from "./page/Defect/defect";
import { DefectDetails } from "./page/Defect/defectdetails";

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/" element={<Mainpage />}></Route>
      <Route path="/objects/:objectId" element={<ObjectDetails />}></Route>
      <Route path="/defects/:defectId" element={<DefectDetails />}></Route>
    </Routes>
  );
}

export default App;
