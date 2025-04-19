import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Indicator, type Mission } from "@shared/schema";

interface CompensationSummaryProps {
  stats: {
    totalCoreIndicators: number;
    validatedCoreIndicators: number;
    totalOptionalIndicators: number;
    validatedOptionalIndicators: number;
    fixedCompensation: number;
    maxFixedCompensation: number;
    variableCompensation: number;
    maxVariableCompensation: number;
  };
  indicators: Indicator[];
  missions: Mission[];
}

export default function CompensationSummary({ 
  stats, 
  indicators, 
  missions 
}: CompensationSummaryProps) {
  // Calculate percentages for charts
  const corePercentage = Math.round((stats.validatedCoreIndicators / stats.totalCoreIndicators) * 100);
  const optionalPercentage = Math.round((stats.validatedOptionalIndicators / stats.totalOptionalIndicators) * 100);
  
  // Get top indicators by compensation
  const indicatorsWithMissions = indicators.map(indicator => {
    const indicatorMissions = missions.filter(m => m.indicatorId === indicator.id);
    const compensation = indicatorMissions.reduce((sum, m) => sum + m.compensation, 0);
    const isValidated = indicatorMissions.some(m => m.status === "validated");
    
    return {
      ...indicator,
      currentCompensation: compensation,
      isValidated
    };
  });
  
  // Sort indicators by compensation (highest first)
  const sortedIndicators = [...indicatorsWithMissions]
    .sort((a, b) => b.maxCompensation - a.maxCompensation)
    .slice(0, 5);
  
  // Calculate total compensation
  const totalCompensation = stats.fixedCompensation + stats.variableCompensation;
  const maxTotalCompensation = stats.maxFixedCompensation + stats.maxVariableCompensation;
  const remainingPotential = maxTotalCompensation - totalCompensation;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Synthèse de rémunération</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Période :</span>
          <Select defaultValue="2023">
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
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Répartition des indicateurs */}
            <div>
              <h3 className="text-base font-medium text-gray-700 mb-4">Répartition des indicateurs</h3>
              <div className="aspect-w-16 aspect-h-9 relative h-64">
                <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart 2: Rémunération par indicateur */}
            <div>
              <h3 className="text-base font-medium text-gray-700 mb-4">Rémunération par indicateur</h3>
              <div className="aspect-w-16 aspect-h-9 relative h-64">
                <div className="w-full h-full rounded-lg bg-gray-100 p-4">
                  <div className="space-y-3">
                    {sortedIndicators.map((indicator) => (
                      <div key={indicator.id}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{indicator.name}</span>
                          <span className="text-sm font-medium text-gray-800">
                            {indicator.isValidated 
                              ? `${indicator.currentCompensation.toLocaleString('fr-FR')} €` 
                              : `0 € / ${indicator.maxCompensation.toLocaleString('fr-FR')} €`}
                          </span>
                        </div>
                        <Progress
                          value={indicator.isValidated ? 100 : 0}
                          className="h-2 bg-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-700 mb-4">Récapitulatif financier</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Rémunération totale</p>
                  <p className="text-xl font-bold text-gray-900">{totalCompensation.toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-gray-500 mt-1">sur {maxTotalCompensation.toLocaleString('fr-FR')} € disponibles</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Rémunération fixe (socle)</p>
                  <p className="text-xl font-bold text-gray-900">{stats.fixedCompensation.toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-gray-500 mt-1">{corePercentage}% des indicateurs validés</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Rémunération variable</p>
                  <p className="text-xl font-bold text-gray-900">{stats.variableCompensation.toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-gray-500 mt-1">{optionalPercentage}% des indicateurs validés</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Reste à percevoir potentiel</p>
                  <p className="text-xl font-bold text-amber-600">{remainingPotential.toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-amber-600 mt-1">Indicateurs en cours</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-right">
            <Button className="bg-primary hover:bg-primary-dark">
              <Download className="mr-2 h-4 w-4" />
              Exporter le rapport financier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
