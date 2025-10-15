import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheContext } from "@/context";
import logout from "../../assets/logout.png";
import { useNavigate } from "react-router-dom";



export default function Navbar() {
    const { userEmail, userData, LogOut } = useTheContext() as any;
    const Navigate = useNavigate();

    return (
        <div className="items-center flex justify-between mt-[10px] px-4">
            <div className="flex flex-col ">
                <h1 className="text-white font-bold text-[24px]">{userData?.storeName}</h1>
                <h5 className="text-gray-400 font-light text-[20px]">{userData?.address}</h5>
            </div>
            <div className="flex gap-3">
                <Avatar>
                    <AvatarImage/>
                    <AvatarFallback>{userEmail?.toString()?.slice(0,1)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <button onClick={()=>{
                    Navigate("/");
                    LogOut();
                }} className="flex items-center gap-2">
                    Logout<img className="h-[20px]" src={logout} alt="logout" />
                </button>
            </div>
        </div>
    );
}