import { useState } from "react";
import { Ambulance, PhoneCall, ShieldAlert, Siren, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "../common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../common/DropdownMenu";
import { emergencyService } from "../../services/EmergencyService";
import { toast } from "sonner";

function getCurrentLocation() {
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
        timeout: 5000,
      },
    );
  });
}

export function EmergencyAlertButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<null | {
    alertId: string;
    message: string;
    eta: string;
    hospital: {
      name: string;
      hotline: string;
      address: string;
    };
  }>(null);

  const handleEmergencyAlert = async () => {
    try {
      setIsSending(true);
      setError("");
      setIsOpen(true);

      const coordinates = await getCurrentLocation();
      const nextResponse = await emergencyService.sendAlert(coordinates || undefined);
      setResponse(nextResponse);
      toast.error(`Emergency SOS Dispatched! Assigned: ${nextResponse.hospital.name}`);
    } catch (requestError) {
      const msg = requestError instanceof Error ? requestError.message : "Failed to send emergency alert.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group relative flex items-center gap-2 h-9 px-3 rounded-lg border border-red-200/90 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 font-medium text-xs transition-all shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
          aria-label="Emergency SOS Alert"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <Siren className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
          <span className="hidden sm:inline font-semibold tracking-wide">SOS Emergency</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="mt-2 w-[360px] rounded-2xl border border-slate-200/80 bg-white p-0 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="overflow-hidden rounded-2xl">
          <div className="bg-red-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Ambulance className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-red-100">Emergency Medical Triage</p>
                <h3 className="text-base font-semibold">Ambulance Rapid Dispatch</h3>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 p-5">
            {response ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900 dark:text-emerald-100">Ambulance Dispatched</p>
                    <p className="mt-0.5">{response.message}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">Assigned Emergency Hub</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white text-sm">{response.hospital.name}</p>
                    <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{response.hospital.address}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                      <p className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">Estimated ETA</p>
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold mt-1">
                        <Clock className="h-3.5 w-3.5 text-red-600" />
                        <span>{response.eta}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                      <p className="font-medium text-slate-400 uppercase tracking-wider text-[10px]">Direct Hotline</p>
                      <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-semibold mt-1">
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span className="truncate">{response.hospital.hotline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] font-mono text-slate-400">Ref Ticket: {response.alertId}</p>

                <Button
                  onClick={handleEmergencyAlert}
                  disabled={isSending}
                  variant="outline"
                  className="h-10 w-full rounded-lg border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium"
                >
                  <Ambulance className="h-3.5 w-3.5 mr-2" />
                  {isSending ? "Updating emergency alert..." : "Re-dispatch Alert"}
                </Button>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-red-100 bg-red-50/80 px-3.5 py-3 text-xs leading-relaxed text-red-800 dark:border-red-950/40 dark:bg-red-950/20 dark:text-red-300">
                  Triggering this alert immediately sends your GPS coordinates to the nearest MEDIrxCARE Emergency Hub and prioritizes an ambulance dispatch.
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-[10px] uppercase font-medium tracking-wider text-slate-400">Dispatch Desk</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">Nearest Trauma Hub</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                    <p className="text-[10px] uppercase font-medium tracking-wider text-slate-400">Response Mode</p>
                    <p className="mt-1 font-semibold text-red-600 dark:text-red-400">Level-1 Escalation</p>
                  </div>
                </div>

                <Button
                  onClick={handleEmergencyAlert}
                  disabled={isSending}
                  className="h-10 w-full rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-xs"
                >
                  <Ambulance className="h-4 w-4 mr-2" />
                  {isSending ? "Contacting emergency hub..." : "Send Emergency Alert"}
                </Button>
              </>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-950/50 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                Emergency medical use only
              </span>
              <span className="font-mono">24/7 Active</span>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

