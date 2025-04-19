import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { UserPlus, Search, Filter } from "lucide-react";
import AssociateCard from "@/components/associates/AssociateCard";
import AssociateForm from "@/components/associates/AssociateForm";

export default function Associates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProfession, setFilterProfession] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { data: associatesData, isLoading: loadingAssociates } = useQuery({
    queryKey: ["/api/associates"],
  });
  
  const { data: indicatorsData, isLoading: loadingIndicators } = useQuery({
    queryKey: ["/api/indicators"],
  });
  
  const { data: missionsData, isLoading: loadingMissions } = useQuery({
    queryKey: ["/api/missions"],
  });
  
  const isLoading = loadingAssociates || loadingIndicators || loadingMissions;
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Filter associates based on search query and profession filter
  const filteredAssociates = associatesData.filter((associate: any) => {
    const matchesSearch = searchQuery === "" || 
      `${associate.firstName} ${associate.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProfession = filterProfession === "all" || associate.profession === filterProfession;
    
    return matchesSearch && matchesProfession;
  });
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Associés</h1>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64">
            <Input 
              type="text"
              placeholder="Rechercher un associé..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Select value={filterProfession} onValueChange={setFilterProfession}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Profession" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les professions</SelectItem>
              <SelectItem value="doctor">Médecins</SelectItem>
              <SelectItem value="pharmacist">Pharmaciens</SelectItem>
              <SelectItem value="nurse">Infirmiers</SelectItem>
              <SelectItem value="physiotherapist">Kinésithérapeutes</SelectItem>
              <SelectItem value="other">Autres</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsFormOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvel Associé
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssociates.map((associate: any) => (
          <AssociateCard 
            key={associate.id}
            associate={associate}
            missions={missionsData.filter((m: any) => m.associateId === associate.id)}
            indicators={indicatorsData}
          />
        ))}
        
        {filteredAssociates.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Aucun associé ne correspond à votre recherche</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <AssociateForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
      />
    </div>
  );
}
