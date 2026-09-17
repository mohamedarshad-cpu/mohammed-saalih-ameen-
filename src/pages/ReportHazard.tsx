import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { HazardType, HazardSeverity } from '../types';
import { submitHazard } from '../services/api';
import {
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Camera,
  MapPin,
  Waves,
  Car,
  LightbulbOff,
  Cone,
  TrafficCone,
  X,
  ShieldAlert,
} from 'lucide-react';

const HAZARD_TYPES: { type: HazardType; label: string; icon: React.ReactNode }[] = [
  { type: 'Pothole', label: 'Pothole', icon: <AlertTriangle className="w-4 h-4 text-amber-700" /> },
  { type: 'Flooding', label: 'Flooding', icon: <Waves className="w-4 h-4 text-sky-600" /> },
  { type: 'Accident', label: 'Accident', icon: <Car className="w-4 h-4 text-rose-600" /> },
  { type: 'Poor Lighting', label: 'Poor Lighting', icon: <LightbulbOff className="w-4 h-4 text-indigo-600" /> },
  { type: 'Construction', label: 'Construction', icon: <Cone className="w-4 h-4 text-orange-600" /> },
  { type: 'High Traffic', label: 'High Traffic', icon: <TrafficCone className="w-4 h-4 text-amber-600" /> },
];

export const ReportHazard: React.FC = () => {
  // Form states
  const [location, setLocation] = useState('');
  const [selectedHazards, setSelectedHazards] = useState<HazardType[]>(['Poor Lighting']);
  const [severity, setSeverity] = useState<HazardSeverity>('Medium');
  const [description, setDescription] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleHazardType = (type: HazardType) => {
    if (selectedHazards.includes(type)) {
      if (selectedHazards.length > 1) {
        setSelectedHazards(selectedHazards.filter((t) => t !== type));
      }
    } else {
      setSelectedHazards([...selectedHazards, type]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert('Please specify a hazard location.');
      return;
    }

    setIsSubmitting(true);

    // Call frontend API service (TODO: backend database storage in Step 2)
    await submitHazard({
      location,
      hazardTypes: selectedHazards,
      severity,
      description: description || `Reported ${selectedHazards.join(', ')} near ${location}`,
      photoUrl: photoPreview || undefined,
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Reset inputs
    setLocation('');
    setDescription('');
    setPhotoPreview(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12" id="report-hazard-page">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 uppercase tracking-wider">
            Student Incident Reporting
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs font-medium text-slate-500">Crowdsourced Campus Safety</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report Hazard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Help protect fellow students by reporting road obstacles, broken streetlights, or dangerous intersections.
        </p>
      </div>

      {/* Success Notification */}
      {submitSuccess && (
        <div
          role="status"
          className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-emerald-950 flex items-start gap-3 shadow-xs"
        >
          <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm">Hazard Report Submitted Successfully</h4>
            <p className="text-xs text-emerald-800 mt-0.5">
              Thank you! Your report has been dispatched to the safety queue. Real-time route risk scores will reflect this report.
            </p>
          </div>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Report Form Card */}
      <Card padding="lg" className="border border-slate-200/90 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Field 1: Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="hazard-location-input"
                className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Location *</span>
              </label>
              <button
                type="button"
                onClick={() => setLocation('Telegraph Ave & Bancroft Way, Berkeley')}
                className="text-[11px] font-semibold text-sky-700 hover:underline"
              >
                Use Pin Location
              </button>
            </div>

            <input
              id="hazard-location-input"
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Corner of Oxford St & University Ave or near dorm building B"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
            />
          </div>

          {/* Field 2: Hazard Type Checkboxes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Hazard Type * (Select all that apply)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {HAZARD_TYPES.map(({ type, label, icon }) => {
                const isChecked = selectedHazards.includes(type);
                return (
                  <label
                    key={type}
                    htmlFor={`hazard-checkbox-${type.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      isChecked
                        ? 'border-slate-900 bg-slate-50 text-slate-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`hazard-checkbox-${type.toLowerCase().replace(/\s+/g, '-')}`}
                      checked={isChecked}
                      onChange={() => toggleHazardType(type)}
                      className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900"
                    />
                    <span className="shrink-0">{icon}</span>
                    <span className="truncate">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Field 3: Severity (Low, Medium, High) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Severity Level *
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  level: 'Low' as const,
                  label: 'Low',
                  desc: 'Minor issue, path passable',
                  classes: 'hover:border-emerald-300 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 text-emerald-800',
                  dot: 'bg-emerald-500',
                },
                {
                  level: 'Medium' as const,
                  label: 'Medium',
                  desc: 'Caution needed, slowed traffic',
                  classes: 'hover:border-amber-300 peer-checked:border-amber-600 peer-checked:bg-amber-50 text-amber-800',
                  dot: 'bg-amber-500',
                },
                {
                  level: 'High' as const,
                  label: 'High',
                  desc: 'Immediate danger or blocked path',
                  classes: 'hover:border-rose-300 peer-checked:border-rose-600 peer-checked:bg-rose-50 text-rose-800',
                  dot: 'bg-rose-500',
                },
              ].map(({ level, label, desc, classes, dot }) => (
                <label key={level} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="severity"
                    value={level}
                    checked={severity === level}
                    onChange={() => setSeverity(level)}
                    className="sr-only peer"
                  />
                  <div
                    className={`p-3 rounded-xl border-2 border-slate-200 transition-all text-left ${classes}`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      <span>{label}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-normal leading-tight">
                      {desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Field 4: Description */}
          <div className="space-y-2">
            <label
              htmlFor="hazard-description"
              className="text-xs font-bold text-slate-700 uppercase tracking-wider block"
            >
              Description (Optional details)
            </label>
            <textarea
              id="hazard-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the hazard conditions, extent of obstruction, or visible landmarks..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
            />
          </div>

          {/* Field 5: Photo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Photo Upload
            </label>

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-sm">
                <img
                  src={photoPreview}
                  alt="Hazard preview"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                  aria-label="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="hazard-photo-file"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
              >
                <div className="p-3 rounded-full bg-white shadow-2xs text-slate-500 mb-2">
                  <UploadCloud className="w-5 h-5 text-slate-600" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Click or drag photo here to upload
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  PNG, JPG or WEBP up to 5MB (Simulated)
                </div>
                <input
                  id="hazard-photo-file"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400">
              * Reports will be verified by campus safety AI routing algorithms.
            </div>

            <Button
              id="btn-submit-hazard-report"
              type="submit"
              variant="danger"
              size="lg"
              isLoading={isSubmitting}
              className="w-full sm:w-auto font-bold tracking-wide"
            >
              Submit Hazard Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
