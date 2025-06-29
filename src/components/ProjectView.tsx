import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Requirement, Project } from "@/types";
import { useRequirements } from "@/hooks/useRequirements";

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

// Utility to format dates safely
function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return '';
  // Format as e.g. Jun 25, 2025
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ProjectView({ project, onBack }: ProjectViewProps) {
  const { requirements } = useRequirements();
  const projectRequirements = requirements.filter(r => r.projectId === project.id);
  const completedRequirements = projectRequirements.filter(r => r.status === 'Done');
  const progressPercentage = projectRequirements.length > 0 ? (completedRequirements.length / projectRequirements.length) * 100 : 0;

  const [showBudget, setShowBudget] = useState(false);
  const budgetTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleToggleBudget = () => {
    if (showBudget) {
      setShowBudget(false);
      if (budgetTimeout.current) clearTimeout(budgetTimeout.current);
    } else {
      setShowBudget(true);
      if (budgetTimeout.current) clearTimeout(budgetTimeout.current);
      budgetTimeout.current = setTimeout(() => setShowBudget(false), 5000);
    }
  };
  function getDaysLeft(deadline: string | Date | null | undefined) {
    if (!deadline) return '';
    const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
    if (!d || isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? `${diff} days` : 'Past due';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-500';
      case 'Completed': return 'bg-green-500';
      case 'Planning': return 'bg-yellow-500';
      case 'On Hold': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600">{project.client}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Project Details */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge className={`${getStatusColor(project.status)} text-white`}>
                {project.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <p><strong>Client:</strong> {project.client}</p>
              {project.clientEmail && <p><strong>Email:</strong> {project.clientEmail}</p>}
              {project.clientPhone && <p><strong>Phone:</strong> {project.clientPhone}</p>}
              <p><strong>Start:</strong> {formatDate(project.start_date || project.startDate)}</p>
              <p><strong>Deadline:</strong> {formatDate(project.deadline || project.endDate)}</p>
              <p><strong>Days Left:</strong> {getDaysLeft(project.deadline || project.endDate)}</p>
              <p className="flex items-center gap-2"><strong>Budget:</strong> {showBudget ? `৳${project.budget.toLocaleString()}` : '*****'}
                <button
                  className="ml-1 p-1 rounded hover:bg-gray-100 focus:outline-none"
                  onClick={handleToggleBudget}
                  type="button"
                  aria-label={showBudget ? 'Hide budget' : 'Show budget'}
                >
                  {showBudget ? <EyeOff className="w-5 h-5 text-black align-middle" /> : <Eye className="w-5 h-5 text-black align-middle" />}
                </button>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {completedRequirements.length} of {projectRequirements.length} requirements completed
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Milestones (Completed Requirements)</h3>
              <div className="space-y-3">
                {completedRequirements.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No milestones completed yet</p>
                ) : (
                  completedRequirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium text-green-900">{requirement.title}</p>
                        <p className="text-sm text-green-700">{requirement.description}</p>
                        <p className="text-xs text-green-600 mt-1">
                          Completed on {new Date(requirement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>All Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projectRequirements.map((requirement) => (
              <div key={requirement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{requirement.title}</p>
                  <p className="text-sm text-gray-600">{requirement.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${requirement.priority === 'High' ? 'bg-red-100 text-red-800' : requirement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{requirement.priority}</Badge>
                  <Badge className={`${requirement.status === 'Done' ? 'bg-green-100 text-green-800' : requirement.status === 'In Review' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{requirement.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
