import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Indicator, type Mission, type Associate } from "@shared/schema";

interface IndicatorDetailsProps {
  indicator?: Indicator;
  missions?: Mission[];
  associates?: Associate[];
  isOpen: boolean;
  onClose: () => void;
}

export default function IndicatorDetails({ 
  indicator, 
  missions = [], 
  associates = [], 
  isOpen, 
  onClose 
}: IndicatorDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  if (!indicator) return null;
  
  // Get missions for this indicator
  const indicatorMissions = missions.filter(m => m.indicatorId === indicator.id);
  
  // Calculate overall status
  const getOverallStatus = () => {
    if (indicatorMissions.length === 0) return "not_validated";
    if (indicatorMissions.some(m => m.status === "validated")) return "validated";
    if (indicatorMissions.some(m => m.status === "in_progress")) return "in_progress";
    return "not_validated";
  };
  
  const status = getOverallStatus();
  
  // Calculate total compensation
  const totalCompensation = indicatorMissions.reduce((sum, m) => sum + (m.compensation || 0), 0);
  
  // Get associates with this indicator
  const associatesWithMission = indicatorMissions.map(mission => {
    const associate = associates.find(a => a.id === mission.associateId);
    return {
      ...mission,
      associate
    };
  });
  
  // Helper to render status badge
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{indicator.code} - {indicator.name}</DialogTitle>
          <DialogDescription>
            {indicator.type === "core" ? "Indicateur socle" : "Indicateur optionnel"}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="missions">Missions ({indicatorMissions.length})</TabsTrigger>
            <TabsTrigger value="associates">Associés ({associatesWithMission.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Description</h3>
                    <p className="mt-1 text-gray-600">{indicator.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Objectif</h3>
                    <p className="mt-1 text-gray-600">{indicator.objective}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                      <div className="mt-2">{renderStatusBadge(status)}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Rémunération maximale</h3>
                      <p className="mt-2 text-xl font-bold text-gray-900">
                        {indicator.maxCompensation.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Rémunération actuelle</h3>
                      <p className="mt-2 text-xl font-bold text-primary">
                        {totalCompensation.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="missions">
            <Card>
              <CardContent className="pt-6">
                {indicatorMissions.length > 0 ? (
                  <div className="space-y-4">
                    {indicatorMissions.map(mission => {
                      const associate = associates.find(a => a.id === mission.associateId);
                      return (
                        <div key={mission.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {associate ? `Dr. ${associate.firstName} ${associate.lastName}` : "Associé inconnu"}
                            </p>
                            <div className="flex items-center mt-1">
                              <span className="text-sm text-gray-500 mr-2">Statut:</span>
                              {renderStatusBadge(mission.status)}
                            </div>
                            {mission.notes && (
                              <p className="text-sm text-gray-600 mt-1">{mission.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-gray-700">
                              <span className="font-medium">{(mission.compensation || 0).toLocaleString('fr-FR')} €</span>
                              {mission.status !== "validated" && (
                                <span className="text-gray-400"> / {indicator.maxCompensation.toLocaleString('fr-FR')} €</span>
                              )}
                            </p>
                            {mission.currentValue && (
                              <p className="text-sm text-gray-500">
                                Valeur actuelle: {mission.currentValue}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune mission assignée pour cet indicateur</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="associates">
            <Card>
              <CardContent className="pt-6">
                {associatesWithMission.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {associatesWithMission.map(({ id, associate, status, compensation }) => (
                      <div key={id} className="p-4 border rounded-lg">
                        {associate && (
                          <>
                            <h3 className="font-medium">Dr. {associate.firstName} {associate.lastName}</h3>
                            <p className="text-sm text-gray-500">{associate.profession === "doctor" ? "Médecin généraliste" : associate.profession}</p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Statut:</span>
                                {renderStatusBadge(status)}
                              </div>
                              <p className="font-medium">{(compensation || 0).toLocaleString('fr-FR')} €</p>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucun associé assigné à cet indicateur</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}