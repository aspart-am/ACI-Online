import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  EuroIcon,
  ClipboardList,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
}

const SidebarLink = ({ href, icon, text, isActive }: SidebarLinkProps) => {
  return (
    <li>
      <Link href={href}>
        <a className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
          isActive 
            ? "bg-primary bg-opacity-10 border-l-3 border-primary text-primary" 
            : "text-gray-700"
        }`}>
          <span className={`mr-3 ${isActive ? "text-primary" : "text-gray-500"}`}>
            {icon}
          </span>
          <span>{text}</span>
        </a>
      </Link>
    </li>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  
  return (
    <div className="w-64 bg-white shadow-md flex-shrink-0 h-full fixed left-0 top-0 z-10">
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold">
              MSP
            </div>
            <div className="ml-2 text-lg font-semibold text-gray-800">MSP ACI Manager</div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
          <ul>
            <li className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Principal
              </span>
            </li>
            <SidebarLink 
              href="/" 
              icon={<LayoutDashboard size={20} />} 
              text="Tableau de bord" 
              isActive={location === "/"} 
            />
            <SidebarLink 
              href="/indicators" 
              icon={<CheckSquare size={20} />} 
              text="Indicateurs ACI" 
              isActive={location === "/indicators"} 
            />
            <SidebarLink 
              href="/associates" 
              icon={<Users size={20} />} 
              text="Associés" 
              isActive={location === "/associates"} 
            />
            <SidebarLink 
              href="/compensation" 
              icon={<EuroIcon size={20} />} 
              text="Rémunération" 
              isActive={location === "/compensation"} 
            />
            <SidebarLink 
              href="/missions" 
              icon={<ClipboardList size={20} />} 
              text="Missions" 
              isActive={location === "/missions"} 
            />
            
            <li className="px-4 py-2 mt-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </span>
            </li>
            <SidebarLink 
              href="/settings" 
              icon={<Settings size={20} />} 
              text="Paramètres" 
              isActive={location === "/settings"} 
            />
            <SidebarLink 
              href="/help" 
              icon={<HelpCircle size={20} />} 
              text="Aide" 
              isActive={location === "/help"} 
            />
          </ul>
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-light text-white flex items-center justify-center">
              <span className="text-sm font-medium">AD</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-700">Dr. André Dupont</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
