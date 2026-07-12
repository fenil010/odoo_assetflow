"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Building2, Plus, Search, Filter, Trash2, Edit2, 
  ExternalLink, Mail, Phone, MapPin, Globe, ShieldAlert,
  Loader2, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getVendors, createVendor, deleteVendor } from "@/actions/vendors";
import Link from "next/link";

export default function VendorsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = session?.user?.role || "EMPLOYEE";
  const isPowerUser = ["ADMIN", "ASSET_MANAGER"].includes(role);

  // Data states
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal triggers
  const [showAddModal, setShowAddModal] = useState(false);

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

  const loadVendors = async () => {
    setLoading(true);
    try {
      const res = await getVendors({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setVendors(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [search, statusFilter]);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError({});
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const res = await createVendor({
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
        setSuccessMsg(res.message || "Vendor registered successfully.");
        // Reset form
        setCompanyName("");
        setContactPerson("");
        setEmail("");
        setPhone("");
        setGstNumber("");
        setWebsite("");
        setAddress("");
        setNotes("");
        setStatus("ACTIVE");
        setShowAddModal(false);
        await loadVendors();
      } else {
        if (res.errors) {
          setFormError(res.errors);
        }
        setErrorMsg(res.message || "Failed to create vendor.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVendor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete vendor "${name}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await deleteVendor(id);
      if (res.success) {
        setSuccessMsg(res.message || "Vendor deleted successfully.");
        await loadVendors();
      } else {
        setErrorMsg(res.message || "Failed to delete vendor.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Vendor Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage corporate suppliers, external consultants, utility partners, and warranty service providers.</p>
        </div>
        {isPowerUser && (
          <Button
            onClick={() => { setShowAddModal(true); setFormError({}); setErrorMsg(""); setSuccessMsg(""); }}
            className="bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg text-xs font-bold py-2.5 px-4 cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
          >
            <Plus className="h-4 w-4" /> Add Vendor Partner
          </Button>
        )}
      </div>

      {/* Banner Messages */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-xs font-bold text-zinc-950 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl select-none">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by company name, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 cursor-pointer min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active Partners</option>
          <option value="INACTIVE">Inactive Partners</option>
        </select>

        {/* Clear Filters */}
        {(search || statusFilter) && (
          <Button
            onClick={clearFilters}
            className="h-10 border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 rounded-xl text-xs cursor-pointer flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
          </Button>
        )}
      </div>

      {/* Vendors List Display */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-zinc-400 italic">
          <Building2 className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
          <p className="text-xs">No vendor records found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div 
              key={vendor.id} 
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:border-zinc-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-zinc-950 tracking-tight text-base leading-snug">{vendor.companyName}</h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Contact: {vendor.contactPerson}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                    vendor.status === "ACTIVE" 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-zinc-100 border-zinc-200 text-zinc-500"
                  }`}>
                    {vendor.status}
                  </span>
                </div>

                <div className="h-px bg-zinc-100" />

                {/* Contact Quick details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-zinc-600 gap-2">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center text-zinc-600 gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.website && (
                    <div className="flex items-center text-zinc-600 gap-2">
                      <Globe className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate text-zinc-500 font-medium">{vendor.website}</span>
                    </div>
                  )}
                  {vendor.address && (
                    <div className="flex items-center text-zinc-600 gap-2">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {vendor._count?.assets || 0} Assets Linked
                </span>

                <div className="flex items-center gap-2">
                  {isPowerUser && (
                    <button
                      onClick={() => handleDeleteVendor(vendor.id, vendor.companyName)}
                      className="p-2 border border-zinc-200 hover:bg-red-50 hover:text-red-600 rounded-lg text-zinc-500 cursor-pointer transition-colors shadow-sm"
                      title="Delete Vendor"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <Link
                    href={`/dashboard/vendors/${vendor.id}`}
                    className="p-2 border border-zinc-950 bg-zinc-950 text-white hover:opacity-90 rounded-lg cursor-pointer transition-opacity shadow-sm flex items-center gap-1 text-[10px] font-bold"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD VENDOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-zinc-200 p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Configure Vendor Partner</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                ×
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddVendor} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <Label htmlFor="vComp">Company Name <span className="text-red-500">*</span></Label>
                  <Input id="vComp" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="e.g. Dell Inc." />
                  {formError.companyName && <p className="text-[10px] text-red-600">{formError.companyName[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vCont">Contact Person <span className="text-red-500">*</span></Label>
                  <Input id="vCont" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required placeholder="e.g. Robert Smith" />
                  {formError.contactPerson && <p className="text-[10px] text-red-600">{formError.contactPerson[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vMail">Email Address <span className="text-red-500">*</span></Label>
                  <Input id="vMail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@vendor.com" />
                  {formError.email && <p className="text-[10px] text-red-600">{formError.email[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vPhone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input id="vPhone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="e.g. +1 555-1234" />
                  {formError.phone && <p className="text-[10px] text-red-600">{formError.phone[0]}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vGst">GST / Tax Identification Number</Label>
                  <Input id="vGst" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="e.g. 29AAAAA0000A1Z5" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="vWeb">Website URL</Label>
                  <Input id="vWeb" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="e.g. www.dell.com" />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vAddr">Corporate Address</Label>
                <textarea
                  id="vAddr"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street details, City, Country, ZIP code"
                  rows={2}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vNotes">Internal Notes & Remarks</Label>
                <textarea
                  id="vNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Warranty terms details, SLA metrics, notes..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vStatus">Partnership Status</Label>
                <select
                  id="vStatus"
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
                  {submitting ? "Saving..." : "Confirm Vendor Partner"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
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
