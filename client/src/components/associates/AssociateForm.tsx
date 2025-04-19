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

// Form schema for associate
const associateFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  profession: z.enum(["doctor", "pharmacist", "nurse", "physiotherapist", "other"]),
  email: z.string().email("L'adresse email est invalide"),
  phone: z.string().optional(),
  patientCount: z.number().int().positive("Le nombre de patients doit être positif").optional(),
  activePatients: z.number().int().positive("La file active doit être positive").optional(),
});

type AssociateFormValues = z.infer<typeof associateFormSchema>;

interface AssociateFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingAssociate?: AssociateFormValues & { id: number };
}

export default function AssociateForm({ isOpen, onClose, editingAssociate }: AssociateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AssociateFormValues>({
    resolver: zodResolver(associateFormSchema),
    defaultValues: editingAssociate || {
      firstName: "",
      lastName: "",
      profession: "doctor",
      email: "",
      phone: "",
      patientCount: undefined,
      activePatients: undefined,
    },
  });
  
  const createAssociateMutation = useMutation({
    mutationFn: async (data: AssociateFormValues) => {
      return apiRequest("POST", "/api/associates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/associates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Associé créé",
        description: "L'associé a été créé avec succès",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'associé: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const updateAssociateMutation = useMutation({
    mutationFn: async (data: AssociateFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      return apiRequest("PATCH", `/api/associates/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/associates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Associé mis à jour",
        description: "L'associé a été mis à jour avec succès",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'associé: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: AssociateFormValues) {
    setIsSubmitting(true);
    
    if (editingAssociate) {
      updateAssociateMutation.mutate({ ...data, id: editingAssociate.id });
    } else {
      createAssociateMutation.mutate(data);
    }
  }
  
  const getProfessionLabel = (value: string) => {
    const labels: Record<string, string> = {
      doctor: "Médecin généraliste",
      pharmacist: "Pharmacien",
      nurse: "Infirmier(e)",
      physiotherapist: "Kinésithérapeute",
      other: "Autre professionnel",
    };
    return labels[value] || value;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingAssociate ? "Modifier l'associé" : "Ajouter un nouvel associé"}</DialogTitle>
          <DialogDescription>
            {editingAssociate 
              ? "Modifiez les informations de l'associé ci-dessous." 
              : "Remplissez les informations pour ajouter un nouvel associé à la MSP."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profession</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une profession" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="doctor">Médecin généraliste</SelectItem>
                      <SelectItem value="pharmacist">Pharmacien</SelectItem>
                      <SelectItem value="nurse">Infirmier(e)</SelectItem>
                      <SelectItem value="physiotherapist">Kinésithérapeute</SelectItem>
                      <SelectItem value="other">Autre professionnel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="Téléphone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch("profession") === "doctor" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre total de patients</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Nombre de patients" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="activePatients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File active</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Patients vus dans l'année" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
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
                    {editingAssociate ? "Mise à jour..." : "Création..."}
                  </div>
                ) : (
                  editingAssociate ? "Mettre à jour" : "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
