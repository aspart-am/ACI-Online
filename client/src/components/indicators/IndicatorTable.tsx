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
import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Indicator, type Mission, type Associate } from "@shared/schema";
import IndicatorForm from "./IndicatorForm";
import IndicatorDetails from "./IndicatorDetails";
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

interface IndicatorTableProps {
  indicators: Indicator[];
}

export default function IndicatorTable({ indicators }: IndicatorTableProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all missions to determine indicator status
  const { data: missions = [] } = useQuery<Mission[]>({
    queryKey: ["/api/missions"],
  });
  
  // Get all associates
  const { data: associates = [] } = useQuery<Associate[]>({
    queryKey: ["/api/associates"],
  });
  
  // Mutation for deleting an indicator
  const deleteIndicatorMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/indicators/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Indicateur supprimé",
        description: "L'indicateur a été supprimé avec succès",
      });
      setIsDeleteDialogOpen(false);
      setSelectedIndicator(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'indicateur: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Event handlers
  const handleViewDetails = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsViewDetailsOpen(true);
  };
  
  const handleEdit = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsEditFormOpen(true);
  };
  
  const handleDelete = (indicator: Indicator) => {
    setSelectedIndicator(indicator);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedIndicator) {
      deleteIndicatorMutation.mutate(selectedIndicator.id);
    }
  };
  
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
    return indicatorMissions.reduce((sum: number, mission) => sum + (mission.compensation || 0), 0);
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
  
  // Calculate pagination
  const totalPages = Math.ceil(indicators.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedIndicators = indicators.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Code</TableHead>
                <TableHead className="font-medium">Nom</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Objectif</TableHead>
                <TableHead className="font-medium">Statut Global</TableHead>
                <TableHead className="font-medium">Rémunération Max</TableHead>
                <TableHead className="font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIndicators.map((indicator) => {
                const status = getMissionStatus(indicator.id);
                const compensation = getMissionCompensation(indicator.id);
                
                return (
                  <TableRow key={indicator.id}>
                    <TableCell className="font-medium">{indicator.code}</TableCell>
                    <TableCell>{indicator.name}</TableCell>
                    <TableCell>
                      {indicator.type === "core" ? "Socle" : "Optionnel"}
                    </TableCell>
                    <TableCell>{indicator.objective}</TableCell>
                    <TableCell>
                      {renderStatusBadge(status)}
                    </TableCell>
                    <TableCell>{indicator.maxCompensation.toLocaleString('fr-FR')} €</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(indicator)}>
                            <Eye className="mr-2 h-4 w-4" /> Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(indicator)}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(indicator)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {paginatedIndicators.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Aucun indicateur trouvé
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
                  {Math.min(startIndex + itemsPerPage, indicators.length)}
                </span>{" "}
                sur <span className="font-medium">{indicators.length}</span> indicateurs
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
      
      {/* Formulaire d'édition de l'indicateur */}
      {selectedIndicator && (
        <IndicatorForm
          isOpen={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false);
            setSelectedIndicator(null);
          }}
          editingIndicator={selectedIndicator}
        />
      )}
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet indicateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les missions liées à cet indicateur pourraient être affectées.
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
      
      {/* Détails de l'indicateur */}
      {selectedIndicator && (
        <IndicatorDetails
          isOpen={isViewDetailsOpen}
          onClose={() => {
            setIsViewDetailsOpen(false);
            setSelectedIndicator(null);
          }}
          indicator={selectedIndicator}
          missions={missions.filter((m: Mission) => m.indicatorId === selectedIndicator.id)}
          associates={associates}
        />
      )}
    </>
  );
}
