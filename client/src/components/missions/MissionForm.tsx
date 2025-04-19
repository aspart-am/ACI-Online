import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Mission, type Associate, type Indicator } from "@shared/schema";

// Form schema for mission
const missionFormSchema = z.object({
  associateId: z.number().int().positive("Veuillez sélectionner un associé"),
  indicatorId: z.number().int().positive("Veuillez sélectionner un indicateur"),
  status: z.enum(["validated", "in_progress", "not_validated"]),
  currentValue: z.string().optional(),
  compensation: z.number().int().min(0, "La compensation ne peut pas être négative"),
  notes: z.string().optional(),
});

type MissionFormValues = z.infer<typeof missionFormSchema>;

interface MissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  associates: Associate[];
  indicators: Indicator[];
  editingMission?: Mission;
}

export default function MissionForm({ 
  isOpen, 
  onClose, 
  associates, 
  indicators, 
  editingMission 
}: MissionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Helper to get default values for the form
  const getDefaultValues = () => {
    if (editingMission) {
      return {
        associateId: editingMission.associateId,
        indicatorId: editingMission.indicatorId,
        status: editingMission.status,
        currentValue: editingMission.currentValue || "",
        compensation: editingMission.compensation || 0,
        notes: editingMission.notes || "",
      };
    }
    
    return {
      associateId: 0,
      indicatorId: 0,
      status: "in_progress" as const,
      currentValue: "",
      compensation: 0,
      notes: "",
    };
  };
  
  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: getDefaultValues(),
  });
  
  // Watch for changes to indicatorId and status to update compensation
  const indicatorId = form.watch("indicatorId");
  const status = form.watch("status");
  
  // Update compensation when indicator or status changes
  const updateCompensation = () => {
    if (indicatorId && status === "validated") {
      const indicator = indicators.find(i => i.id === indicatorId);
      if (indicator) {
        form.setValue("compensation", indicator.maxCompensation);
      }
    } else {
      form.setValue("compensation", 0);
    }
  };
  
  // Create mission mutation
  const createMission = useMutation({
    mutationFn: async (data: MissionFormValues) => {
      return apiRequest("POST", "/api/missions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Mission créée",
        description: "La mission a été créée avec succès",
      });
      form.reset(getDefaultValues());
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la mission: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Update mission mutation
  const updateMission = useMutation({
    mutationFn: async (data: MissionFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      return apiRequest("PATCH", `/api/missions/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Mission mise à jour",
        description: "La mission a été mise à jour avec succès",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la mission: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: MissionFormValues) {
    setIsSubmitting(true);
    
    if (editingMission) {
      // Crée un nouvel objet avec les données du formulaire et l'id de la mission en édition
      const updatedMission = { 
        ...data, 
        id: editingMission.id 
      };
      updateMission.mutate(updatedMission);
    } else {
      createMission.mutate(data);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingMission ? "Modifier la mission" : "Créer une nouvelle mission"}</DialogTitle>
          <DialogDescription>
            {editingMission 
              ? "Modifiez les détails de la mission ci-dessous." 
              : "Remplissez les informations pour créer une nouvelle mission."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="associateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associé</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value?.toString() || ""}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un associé" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {associates.map((associate) => (
                          <SelectItem key={associate.id} value={associate.id.toString()}>
                            Dr. {associate.firstName} {associate.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="indicatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicateur</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(parseInt(value));
                        setTimeout(updateCompensation, 0);
                      }} 
                      defaultValue={field.value?.toString() || ""}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un indicateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="core-header" disabled>Indicateurs socles</SelectItem>
                        {indicators
                          .filter(i => i.type === "core")
                          .map((indicator) => (
                            <SelectItem key={indicator.id} value={indicator.id.toString()}>
                              {indicator.code} - {indicator.name}
                            </SelectItem>
                          ))}
                        <SelectItem value="optional-header" disabled>Indicateurs optionnels</SelectItem>
                        {indicators
                          .filter(i => i.type === "optional")
                          .map((indicator) => (
                            <SelectItem key={indicator.id} value={indicator.id.toString()}>
                              {indicator.code} - {indicator.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setTimeout(updateCompensation, 0);
                      }} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="validated">Validé</SelectItem>
                        <SelectItem value="in_progress">En cours</SelectItem>
                        <SelectItem value="not_validated">Non validé</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur actuelle</FormLabel>
                    <FormControl>
                      <Input placeholder="Valeur actuelle" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="compensation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rémunération (€)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Rémunération" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      value={field.value || 0}
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notes ou commentaires sur cette mission"
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {editingMission ? "Mise à jour..." : "Création..."}
                  </div>
                ) : (
                  editingMission ? "Mettre à jour" : "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
