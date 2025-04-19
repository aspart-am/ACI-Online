import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Download } from "lucide-react";
import { type Indicator, type Mission } from "@shared/schema";

interface IndicatorTrackingProps {
  indicators: Indicator[];
  missions: Mission[];
}

export default function IndicatorTracking({ indicators, missions }: IndicatorTrackingProps) {
  const [activeTab, setActiveTab] = useState("core");
  
  // Filter indicators based on active tab
  const filteredIndicators = indicators.filter(indicator => {
    if (activeTab === "all") return true;
    return indicator.type === activeTab;
  });
  
  // Function to get mission status for an indicator
  const getMissionStatus = (indicatorId: number) => {
    const indicatorMissions = missions.filter(m => m.indicatorId === indicatorId);
    if (indicatorMissions.length === 0) return "not_validated";
    
    // If any mission is validated, return validated
    if (indicatorMissions.some(m => m.status === "validated")) return "validated";
    // If any mission is in progress, return in_progress
    if (indicatorMissions.some(m => m.status === "in_progress")) return "in_progress";
    // Otherwise all are not validated
    return "not_validated";
  };
  
  // Function to get mission compensation for an indicator
  const getMissionCompensation = (indicatorId: number) => {
    const indicatorMissions = missions.filter(m => m.indicatorId === indicatorId);
    return indicatorMissions.reduce((sum, mission) => sum + mission.compensation, 0);
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "validated":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validé</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En cours</Badge>;
      case "not_validated":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Non validé</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Suivi des indicateurs ACI</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm" className="flex items-center text-primary">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="core" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 border-b border-gray-200">
          <TabsTrigger value="core" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Indicateurs socles
          </TabsTrigger>
          <TabsTrigger value="optional" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Indicateurs optionnels
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Tous les indicateurs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">ID</TableHead>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">Indicateur</TableHead>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">Type</TableHead>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">Objectif</TableHead>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">Statut</TableHead>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">Rémunération</TableHead>
                  <TableHead className="font-medium text-xs uppercase text-gray-500">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIndicators.map((indicator) => {
                  const status = getMissionStatus(indicator.id);
                  const compensation = getMissionCompensation(indicator.id);
                  
                  return (
                    <TableRow key={indicator.id}>
                      <TableCell className="font-medium text-sm text-gray-900">{indicator.code}</TableCell>
                      <TableCell className="text-sm text-gray-800">{indicator.name}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {indicator.type === "core" ? "Socle" : "Optionnel"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">{indicator.objective}</TableCell>
                      <TableCell>
                        {renderStatusBadge(status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {status === "validated" 
                          ? `${compensation.toLocaleString('fr-FR')} €` 
                          : `0 € / ${indicator.maxCompensation.toLocaleString('fr-FR')} €`}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" className="text-primary hover:text-primary-dark">
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredIndicators.length}</span> sur <span className="font-medium">{filteredIndicators.length}</span> indicateurs
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="bg-primary bg-opacity-10 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                    1
                  </button>
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Suivant</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
