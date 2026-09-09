import { useState, useEffect } from "react";
import {
  Siren,
  Ambulance,
  PhoneCall,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Radio,
} from "lucide-react";
import { Button } from "../common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../common/Dialog";
import { useAuth } from "../../context/AuthContext";
import { emergencyService } from "../../services/EmergencyService";
import { socketService, EmergencyPayload } from "../../services/SocketService";
import { toast } from "sonner";

function getCurrentCoordinates() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise<{ latitude: number; longitude: number } | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 4000,
      }
    );
  });
}

export function SOSEmergencyButton() {
  const { user } = useAuth();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStatusDrawerOpen, setIsStatusDrawerOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyPayload | null>(null);

  // Listen for real-time updates to this patient's emergency (e.g. status changes from Admin)
  useEffect(() => {
    const unsubUpdate = socketService.onEmergencyUpdated((updated) => {
      if (
        activeEmergency &&
        ((updated._id && updated._id === activeEmergency._id) ||
          (updated.id && updated.id === activeEmergency.id) ||
          (updated.patientName && updated.patientName === activeEmergency.patientName))
      ) {
        setActiveEmergency((prev) => (prev ? { ...prev, ...updated } : updated));
        toast.info(`Emergency Status Update: ${updated.status}`);
      }
    });

    return () => {
      unsubUpdate();
    };
  }, [activeEmergency]);

  const handleOpenConfirm = () => {
    if (activeEmergency && activeEmergency.status !== "Resolved") {
      // Already active, show status sheet
      setIsStatusDrawerOpen(true);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleTriggerSOS = async () => {
    try {
      setIsTriggering(true);

      // Collect geolocation coordinates or fall back to profile address
      const coords = await getCurrentCoordinates();
      const patientAddress = user?.patientProfile?.address || "Indiranagar, Bengaluru, Karnataka";
      const locationPayload = coords
        ? {
            latitude: coords.latitude,
            longitude: coords.longitude,
            address: patientAddress,
          }
        : patientAddress;

      const payload = {
        patientId: user?.id || (user as any)?._id || "",
        patientName: user?.name || "Patient",
        contactNumber: user?.phone || "+91 98765 42001",
        contact: user?.phone || "+91 98765 42001",
        location: locationPayload,
        timestamp: new Date().toISOString(),
      };

      // 1. Dispatch POST /api/emergency/trigger HTTP request
      const res = await emergencyService.triggerEmergency(payload);

      // 2. Emit real-time Socket.io event
      const emergencyData: EmergencyPayload = {
        ...payload,
        _id: res.alertId || res.emergency?._id,
        id: res.alertId || res.emergency?._id,
        status: res.emergency?.status || "PENDING_RESPONSE",
        hospital: res.hospital || {
          name: "MEDIrxCARE Emergency Hub",
          hotline: "108 / +91 80 4567 1000",
          address: "Trauma Care Center",
          eta: res.eta || "8-12 mins",
        },
      };

      socketService.emitSosTriggered(emergencyData);

      setActiveEmergency(emergencyData);
      setIsConfirmModalOpen(false);
      setIsStatusDrawerOpen(true);

      toast.error(`🚨 Emergency SOS Triggered! Trauma Responders Alerted.`);
    } catch (err: any) {
      console.error("SOS trigger error:", err);
      toast.error(err?.message || "Failed to trigger emergency SOS. Please call 108 immediately.");
    } finally {
      setIsTriggering(false);
    }
  };

  const isSosActive = Boolean(activeEmergency && activeEmergency.status !== "Resolved");

  return (
    <>
      {/* Top-Bar SOS Button */}
      <button
        type="button"
        onClick={handleOpenConfirm}
        className={`group relative flex items-center gap-2 h-9 px-3.5 rounded-xl font-medium text-xs transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 ${
          isSosActive
            ? "border border-red-500 bg-red-600 text-white hover:bg-red-700 animate-pulse shadow-red-500/20"
            : "border border-red-200/90 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        }`}
        aria-label="Emergency SOS Alert"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 dark:bg-red-500"></span>
        </span>
        <Siren className={`h-4 w-4 ${isSosActive ? "text-white animate-spin" : "text-red-600 dark:text-red-400"}`} />
        <span className="font-semibold tracking-wide">
          {isSosActive ? "SOS Active - Responders Alerted" : "SOS Emergency"}
        </span>
      </button>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-red-200 dark:border-red-900/50 p-6 bg-white dark:bg-slate-900 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <ShieldAlert className="h-7 w-7 animate-pulse" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900 dark:text-slate-50">
              Confirm Clinical Emergency Alert?
            </DialogTitle>
            <DialogDescription className="text-center text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Triggering this alert immediately broadcasts an acute medical emergency ticket to the{" "}
              <strong className="text-red-600 dark:text-red-400">MEDIrxCARE Hospital Trauma Center & Admin Dispatch Desk</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Patient:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name || "Registered Patient"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Contact Number:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.phone || "+91 98765 42001"}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-500 dark:text-slate-400 shrink-0">Emergency Location:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 text-right truncate max-w-[200px]">
                {user?.patientProfile?.address || "GPS Geolocation"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Only trigger in case of acute medical distress, chest trauma, severe breathlessness, or accidents.</span>
          </div>

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isTriggering}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleTriggerSOS}
              disabled={isTriggering}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-md shadow-red-600/20 px-5"
            >
              <Siren className="w-4 h-4 mr-2 animate-spin" />
              {isTriggering ? "Broadcasting SOS Alert..." : "Trigger Immediate SOS"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Emergency Reassurance & Hotline Modal / Drawer */}
      <Dialog open={isStatusDrawerOpen} onOpenChange={setIsStatusDrawerOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-red-200 dark:border-red-900/50 p-6 bg-white dark:bg-slate-900 shadow-2xl">
          <div className="overflow-hidden rounded-2xl -m-6 mb-4">
            <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur shadow-inner">
                    <Ambulance className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-100">Live Clinical Dispatch</p>
                    </div>
                    <h3 className="text-base font-bold text-white">SOS Active - Responders Alerted</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-950 dark:text-emerald-100">Ambulance Rapid Response En Route</p>
                <p className="mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-300">
                  Stay calm and remain seated. Dispatchers have verified your coordinates and hospital physicians are on standby.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">Assigned Response Center</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white text-sm">
                  {activeEmergency?.hospital?.name || "MEDIrxCARE Emergency Hub Bengaluru"}
                </p>
                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span className="truncate">
                    {activeEmergency?.hospital?.address || "Indiranagar Emergency Lane, Bengaluru"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">Estimated ETA</p>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold mt-1 text-sm">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span>{activeEmergency?.hospital?.eta || "8-12 mins"}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">Dispatch Status</p>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold mt-1 text-sm">
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>{activeEmergency?.status || "PENDING_RESPONSE"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Hospital Hotline Numbers */}
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 dark:border-red-950/60 dark:bg-red-950/30">
              <p className="text-[10px] uppercase font-bold tracking-wider text-red-700 dark:text-red-400">
                Hospital Emergency Direct Hotlines
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <a
                  href="tel:108"
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg bg-red-600 text-white font-bold text-xs shadow hover:bg-red-700 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  National EMS: 108
                </a>
                <a
                  href={`tel:${activeEmergency?.hospital?.hotline || "+918045671000"}`}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-red-300 bg-white dark:bg-slate-800 text-red-700 dark:text-red-300 font-bold text-xs hover:bg-red-50 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Desk: +91-80-4567-1000
                </a>
              </div>
            </div>

            <p className="text-[11px] font-mono text-slate-400 text-center">
              Incident Ref: {activeEmergency?._id || activeEmergency?.id || "EMG-LIVE"}
            </p>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusDrawerOpen(false)}
                className="w-full rounded-xl text-xs"
              >
                Keep Active & Close Window
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setActiveEmergency(null);
                  setIsStatusDrawerOpen(false);
                  toast.success("SOS Alert dismissed locally.");
                }}
                className="rounded-xl text-xs border-slate-200 text-slate-500 hover:text-slate-800"
              >
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Re-export as EmergencyAlertButton for backward compatibility
export const EmergencyAlertButton = SOSEmergencyButton;
