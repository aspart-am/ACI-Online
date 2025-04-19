import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import MissionTable from "@/components/missions/MissionTable";
import MissionForm from "@/components/missions/MissionForm";

export default function Missions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: missionsData, isLoading: loadingMissions } = useQuery({
    queryKey: ["/api/missions"],
  });
  
  const { data: indicatorsData, isLoading: loadingIndicators } = useQuery({
    queryKey: ["/api/indicators"],
  });
  
  const { data: associatesData, isLoading: loadingAssociates } = useQuery({
    queryKey: ["/api/associates"],
  });
  
  const isLoading = loadingMissions || loadingIndicators || loadingAssociates;
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Filter missions based on search query, status filter and active tab
  const filteredMissions = missionsData.filter((mission: any) => {
    const indicator = indicatorsData.find((i: any) => i.id === mission.indicatorId);
    const associate = associatesData.find((a: any) => a.id === mission.associateId);
    
    // Check if mission matches search query
    const matchesSearch = searchQuery === "" || 
      (indicator && indicator.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (indicator && indicator.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (associate && `${associate.firstName} ${associate.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Check if mission matches status filter
    const matchesStatus = statusFilter === "all" || mission.status === statusFilter;
    
    // Check if mission matches active tab (based on indicator type)
    const matchesTab = activeTab === "all" || 
      (indicator && indicator.type === activeTab);
    
    return matchesSearch && matchesStatus && matchesTab;
  });
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Missions</h1>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Input 
              type="text"
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="validated">Validé</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="not_validated">Non validé</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Mission
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Toutes les missions</TabsTrigger>
          <TabsTrigger value="core">Indicateurs socles</TabsTrigger>
          <TabsTrigger value="optional">Indicateurs optionnels</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <MissionTable 
            missions={filteredMissions} 
            associates={associatesData} 
            indicators={indicatorsData} 
          />
        </TabsContent>
      </Tabs>
      
      <MissionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        associates={associatesData}
        indicators={indicatorsData}
      />
    </div>
  );
}
