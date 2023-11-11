// layouts
import Overview from "./pages/Overview";

// pages
import Claim from "./pages/Claim";
import Calculator from "./pages/Calculator";
import Stake from "./pages/Stake";
import Calendar from "./pages/Calendar";
import Docs from "./pages/Docs";

// define routes
const Routes = [
  {
    path: "/",
    element: <Overview />,
  },
  {
    path: "/overview",
    element: <Overview />,
  },
  {
    path: "/claim",
    element: <Claim />,
  },
  {
    path: "/calculator",
    element: <Calculator />,
  },
  {
    path: "/stake",
    element: <Stake />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/docs",
    element: <Docs />,
  },
];

export default Routes;
