import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UserCircle, MoreVertical, Edit, Trash, ClipboardList } from "lucide-react";
import { type Associate, type Mission, type Indicator } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AssociateForm from "./AssociateForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MissionForm from "../missions/MissionForm";

interface AssociateCardProps {
  associate: Associate;
  missions: Mission[];
  indicators: Indicator[];
}

export default function AssociateCard({ associate, missions, indicators }: AssociateCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isNewMissionFormOpen, setIsNewMissionFormOpen] = useState(false);
  const [isMissionsDialogOpen, setIsMissionsDialogOpen] = useState(false);

  // Helper to get profession display name
  const getProfessionName = (profession: string) => {
    switch (profession) {
      case "doctor": return "Médecin généraliste";
      case "pharmacist": return "Pharmacien";
      case "nurse": return "Infirmier(e)";
      case "physiotherapist": return "Kinésithérapeute";
      default: return "Autre professionnel";
    }
  };
  
  // Calculate mission completion
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.status === "validated").length;
  const completionPercentage = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  
  // Calculate total compensation
  const totalCompensation = missions.reduce((sum, mission) => sum + (mission.compensation || 0), 0);
  
  // Get top 3 missions to display
  const topMissions = missions.slice(0, 3).map(mission => {
    const indicator = indicators.find(i => i.id === mission.indicatorId);
    return {
      ...mission,
      indicatorName: indicator ? indicator.name : "Unknown",
      status: mission.status
    };
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated": return "bg-green-600";
      case "in_progress": return "bg-amber-500";
      case "not_validated": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  // Delete associate mutation
  const deleteAssociate = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/associates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/associates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Associé supprimé",
        description: "L'associé a été supprimé avec succès",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'associé: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete button click
  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    deleteAssociate.mutate(associate.id);
  };

  // Handle edit button click
  const handleEdit = () => {
    setIsEditFormOpen(true);
  };

  // Handle new mission button click
  const handleNewMission = () => {
    setIsNewMissionFormOpen(true);
  };

  // Handle view missions button click
  const handleViewMissions = () => {
    setIsMissionsDialogOpen(true);
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                <UserCircle size={32} />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-800">Dr. {associate.firstName} {associate.lastName}</h3>
                <p className="text-sm text-gray-600">{getProfessionName(associate.profession)}</p>
                {associate.profession === "doctor" && associate.patientCount && (
                  <p className="text-xs text-gray-500 mt-1">
                    Patients: {associate.patientCount} 
                    {associate.activePatients && ` (File active: ${associate.activePatients})`}
                  </p>
                )}
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="mr-2 h-4 w-4" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleNewMission}>
                    <ClipboardList className="mr-2 h-4 w-4" /> Nouvelle mission
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Missions complétées</span>
              <span className="font-medium">{completedMissions}/{totalMissions}</span>
            </div>
            <Progress value={completionPercentage} className="h-2 bg-gray-200" />
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Missions assignées</h4>
            <div className="space-y-2">
              {topMissions.map((mission) => (
                <div key={mission.id} className="flex items-center">
                  <span className={`h-2 w-2 rounded-full ${getStatusColor(mission.status)} mr-2`}></span>
                  <span className="text-sm text-gray-600">{mission.indicatorName}</span>
                </div>
              ))}
              {missions.length > 3 && (
                <div className="text-sm text-gray-500 italic">
                  + {missions.length - 3} autres missions
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">Rémunération totale</p>
                <p className="text-xl font-bold text-gray-900">{totalCompensation.toLocaleString('fr-FR')} €</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleViewMissions}>
                Voir les missions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet associé ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les missions associées à cet associé seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit associate form */}
      <AssociateForm 
        isOpen={isEditFormOpen} 
        onClose={() => setIsEditFormOpen(false)} 
        editingAssociate={{
          id: associate.id,
          firstName: associate.firstName,
          lastName: associate.lastName,
          profession: associate.profession,
          email: associate.email,
          phone: associate.phone || undefined,
          patientCount: associate.patientCount === null ? undefined : associate.patientCount,
          activePatients: associate.activePatients === null ? undefined : associate.activePatients
        }}
      />

      {/* New mission form */}
      <MissionForm
        isOpen={isNewMissionFormOpen}
        onClose={() => setIsNewMissionFormOpen(false)}
        associates={[associate]}
        indicators={indicators}
      />

      {/* View missions dialog */}
      <Dialog open={isMissionsDialogOpen} onOpenChange={setIsMissionsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Missions de {associate.firstName} {associate.lastName}</DialogTitle>
            <DialogDescription>
              Liste des missions assignées à cet associé
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[500px]">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Indicateur</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">Valeur</th>
                  <th className="text-right px-4 py-2 text-sm font-medium text-gray-500">Rémunération</th>
                </tr>
              </thead>
              <tbody>
                {missions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">Aucune mission assignée</td>
                  </tr>
                ) : (
                  missions.map((mission) => {
                    const indicator = indicators.find(i => i.id === mission.indicatorId);
                    return (
                      <tr key={mission.id} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm">
                          {indicator ? `${indicator.code} - ${indicator.name}` : "Inconnu"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {indicator ? (indicator.type === "core" ? "Socle" : "Optionnel") : ""}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            mission.status === "validated" ? "bg-green-100 text-green-800" :
                            mission.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {mission.status === "validated" ? "Validé" :
                             mission.status === "in_progress" ? "En cours" :
                             "Non validé"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {mission.currentValue || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-right">
                          {mission.status === "validated" 
                            ? `${(mission.compensation || 0).toLocaleString('fr-FR')} €` 
                            : `0 € / ${indicator?.maxCompensation.toLocaleString('fr-FR')} €`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Total: <span className="font-bold">{totalCompensation.toLocaleString('fr-FR')} €</span>
            </p>
            <Button onClick={handleNewMission}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Nouvelle mission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
