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
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, Eye, CheckCircle, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import MissionForm from "./MissionForm";
import { type Mission, type Associate, type Indicator } from "@shared/schema";

interface MissionTableProps {
  missions: Mission[];
  associates: Associate[];
  indicators: Indicator[];
}

export default function MissionTable({ missions, associates, indicators }: MissionTableProps) {
  const [page, setPage] = useState(1);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(missions.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedMissions = missions.slice(startIndex, startIndex + itemsPerPage);
  
  // Delete mission mutation
  const deleteMission = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/missions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Mission supprimée",
        description: "La mission a été supprimée avec succès",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer la mission: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update mission status mutation
  const updateMissionStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/missions/${id}`, { 
        status, 
        compensation: status === "validated" ? 
          indicators.find(i => i.id === missions.find(m => m.id === id)?.indicatorId)?.maxCompensation : 0 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la mission a été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour le statut: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Helper to get associate name
  const getAssociateName = (associateId: number) => {
    const associate = associates.find(a => a.id === associateId);
    return associate ? `Dr. ${associate.firstName} ${associate.lastName}` : "Inconnu";
  };
  
  // Helper to get indicator details
  const getIndicator = (indicatorId: number) => {
    return indicators.find(i => i.id === indicatorId);
  };
  
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
  
  // Handle edit button click
  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setIsEditFormOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = (mission: Mission) => {
    setMissionToDelete(mission);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (missionToDelete) {
      deleteMission.mutate(missionToDelete.id);
    }
  };
  
  // Handle validate button click
  const handleValidate = (mission: Mission) => {
    updateMissionStatus.mutate({ id: mission.id, status: "validated" });
  };
  
  // Handle reject button click
  const handleReject = (mission: Mission) => {
    updateMissionStatus.mutate({ id: mission.id, status: "not_validated" });
  };
  
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Indicateur</TableHead>
                <TableHead className="font-medium">Associé</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Objectif</TableHead>
                <TableHead className="font-medium">Valeur actuelle</TableHead>
                <TableHead className="font-medium">Statut</TableHead>
                <TableHead className="font-medium">Rémunération</TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMissions.map((mission) => {
                const indicator = getIndicator(mission.indicatorId);
                return (
                  <TableRow key={mission.id}>
                    <TableCell className="font-medium">
                      {indicator ? `${indicator.code} - ${indicator.name}` : "Inconnu"}
                    </TableCell>
                    <TableCell>{getAssociateName(mission.associateId)}</TableCell>
                    <TableCell>
                      {indicator ? (indicator.type === "core" ? "Socle" : "Optionnel") : ""}
                    </TableCell>
                    <TableCell>{indicator?.objective}</TableCell>
                    <TableCell>{mission.currentValue || "-"}</TableCell>
                    <TableCell>
                      {renderStatusBadge(mission.status)}
                    </TableCell>
                    <TableCell>
                      {mission.status === "validated" 
                        ? `${mission.compensation.toLocaleString('fr-FR')} €` 
                        : `0 € / ${indicator?.maxCompensation.toLocaleString('fr-FR')} €`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {mission.status !== "validated" && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleValidate(mission)}
                            title="Valider"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {mission.status !== "not_validated" && (
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleReject(mission)}
                            title="Rejeter"
                          >
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(mission)}>
                              <Edit className="mr-2 h-4 w-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(mission)} className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {paginatedMissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Aucune mission trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{" "}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, missions.length)}
                </span>{" "}
                sur <span className="font-medium">{missions.length}</span> missions
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit mission form */}
      {editingMission && (
        <MissionForm 
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          associates={associates}
          indicators={indicators}
          editingMission={editingMission}
        />
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette mission ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La mission sera définitivement supprimée.
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
    </>
  );
}
