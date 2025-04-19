import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Indicator } from "@shared/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Form schema for indicator
const indicatorFormSchema = z.object({
  code: z.string().min(2, "Le code doit contenir au moins 2 caractères").max(10, "Le code ne doit pas dépasser 10 caractères"),
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  description: z.string().min(10, "La description doit contenir au moins 10 caractères"),
  type: z.enum(["core", "optional"]),
  objective: z.string().min(2, "L'objectif doit être spécifié"),
  maxCompensation: z.number().int().positive("La rémunération maximale doit être positive"),
});

type IndicatorFormValues = z.infer<typeof indicatorFormSchema>;

interface IndicatorFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingIndicator?: Indicator;
}

export default function IndicatorForm({ isOpen, onClose, editingIndicator }: IndicatorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<IndicatorFormValues>({
    resolver: zodResolver(indicatorFormSchema),
    defaultValues: editingIndicator || {
      code: "",
      name: "",
      description: "",
      type: "core",
      objective: "",
      maxCompensation: 0,
    },
  });
  
  const createIndicatorMutation = useMutation({
    mutationFn: async (data: IndicatorFormValues) => {
      return apiRequest("POST", "/api/indicators", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Indicateur créé",
        description: "L'indicateur a été créé avec succès",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'indicateur: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const updateIndicatorMutation = useMutation({
    mutationFn: async (data: IndicatorFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      return apiRequest("PATCH", `/api/indicators/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/indicators"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Indicateur mis à jour",
        description: "L'indicateur a été mis à jour avec succès",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'indicateur: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: IndicatorFormValues) {
    setIsSubmitting(true);
    
    if (editingIndicator) {
      updateIndicatorMutation.mutate({ ...data, id: editingIndicator.id });
    } else {
      createIndicatorMutation.mutate(data);
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editingIndicator ? "Modifier l'indicateur" : "Ajouter un nouvel indicateur"}</DialogTitle>
          <DialogDescription>
            {editingIndicator 
              ? "Modifiez les informations de l'indicateur ci-dessous." 
              : "Remplissez les informations pour ajouter un nouvel indicateur ACI."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: S01, O03" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="core">Indicateur socle</SelectItem>
                        <SelectItem value="optional">Indicateur optionnel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'indicateur" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description détaillée de l'indicateur" 
                      {...field} 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objectif</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 100%, Min. 8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxCompensation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rémunération max (€)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Montant maximal" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                    {editingIndicator ? "Mise à jour..." : "Création..."}
                  </div>
                ) : (
                  editingIndicator ? "Mettre à jour" : "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}