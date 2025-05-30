import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import AdminCompetitionGrid from "./AdminCompetitionGrid";
import CompetitionForm from "./CompetitionForm";
import { CompetitionProps } from "../competitions/CompetitionCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

type ViewMode = "grid" | "add" | "edit" | "view";
type DisplayMode = "grid" | "list";

interface AdminDashboardProps {
  viewMode?: "active" | "archived";
}

export default function AdminDashboard({
  viewMode: initialViewMode = "active",
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCompetition, setSelectedCompetition] =
    useState<CompetitionProps | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState(
    initialViewMode === "archived" ? "archived" : "all",
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentSection, setCurrentSection] = useState<"active" | "archived">(
    initialViewMode,
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>("grid");

  useEffect(() => {
    const isArchivedRoute = location.pathname === "/admin/archived";
    setCurrentSection(isArchivedRoute ? "archived" : "active");
    setStatusFilter(isArchivedRoute ? "archived" : "all");
    setRefreshTrigger((prev) => prev + 1);
  }, [location.pathname]);

  const handleAddNew = () => {
    setSelectedCompetition(null);
    setViewMode("add");
  };

  const handleEdit = (competition: CompetitionProps) => {
    setSelectedCompetition(competition);
    setViewMode("edit");
  };

  const handleView = (competition: CompetitionProps) => {
    setSelectedCompetition(competition);
    setViewMode("view");
  };

  const handleSave = () => {
    setViewMode("grid");
    setSelectedCompetition(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancel = () => {
    setViewMode("grid");
    setSelectedCompetition(null);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
  };

  const handleViewChange = (view: "grid" | "list") => {
    setDisplayMode(view);
  };

  const renderContent = () => {
    switch (viewMode) {
      case "add":
        return (
          <CompetitionForm
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={false}
          />
        );
      case "edit":
        return (
          <CompetitionForm
            competition={selectedCompetition || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
            isEditing={true}
          />
        );
      case "view":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-semibold">Competition Details</h1>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancel}>
                  Back to List
                </Button>
                <Button onClick={() => handleEdit(selectedCompetition!)}>
                  Edit Competition
                </Button>
              </div>
            </div>
            {/* Competition details view would go here */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">
                {selectedCompetition?.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {selectedCompetition?.description}
              </p>
              {/* Add more detailed view components here */}
            </div>
          </div>
        );
      default:
        return (
          <div>
            <div className="flex items-center justify-between p-6 pb-0">
              <div>
                <h1 className="text-3xl font-semibold mb-2">
                  {currentSection === "archived"
                    ? "Archived Competitions"
                    : "Competition Management"}
                </h1>
                <p className="text-gray-600">
                  {currentSection === "archived"
                    ? "View and manage archived competitions"
                    : "Manage all competitions from this dashboard"}
                </p>
              </div>
              {currentSection === "active" && (
                <Button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competition
                </Button>
              )}
            </div>
            <AdminCompetitionGrid
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              onEdit={handleEdit}
              onView={handleView}
              refreshTrigger={refreshTrigger}
              displayMode={displayMode}
            />
          </div>
        );
    }
  };

  return (
    <AdminLayout
      onSearch={handleSearch}
      onFilterChange={handleFilterChange}
      onViewChange={handleViewChange}
      currentView={displayMode}
    >
      {renderContent()}
    </AdminLayout>
  );
}
