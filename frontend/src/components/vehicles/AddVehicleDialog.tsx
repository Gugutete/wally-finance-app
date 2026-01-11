import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateVehicle } from "@/hooks/useVehicles";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AddVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const regioni = [
  "Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna",
  "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardia", "Marche",
  "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
  "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"
];

const classiAmbientali = ["Euro 0", "Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6"];

export function AddVehicleDialog({ open, onOpenChange }: AddVehicleDialogProps) {
  const { user } = useAuth();
  const createVehicle = useCreateVehicle();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    targa: "",
    marca: "",
    modello: "",
    immatricolazione: "",
    potenza_kw: "",
    classe_ambientale: "",
    regione: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      // Get user's profile to find tenant_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Could not find user profile");
      }

      // Create vehicle
      await createVehicle.mutateAsync({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        targa: formData.targa.toUpperCase(),
        marca: formData.marca,
        modello: formData.modello,
        immatricolazione: formData.immatricolazione,
        potenza_kw: parseFloat(formData.potenza_kw),
        classe_ambientale: formData.classe_ambientale,
        regione: formData.regione,
      });

      // Reset form and close dialog
      setFormData({
        targa: "",
        marca: "",
        modello: "",
        immatricolazione: "",
        potenza_kw: "",
        classe_ambientale: "",
        regione: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aggiungi veicolo</DialogTitle>
          <DialogDescription>
            Inserisci i dati del veicolo per tracciare bollo, revisione e assicurazione.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="targa">Targa *</Label>
              <Input
                id="targa"
                placeholder="AA000BB"
                value={formData.targa}
                onChange={(e) => setFormData({ ...formData, targa: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  placeholder="es. Fiat"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modello">Modello *</Label>
                <Input
                  id="modello"
                  placeholder="es. Panda"
                  value={formData.modello}
                  onChange={(e) => setFormData({ ...formData, modello: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="immatricolazione">Immatricolazione *</Label>
                <Input
                  id="immatricolazione"
                  type="date"
                  value={formData.immatricolazione}
                  onChange={(e) => setFormData({ ...formData, immatricolazione: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="potenza_kw">Potenza (kW) *</Label>
                <Input
                  id="potenza_kw"
                  type="number"
                  placeholder="es. 55"
                  value={formData.potenza_kw}
                  onChange={(e) => setFormData({ ...formData, potenza_kw: e.target.value })}
                  required
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="classe_ambientale">Classe ambientale *</Label>
              <Select
                value={formData.classe_ambientale}
                onValueChange={(value) => setFormData({ ...formData, classe_ambientale: value })}
                required
              >
                <SelectTrigger id="classe_ambientale">
                  <SelectValue placeholder="Seleziona classe" />
                </SelectTrigger>
                <SelectContent>
                  {classiAmbientali.map((classe) => (
                    <SelectItem key={classe} value={classe}>
                      {classe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="regione">Regione *</Label>
              <Select
                value={formData.regione}
                onValueChange={(value) => setFormData({ ...formData, regione: value })}
                required
              >
                <SelectTrigger id="regione">
                  <SelectValue placeholder="Seleziona regione" />
                </SelectTrigger>
                <SelectContent>
                  {regioni.map((regione) => (
                    <SelectItem key={regione} value={regione}>
                      {regione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annulla
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aggiungi veicolo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
