import { useQuery } from "@tanstack/react-query";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import IndicatorTracking from "@/components/dashboard/IndicatorTracking";
import AssociatesOverview from "@/components/dashboard/AssociatesOverview";
import CompensationSummary from "@/components/dashboard/CompensationSummary";

export default function Dashboard() {
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

  return (
    <div>
      <DashboardOverview stats={data.stats} />
      <IndicatorTracking indicators={data.indicators} missions={data.missions} />
      <AssociatesOverview associates={data.associates} missions={data.missions} indicators={data.indicators} />
      <CompensationSummary stats={data.stats} indicators={data.indicators} missions={data.missions} />
    </div>
  );
}
