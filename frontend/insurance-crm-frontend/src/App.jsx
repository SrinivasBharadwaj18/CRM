// App.jsx Snippet
function App() {
  const { user } = useSelector((state) => state.auth || {});
  const location = useLocation();
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Bulletproof Check: Are we on the login screen?
  const isAuthPage = location.pathname === "/" || location.pathname === "/login";

  // Final Logic: Show sidebar ONLY if user exists AND we are not on the login page
  const shouldShowSidebar = user && !isAuthPage;

  return (
    <div className="app-layout" style={styles.layout}>
      {shouldShowSidebar && (
        <Navbar isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      {user?.role === 'agent' && !isAuthPage && (
        <BreakGuard isOnBreak={isOnBreak} setIsOnBreak={setIsOnBreak} />
      )}

      <div style={{
        ...styles.mainContent,
        marginLeft: shouldShowSidebar ? '260px' : '0'
      }}>
        <AppRoutes />
      </div>
    </div>
  );
}