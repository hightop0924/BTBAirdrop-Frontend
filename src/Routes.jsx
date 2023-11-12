// pages
import Claim from "./pages/Claim";
import Stake from "./pages/Stake";

// define routes
const Routes = [
  {
    path: "/",
    element: <Claim />,
  },
  {
    path: "/claim",
    element: <Claim />,
  },
  {
    path: "/stake",
    element: <Stake />,
  },
];

export default Routes;
