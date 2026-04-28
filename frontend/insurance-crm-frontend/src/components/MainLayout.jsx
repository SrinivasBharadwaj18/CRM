import { useSelector } from "react-redux";
import Navbar from "./Navbar"; // Path to your new Navbar

const MainLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth || {});
  
  const isAgent = user?.role === 'agent';
  const isManagement = user?.role === 'owner' || user?.role === 'lead';

  const layoutStyle = {
    // Pushes content 260px right if Agent (Sidebar)
    marginLeft: isAgent ? "260px" : "0",
    // Pushes content 70px down if Admin (Top Nav)
    paddingTop: isManagement ? "70px" : "0",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    transition: "margin-left 0.3s ease",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={layoutStyle}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;