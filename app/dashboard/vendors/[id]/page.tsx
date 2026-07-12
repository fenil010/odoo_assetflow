"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { 
  Building2, ArrowLeft, Mail, Phone, Globe, MapPin, 
  Settings, Trash2, Edit2, Loader2, CheckCircle2, ShieldAlert,
  Package, FileText, CheckCircle, Clock, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVendorDetails, updateVendor, deleteVendor } from "@/actions/vendors";
import Link from "next/link";

export default function VendorDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { data: session } = useSession();
  const role = session?.user?.role || "EMPLOYEE";
  const isPowerUser = ["ADMIN", "ASSET_MANAGER"].includes(role);

  // States
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [formError, setFormError] = useState<Record<string, string[]>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVendorDetails = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getVendorDetails(id);
      if (!data) {
        router.push("/dashboard/vendors");
        return;
      }
      setVendor(data);
      // Pre-fill form fields
      setCompanyName(data.companyName);
      setContactPerson(data.contactPerson);
      setEmail(data.email);
      setPhone(data.phone);
      setGstNumber(data.gstNumber || "");
      setWebsite(data.website || "");
      setAddress(data.address || "");
      setNotes(data.notes || "");
      setStatus(data.status);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load vendor details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadVendorDetails();
    }
  }, [id]);

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError({});
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await updateVendor(id, {
        companyName,
        contactPerson,
        email,
        phone,
        gstNumber,
        website,
        address,
        notes,
        status,
      });

      if (res.success) {
        setSuccessMsg(res.message || "Vendor updated successfully.");
        setShowEditModal(false);
        await loadVendorDetails();
      } else {
        if (res.errors) {
          setFormError(res.errors);
        }
        setErrorMsg(res.message || "Failed to update vendor.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVendor = async () => {
    if (!confirm(`Are you sure you want to delete vendor "${vendor?.companyName}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await deleteVendor(id);
      if (res.success) {
        alert(res.message || "Vendor removed.");
        router.push("/dashboard/vendors");
      } else {
        setErrorMsg(res.message || "Failed to delete vendor.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-950" />
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 gap-4">
        <div className="space-y-1">
          <Link href="/dashboard/vendors" className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-950 gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Vendors
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-zinc-950 tracking-tight">{vendor.companyName}</h1>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
              vendor.status === "ACTIVE" 
                ? "bg-green-50 border-green-200 text-green-700" 
                : "bg-zinc-100 border-zinc-200 text-zinc-500"
            }`}>
              {vendor.status}
            </span>
          </div>
        </div>

        {isPowerUser && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Button
              onClick={() => { setShowEditModal(true); setFormError({}); setErrorMsg(""); setSuccessMsg(""); }}
              className="h-9 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Settings className="h-4 w-4" /> Edit Profile
            </Button>
            <Button
              onClick={handleDeleteVendor}
              className="h-9 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> Delete Partner
            </Button>
          </div>
        )}
      </div>

      {/* Banner Feedback alerts */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-xs font-bold text-zinc-950 flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Profile overview metadata card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Building2 className="h-4 w-4" /> Profile Info
            </h2>

            <div className="h-px bg-zinc-100" />

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Contact Representative</span>
                <span className="font-bold text-zinc-900">{vendor.contactPerson}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Email Address</span>
                <span className="font-bold text-zinc-900">{vendor.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Phone Contact</span>
                <span className="font-bold text-zinc-900">{vendor.phone}</span>
              </div>
              {vendor.gstNumber && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">GST Identification</span>
                  <span className="font-bold text-zinc-900 font-mono">{vendor.gstNumber}</span>
                </div>
              )}
              {vendor.website && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Website</span>
                  <a href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">
                    {vendor.website} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {vendor.address && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Physical Address</span>
                  <span className="text-zinc-700 leading-normal block">{vendor.address}</span>
                </div>
              )}
            </div>

            {vendor.notes && (
              <>
                <div className="h-px bg-zinc-100" />
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block select-none">Notes & Remarks</span>
                  <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">{vendor.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right column: Linked inventory assets list */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 px-6 py-4 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-zinc-950 uppercase tracking-tight flex items-center">
                  <Package className="h-4.5 w-4.5 mr-2 text-zinc-400" /> Linked Physical Assets
                </h2>
                <p className="text-[10px] text-zinc-450 mt-0.5 select-none">Assets configured under this vendor partner's invoices.</p>
              </div>
              <span className="text-[10px] font-black bg-zinc-950 text-white px-2.5 py-0.5 rounded-full select-none">
                {vendor.assets?.length || 0} Registered Units
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-200 text-[10px] font-black text-zinc-450 uppercase select-none">
                    <th className="p-4 w-28">Asset Tag</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Serial Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {!vendor.assets || vendor.assets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-450 italic">
                        No physical assets linked to this vendor partner registry.
                      </td>
                    </tr>
                  ) : (
                    vendor.assets.map((asset: any) => (
                      <tr key={asset.id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-zinc-900">{asset.tag}</td>
                        <td className="p-4 font-bold text-zinc-900">{asset.name}</td>
                        <td className="p-4 text-zinc-550">{asset.category?.name || "N/A"}</td>
                        <td className="p-4 font-mono text-zinc-500">{asset.serialNumber}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                            asset.status === "AVAILABLE" 
                              ? "bg-green-50 border-green-200 text-green-700" 
                              : asset.status === "ALLOCATED" 
                              ? "bg-zinc-950 text-white border-transparent"
                              : "bg-zinc-100 border-zinc-200 text-zinc-500"
                          }`}>
                            {asset.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <Link
                            href={`/dashboard/assets/${asset.id}`}
                            className="text-zinc-550 hover:text-zinc-950 font-bold hover:underline"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* EDIT VENDOR MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 select-none">
              <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Modify Vendor Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer font-bold text-lg">
                ×
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateVendor} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <Label htmlFor="evComp">Company Name <span className="text-red-500">*</span></Label>
                  <Input id="evComp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Dell Inc." />
                  {formError.companyName && <p className="text-[10px] text-red-600">{formError.companyName[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evCont">Contact Person <span className="text-red-500">*</span></Label>
                  <Input id="evCont" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required placeholder="Robert Smith" />
                  {formError.contactPerson && <p className="text-[10px] text-red-600">{formError.contactPerson[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evMail">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="evMail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@vendor.com" />
                  {formError.email && <p className="text-[10px] text-red-600">{formError.email[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evPhone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="evPhone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="+1 555-1234" />
                  {formError.phone && <p className="text-[10px] text-red-600">{formError.phone[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evGst">GST / Tax ID Number</Label>
                  <Input id="evGst" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="29AAAAA0000A1Z5" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="evWeb">Website URL</Label>
                  <Input id="evWeb" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="www.dell.com" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="evAddr">Corporate Address</Label>
                <textarea
                  id="evAddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street details, City, Country, ZIP code"
                  rows={2}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evNotes">Internal Notes & Remarks</Label>
                <textarea
                  id="evNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Warranty terms details, SLA metrics..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evStatus">Partnership Status</Label>
                <select
                  id="evStatus"
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Active Partner</option>
                  <option value="INACTIVE">Inactive Partner</option>
                </select>
              </div>

              <div className="flex gap-2 border-t border-zinc-100 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold py-2.5"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                  className="border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold py-2.5 px-4"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
