import { RouterProvider } from "react-router-dom";
import { router } from "./routing/Routing";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      {/* <AuthProvider> */}
        <RouterProvider router={router} />
      {/* </AuthProvider> */}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
