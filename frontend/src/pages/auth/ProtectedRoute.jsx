import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, admin=false, buLead=false, bdLead=false, bdUser }) => {
    const { user, token } = useAuth();

    
    if(admin){
        return (user && user.role==="admin")  ? children :<Navigate to="/login" />;
    }else{
        return user ? children : <Navigate to="/login" />;
    }
};

export default ProtectedRoute;
