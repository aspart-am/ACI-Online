import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, PieChart, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Indicator, type Mission } from "@shared/schema";

export default function Compensation() {
  const [period, setPeriod] = useState("2023");
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard"],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Une erreur est survenue</p>
          <p className="mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }
  
  const { stats, indicators, missions } = data;
  
  // Calculate percentages for charts
  const corePercentage = Math.round((stats.validatedCoreIndicators / stats.totalCoreIndicators) * 100);
  const optionalPercentage = Math.round((stats.validatedOptionalIndicators / stats.totalOptionalIndicators) * 100);
  
  // Get all indicators with compensation data
  const indicatorsWithCompensation = indicators.map((indicator: Indicator) => {
    const indicatorMissions = missions.filter((m: Mission) => m.indicatorId === indicator.id);
    const compensation = indicatorMissions.reduce((sum: number, m: Mission) => sum + m.compensation, 0);
    const isValidated = indicatorMissions.some((m: Mission) => m.status === "validated");
    
    return {
      ...indicator,
      currentCompensation: compensation,
      percentage: isValidated ? 100 : 0
    };
  });
  
  // Sort indicators by type and then by compensation (highest first)
  const sortedIndicators = [...indicatorsWithCompensation]
    .sort((a, b) => {
      // First sort by type (core first)
      if (a.type !== b.type) {
        return a.type === "core" ? -1 : 1;
      }
      // Then by compensation (highest first)
      return b.maxCompensation - a.maxCompensation;
    });
  
  // Calculate total compensation data
  const totalCompensation = stats.fixedCompensation + stats.variableCompensation;
  const maxTotalCompensation = stats.maxFixedCompensation + stats.maxVariableCompensation;
  const remainingPotential = maxTotalCompensation - totalCompensation;
  const totalPercentage = Math.round((totalCompensation / maxTotalCompensation) * 100);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Rémunération</h1>
        <div className="flex items-center mt-4 md:mt-0">
          <span className="text-sm text-gray-500 mr-2">Période :</span>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sélectionner une année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">Année 2023</SelectItem>
              <SelectItem value="2022">Année 2022</SelectItem>
              <SelectItem value="2021">Année 2021</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Récapitulatif financier</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Rémunération totale</p>
                <p className="text-xl font-bold text-gray-900">{totalCompensation.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-gray-500 mt-1">sur {maxTotalCompensation.toLocaleString('fr-FR')} € disponibles</p>
                <Progress value={totalPercentage} className="h-2 bg-gray-200 mt-2" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Rémunération fixe (socle)</p>
                <p className="text-xl font-bold text-gray-900">{stats.fixedCompensation.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-gray-500 mt-1">{corePercentage}% des indicateurs validés</p>
                <Progress value={corePercentage} className="h-2 bg-gray-200 mt-2" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Rémunération variable</p>
                <p className="text-xl font-bold text-gray-900">{stats.variableCompensation.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-gray-500 mt-1">{optionalPercentage}% des indicateurs validés</p>
                <Progress value={optionalPercentage} className="h-2 bg-gray-200 mt-2" />
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Reste à percevoir potentiel</p>
                <p className="text-xl font-bold text-amber-600">{remainingPotential.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-amber-600 mt-1">Indicateurs en cours</p>
                <Progress value={(remainingPotential / maxTotalCompensation) * 100} className="h-2 bg-amber-200 mt-2" />
              </div>
            </div>
            
            <Tabs defaultValue="indicators">
              <TabsList className="mb-4">
                <TabsTrigger value="indicators" className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Rémunération par indicateur
                </TabsTrigger>
                <TabsTrigger value="distribution" className="flex items-center">
                  <PieChart className="mr-2 h-4 w-4" />
                  Répartition
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="indicators">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {sortedIndicators.map((indicator) => (
                    <div key={indicator.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full ${indicator.type === 'core' ? 'bg-primary' : 'bg-green-500'} mr-2`}></span>
                          <span className="text-sm text-gray-600">{indicator.code} - {indicator.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {indicator.currentCompensation.toLocaleString('fr-FR')} € / {indicator.maxCompensation.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <Progress value={indicator.percentage} className="h-2 bg-gray-200" />
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="distribution">
                <div className="flex flex-col sm:flex-row justify-around space-y-8 sm:space-y-0">
                  <div className="flex flex-col items-center">
                    <h3 className="text-base font-medium text-gray-700 mb-2">Répartition socle/optionnel</h3>
                    <div className="flex items-center justify-center space-x-8">
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-primary" 
                            style={{ 
                              clipPath: `polygon(0 0, 100% 0, 100% ${corePercentage}%, 0 ${corePercentage}%)`,
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-700">{corePercentage}%</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-600">Socles</p>
                        <p className="text-xs text-gray-500">{stats.fixedCompensation.toLocaleString('fr-FR')} €</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24">
                          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                          <div 
                            className="absolute inset-0 rounded-full border-8 border-green-500" 
                            style={{ 
                              clipPath: `polygon(0 0, 100% 0, 100% ${optionalPercentage}%, 0 ${optionalPercentage}%)`,
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-700">{optionalPercentage}%</span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-gray-600">Optionnels</p>
                        <p className="text-xs text-gray-500">{stats.variableCompensation.toLocaleString('fr-FR')} €</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <h3 className="text-base font-medium text-gray-700 mb-2">Progression globale</h3>
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                      <div 
                        className="absolute inset-0 rounded-full border-8 border-primary" 
                        style={{ 
                          clipPath: `polygon(0 0, 100% 0, 100% ${totalPercentage}%, 0 ${totalPercentage}%)`,
                        }}
                      ></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-gray-700">{totalPercentage}%</span>
                        <span className="text-xs text-gray-500">complété</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-600">
                      {totalCompensation.toLocaleString('fr-FR')} € / {maxTotalCompensation.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-end">
              <Button className="bg-primary hover:bg-primary-dark">
                <Download className="mr-2 h-4 w-4" />
                Exporter le rapport financier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
