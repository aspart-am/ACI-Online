import { useLocation } from "wouter";
import { Menu, Search, Bell, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Header() {
  const [location] = useLocation();
  
  // Determine the page title based on the current route
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Tableau de bord";
      case "/indicators":
        return "Indicateurs ACI";
      case "/associates":
        return "Associés";
      case "/compensation":
        return "Rémunération";
      case "/missions":
        return "Missions";
      case "/settings":
        return "Paramètres";
      case "/help":
        return "Aide";
      default:
        return "MSP ACI Manager";
    }
  };
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-6">
      <div className="flex items-center">
        <button className="lg:hidden mr-2 text-gray-600">
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
      </div>
      
      <div className="ml-auto flex items-center space-x-4">
        <div className="relative">
          <Input 
            type="text" 
            placeholder="Rechercher..." 
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={16} />
          </div>
        </div>
        
        <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
          <Bell size={20} />
        </button>
        
        <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
          <HelpCircle size={20} />
        </button>
      </div>
    </header>
  );
}
