import { Outlet } from "react-router-dom";
import Header from "@/components/common/Header.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";

const PublicLayout = () => {
    return (
        <div className="flex h-svh min-w-0 flex-col overflow-hidden">
            <Header/>
            <ScrollArea className="flex-1">
                <Outlet/>
            </ScrollArea>
        </div>
    );
};

export default PublicLayout;
