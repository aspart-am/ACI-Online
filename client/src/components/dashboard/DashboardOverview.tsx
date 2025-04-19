import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  CheckSquare,
  EuroIcon,
  TrendingUp
} from "lucide-react";

interface DashboardOverviewProps {
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
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  // Calculate percentages
  const corePercentage = Math.round((stats.validatedCoreIndicators / stats.totalCoreIndicators) * 100);
  const optionalPercentage = Math.round((stats.validatedOptionalIndicators / stats.totalOptionalIndicators) * 100);
  
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Card 1 - Core Indicators */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-primary bg-opacity-10 p-3">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Indicateurs socles validés</h3>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.validatedCoreIndicators}/{stats.totalCoreIndicators}
                  </p>
                  <p className={`ml-2 text-sm ${
                    corePercentage >= 70 ? "text-green-600" : 
                    corePercentage >= 50 ? "text-amber-600" : 
                    "text-red-600"
                  }`}>
                    {corePercentage}%
                  </p>
                </div>
              </div>
            </div>
            <Progress 
              value={corePercentage} 
              className="mt-3 h-2 bg-gray-200" 
            />
          </CardContent>
        </Card>

        {/* KPI Card 2 - Optional Indicators */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-500 bg-opacity-10 p-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Indicateurs optionnels validés</h3>
                <div className="flex items-end">
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.validatedOptionalIndicators}/{stats.totalOptionalIndicators}
                  </p>
                  <p className={`ml-2 text-sm ${
                    optionalPercentage >= 70 ? "text-green-600" : 
                    optionalPercentage >= 50 ? "text-amber-600" : 
                    "text-red-600"
                  }`}>
                    {optionalPercentage}%
                  </p>
                </div>
              </div>
            </div>
            <Progress 
              value={optionalPercentage} 
              className="mt-3 h-2 bg-gray-200" 
            />
          </CardContent>
        </Card>

        {/* KPI Card 3 - Fixed Compensation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-500 bg-opacity-10 p-3">
                <EuroIcon className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Rémunération fixe</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.fixedCompensation.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Sur un total de {stats.maxFixedCompensation.toLocaleString('fr-FR')} €
            </p>
          </CardContent>
        </Card>

        {/* KPI Card 4 - Variable Compensation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-600 bg-opacity-10 p-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Rémunération variable</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.variableCompensation.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Sur un total de {stats.maxVariableCompensation.toLocaleString('fr-FR')} €
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
