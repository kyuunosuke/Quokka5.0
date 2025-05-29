import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "../../../supabase/supabase";
import { Plus, X, Upload, Calendar as CalendarIcon } from "lucide-react";
import { CompetitionProps } from "../competitions/CompetitionCard";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CompetitionFormProps {
  competition?: Partial<CompetitionProps>;
  onSave?: (competition: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

interface Requirement {
  id?: string;
  requirement_title: string;
  requirement_description: string;
  submission_format?: string;
  order_index: number;
}

interface Eligibility {
  id?: string;
  requirement_type: string;
  requirement_description: string;
  is_mandatory: boolean;
}

export default function CompetitionForm({
  competition,
  onSave,
  onCancel,
  isEditing = false,
}: CompetitionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: competition?.title || "",
    description: competition?.description || "",
    category: competition?.category || "",
    difficulty_level: competition?.difficulty_level || "intermediate",
    prize_value: competition?.prize_value || 0,
    prize_description: competition?.prize_description || "",
    max_participants: competition?.max_participants || null,
    external_url: competition?.external_url || "",
    organizer_name: competition?.organizer_name || "",
    organizer_email: competition?.organizer_email || "",
    thumbnail_url: competition?.thumbnail_url || "",
    status: "active",
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    competition?.deadline ? new Date(competition.deadline) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    competition?.deadline ? new Date(competition.deadline) : undefined,
  );

  const [requirements, setRequirements] = useState<Requirement[]>(
    competition?.requirements?.map((req, index) => ({
      id: req.id,
      requirement_title: req.requirement_title,
      requirement_description: req.requirement_description,
      submission_format: req.submission_format,
      order_index: index,
    })) || [
      {
        requirement_title: "",
        requirement_description: "",
        submission_format: "",
        order_index: 0,
      },
    ],
  );

  const [eligibility, setEligibility] = useState<Eligibility[]>(
    competition?.eligibility?.map((elig) => ({
      id: elig.id,
      requirement_type: elig.requirement_type,
      requirement_description: elig.requirement_description,
      is_mandatory: elig.is_mandatory,
    })) || [
      {
        requirement_type: "",
        requirement_description: "",
        is_mandatory: true,
      },
    ],
  );

  const categories = [
    "Design",
    "Development",
    "Marketing",
    "Writing",
    "Photography",
    "Video",
    "Music",
    "Art",
    "Business",
    "Technology",
    "Other",
  ];

  const difficultyLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `competition-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("competition-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("competition-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, thumbnail_url: data.publicUrl }));

      toast({
        title: "Image uploaded successfully",
        description: "Competition thumbnail has been uploaded.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const addRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      {
        requirement_title: "",
        requirement_description: "",
        submission_format: "",
        order_index: prev.length,
      },
    ]);
  };

  const removeRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRequirement = (
    index: number,
    field: keyof Requirement,
    value: any,
  ) => {
    setRequirements((prev) =>
      prev.map((req, i) => (i === index ? { ...req, [field]: value } : req)),
    );
  };

  const addEligibility = () => {
    setEligibility((prev) => [
      ...prev,
      {
        requirement_type: "",
        requirement_description: "",
        is_mandatory: true,
      },
    ]);
  };

  const removeEligibility = (index: number) => {
    setEligibility((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEligibility = (
    index: number,
    field: keyof Eligibility,
    value: any,
  ) => {
    setEligibility((prev) =>
      prev.map((elig, i) => (i === index ? { ...elig, [field]: value } : elig)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error("Competition title is required");
      }
      if (!formData.category.trim()) {
        throw new Error("Category is required");
      }
      if (formData.prize_value <= 0) {
        throw new Error("Prize value must be greater than 0");
      }
      if (!endDate) {
        throw new Error("End date is required");
      }

      // Validate that we have at least an end date
      if (!endDate) {
        throw new Error("End date is required");
      }

      // Prepare competition data with proper data types
      const competitionData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category: formData.category.trim(),
        difficulty_level: formData.difficulty_level,
        prize_value: Number(formData.prize_value),
        prize_description: formData.prize_description?.trim() || null,
        deadline: endDate.toISOString(), // Use end_date as deadline for backward compatibility
        start_date: startDate ? startDate.toISOString() : null,
        end_date: endDate.toISOString(),
        max_participants: formData.max_participants
          ? Number(formData.max_participants)
          : null,
        external_url: formData.external_url?.trim() || null,
        organizer_name: formData.organizer_name?.trim() || null,
        organizer_email: formData.organizer_email?.trim() || null,
        thumbnail_url: formData.thumbnail_url?.trim() || null,
        status: formData.status,
        current_participants: 0,
        entry_fee: 0,
        updated_at: new Date().toISOString(),
      };

      let competitionId;

      if (isEditing && competition?.id) {
        // Update existing competition
        const { error } = await supabase
          .from("competitions")
          .update(competitionData)
          .eq("id", competition.id);

        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        competitionId = competition.id;
      } else {
        // Create new competition
        const { data, error } = await supabase
          .from("competitions")
          .insert([competitionData])
          .select()
          .single();

        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        competitionId = data.id;
      }

      // Handle requirements
      if (isEditing) {
        // Delete existing requirements
        const { error: deleteReqError } = await supabase
          .from("competition_requirements")
          .delete()
          .eq("competition_id", competitionId);

        if (deleteReqError) {
          console.error("Delete requirements error:", deleteReqError);
          throw deleteReqError;
        }
      }

      // Insert new requirements
      const requirementsData = requirements
        .filter((req) => req.requirement_title?.trim())
        .map((req, index) => ({
          competition_id: competitionId,
          requirement_title: req.requirement_title.trim(),
          requirement_description: req.requirement_description?.trim() || "",
          submission_format: req.submission_format?.trim() || null,
          order_index: index,
          file_size_limit: null,
          additional_notes: null,
        }));

      if (requirementsData.length > 0) {
        const { error: insertReqError } = await supabase
          .from("competition_requirements")
          .insert(requirementsData);

        if (insertReqError) {
          console.error("Insert requirements error:", insertReqError);
          throw insertReqError;
        }
      }

      // Handle eligibility
      if (isEditing) {
        // Delete existing eligibility
        const { error: deleteEligError } = await supabase
          .from("competition_eligibility")
          .delete()
          .eq("competition_id", competitionId);

        if (deleteEligError) {
          console.error("Delete eligibility error:", deleteEligError);
          throw deleteEligError;
        }
      }

      // Insert new eligibility
      const eligibilityData = eligibility
        .filter((elig) => elig.requirement_type?.trim())
        .map((elig) => ({
          competition_id: competitionId,
          requirement_type: elig.requirement_type.trim(),
          requirement_description: elig.requirement_description?.trim() || "",
          is_mandatory: Boolean(elig.is_mandatory),
        }));

      if (eligibilityData.length > 0) {
        const { error: insertEligError } = await supabase
          .from("competition_eligibility")
          .insert(eligibilityData);

        if (insertEligError) {
          console.error("Insert eligibility error:", insertEligError);
          throw insertEligError;
        }
      }

      toast({
        title: isEditing ? "Competition updated" : "Competition created",
        description: isEditing
          ? "Competition has been updated successfully."
          : "New competition has been created successfully.",
      });

      onSave?.(competitionData);
    } catch (error: any) {
      console.error("Error saving competition:", error);
      const errorMessage =
        error?.message || "Failed to save competition. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          {isEditing ? "Edit Competition" : "Add New Competition"}
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Competition Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty_level: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      max_participants: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prize Information */}
        <Card>
          <CardHeader>
            <CardTitle>Prize Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prize_value">Prize Value ($) *</Label>
                <Input
                  id="prize_value"
                  type="number"
                  value={formData.prize_value}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prize_value: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prize_description">Prize Description</Label>
                <Input
                  id="prize_description"
                  value={formData.prize_description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prize_description: e.target.value,
                    }))
                  }
                  placeholder="e.g., $1,000 Cash Prize + Certificate"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Organizer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizer_name">Organizer Name</Label>
                <Input
                  id="organizer_name"
                  value={formData.organizer_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      organizer_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external_url">Competition URL</Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      external_url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/competition"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Competition Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {imageUploading
                        ? "Uploading..."
                        : "Click to upload competition image"}
                    </p>
                  </div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </Label>
              </div>
              {formData.thumbnail_url && (
                <div className="w-32 h-32">
                  <img
                    src={formData.thumbnail_url}
                    alt="Competition thumbnail"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Competition Requirements
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requirements.map((req, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Requirement {index + 1}</h4>
                  {requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={req.requirement_title}
                      onChange={(e) =>
                        updateRequirement(
                          index,
                          "requirement_title",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Design Submission"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Input
                      value={req.submission_format || ""}
                      onChange={(e) =>
                        updateRequirement(
                          index,
                          "submission_format",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., PNG, JPG, PDF"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={req.requirement_description}
                    onChange={(e) =>
                      updateRequirement(
                        index,
                        "requirement_description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe what participants need to submit"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Eligibility Criteria
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEligibility}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Criteria
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {eligibility.map((elig, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Criteria {index + 1}</h4>
                  {eligibility.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEligibility(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input
                      value={elig.requirement_type}
                      onChange={(e) =>
                        updateEligibility(
                          index,
                          "requirement_type",
                          e.target.value,
                        )
                      }
                      placeholder="e.g., Age Requirement"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mandatory</Label>
                    <Select
                      value={elig.is_mandatory.toString()}
                      onValueChange={(value) =>
                        updateEligibility(
                          index,
                          "is_mandatory",
                          value === "true",
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Required</SelectItem>
                        <SelectItem value="false">Preferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={elig.requirement_description}
                    onChange={(e) =>
                      updateEligibility(
                        index,
                        "requirement_description",
                        e.target.value,
                      )
                    }
                    placeholder="Describe the eligibility requirement"
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
