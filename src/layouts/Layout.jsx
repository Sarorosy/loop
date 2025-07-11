import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/header";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useAuth } from "../utils/idb";

export default function Layout() {
  const navigate = useNavigate();
  const {user} = useAuth();

  return (
    <div className="h-screen flex flex-col w-full">
      <Header />
      <main
        className="flex-grow w-full overflow-y-auto"
        id="scroll-container"
      >
        <div className="container m-0 max-w-[100%]">
          <div className="bg-[#F3F3F3]">
          <div className="max-w-[1250px] mx-auto py-5">
          <div className="bg-white py-4 px-4">
            <Outlet />
          </div>
          </div>
          </div>
        </div>
        <div className="border-t  bg-black text-white px-4 py-1 flex items-center justify-center">
          <p className="text-sm ">
            © {new Date().getFullYear()} LOOP. All Rights Reserved.
          </p>
        </div> 
      </main>
       
    </div>
  );
}
