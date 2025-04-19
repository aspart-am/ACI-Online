import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { UserCircle, MoreVertical } from "lucide-react";
import AssociateCard from "@/components/associates/AssociateCard";
import { type Associate, type Mission, type Indicator } from "@shared/schema";

interface AssociatesOverviewProps {
  associates: Associate[];
  missions: Mission[];
  indicators: Indicator[];
}

export default function AssociatesOverview({ associates, missions, indicators }: AssociatesOverviewProps) {
  const [displayCount, setDisplayCount] = useState(3);
  
  const displayedAssociates = associates.slice(0, displayCount);
  const hasMoreAssociates = associates.length > displayCount;
  
  const handleViewAll = () => {
    setDisplayCount(associates.length);
  };
  
  // Function to get missions for an associate
  const getAssociateMissions = (associateId: number) => {
    return missions.filter(mission => mission.associateId === associateId);
  };
  
  // Function to get indicator details by ID
  const getIndicatorById = (indicatorId: number) => {
    return indicators.find(indicator => indicator.id === indicatorId);
  };
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Associés et missions</h2>
        <Button className="bg-primary hover:bg-primary-dark">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nouvel associé
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayedAssociates.map((associate) => (
          <AssociateCard 
            key={associate.id}
            associate={associate}
            missions={getAssociateMissions(associate.id)}
            indicators={indicators}
          />
        ))}
      </div>
      
      {hasMoreAssociates && (
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-primary hover:text-primary-dark"
            onClick={handleViewAll}
          >
            Voir tous les associés ({associates.length})
          </Button>
        </div>
      )}
    </div>
  );
}
