"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/components/lib/supabase";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit2,
  X,
} from "lucide-react";

interface AddressForm {
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
}

export default function AddressCard() {
  const [form, setForm] = useState<AddressForm>({
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",
    address_country: "US",
  });

  const [savedAddress, setSavedAddress] = useState<AddressForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================
  // LOAD ADDRESS FROM DB
  // ==========================
  useEffect(() => {
    const loadAddress = async () => {
      setInitialLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not authenticated");
        setInitialLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select(`
        address_street,
        address_city,
        address_state,
        address_zip,
        address_country
      `)
        .maybeSingle();

      if (error) {
        console.error("LOAD ERROR:", error);
        setError(error.message);
      }

      if (data) {
        const address = {
          address_street: data.address_street ?? "",
          address_city: data.address_city ?? "",
          address_state: data.address_state ?? "",
          address_zip: data.address_zip ?? "",
          address_country: data.address_country ?? "US",
        };

        setForm(address);
        setSavedAddress(address);

        if (!address.address_street) {
          setIsEditing(true);
        }
      } else {
        setIsEditing(true);
      }

      setInitialLoading(false);
    };

    loadAddress();
  }, []);


  // ==========================
  // SAVE ADDRESS (UPSERT)
  // ==========================
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          ...form,
        },
        { onConflict: "id" }
      )
      .select(`
            address_street,
            address_city,
            address_state,
            address_zip,
            address_country
        `)
      .single();

    if (error) {
      console.error("SAVE ERROR:", error);
      setError(error.message);
    } else {
      const address = {
        address_street: data.address_street || "",
        address_city: data.address_city || "",
        address_state: data.address_state || "",
        address_zip: data.address_zip || "",
        address_country: data.address_country || "US",
      };

      setForm(address);
      setSavedAddress(address);
      setIsEditing(false);
      setSaved(true);

      setTimeout(() => setSaved(false), 2500);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    if (savedAddress) setForm(savedAddress);
    setIsEditing(false);
    setError(null);
  };

  // ==========================
  // LOADING STATE
  // ==========================
  if (initialLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow flex items-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={18} />
        Loading address…
      </div>
    );
  }

  const hasAddress =
    savedAddress &&
    (savedAddress.address_street || savedAddress.address_city);

  // ==========================
  // UI
  // ==========================
  return (
    <section className="bg-white p-6 rounded-xl shadow max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Shipping Address</h2>

        {!isEditing && hasAddress && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Edit2 size={16} />
            Edit
          </button>
        )}
      </div>

      {error && (
        <div className="flex gap-2 bg-red-50 border border-red-200 p-3 rounded-lg text-red-600 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* READ MODE */}
      {!isEditing && hasAddress ? (
        <div className="space-y-2 text-gray-700">
          <p className="font-medium">{form.address_street}</p>
          <p>
            {form.address_city}, {form.address_state} {form.address_zip}
          </p>
          <p>
            {form.address_country === "US" && "United States"}
            {form.address_country === "BR" && "Brazil"}
            {form.address_country === "CA" && "Canada"}
          </p>
        </div>
      ) : (
        <>
          {/* EDIT MODE */}
          <input
            placeholder="Street address"
            value={form.address_street}
            onChange={(e) =>
              setForm({ ...form, address_street: e.target.value })
            }
            disabled={loading}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="City"
              value={form.address_city}
              onChange={(e) =>
                setForm({ ...form, address_city: e.target.value })
              }
              disabled={loading}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <input
              placeholder="State"
              value={form.address_state}
              onChange={(e) =>
                setForm({ ...form, address_state: e.target.value })
              }
              disabled={loading}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="ZIP Code"
              value={form.address_zip}
              onChange={(e) =>
                setForm({ ...form, address_zip: e.target.value })
              }
              disabled={loading}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={form.address_country}
              onChange={(e) =>
                setForm({ ...form, address_country: e.target.value })
              }
              disabled={loading}
              className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="US">United States</option>
              <option value="BR">Brazil</option>
              <option value="CA">Canada</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving…
                </>
              ) : (
                "Save address"
              )}
            </button>

            {hasAddress && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 flex items-center gap-2 border rounded-lg hover:bg-gray-50"
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle2 size={16} />
          Address saved successfully
        </div>
      )}
    </section>
  );
}
