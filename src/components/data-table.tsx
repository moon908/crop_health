"use client";

import React, { useState, useMemo } from "react";
import { CROP_SCANS, CropScan } from "@/lib/mock-data";
import { 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableProps {
  onShowToast: (message: string, type: "success" | "warning" | "error") => void;
  onSelectScan: (scan: CropScan) => void;
}

type SortField = "timestamp" | "confidence" | "severity" | "yieldImpact" | "id";
type SortOrder = "asc" | "desc";

export default function DataTable({ onShowToast, onSelectScan }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scanTypeFilter, setScanTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filter and Search Logic
  const filteredScans = useMemo(() => {
    return CROP_SCANS.filter((scan) => {
      const matchesSearch = 
        scan.id.toLowerCase().includes(search.toLowerCase()) ||
        scan.disease.toLowerCase().includes(search.toLowerCase()) ||
        scan.fieldId.toLowerCase().includes(search.toLowerCase()) ||
        scan.analyst.toLowerCase().includes(search.toLowerCase());

      const matchesCrop = 
        cropFilter === "all" || 
        scan.cropType.toLowerCase().includes(cropFilter.toLowerCase());

      const matchesStatus = 
        statusFilter === "all" || 
        scan.status === statusFilter;

      const matchesScanType = 
        scanTypeFilter === "all" || 
        scan.scanType === scanTypeFilter;

      return matchesSearch && matchesCrop && matchesStatus && matchesScanType;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else {
        // Numbers
        return sortOrder === "asc" 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }
    });
  }, [search, cropFilter, statusFilter, scanTypeFilter, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredScans.length / rowsPerPage) || 1;
  const paginatedScans = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredScans.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredScans, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // File Export Simulators
  const triggerExport = (format: "csv" | "excel" | "pdf") => {
    onShowToast(
      `Compiling report data and initiating ${format.toUpperCase()} export...`,
      "success"
    );
    setTimeout(() => {
      onShowToast(
        `Export successful! AETHERIA-${sortField.toUpperCase()}-REPORT.${format} downloaded.`,
        "success"
      );
    }, 1500);
  };

  const getStatusStyle = (status: string) => {
    if (status === "Healthy") return "bg-secondary/10 border-secondary/20 text-secondary";
    if (status === "Warning") return "bg-warning/10 border-warning/20 text-warning";
    return "bg-danger/10 border-danger/20 text-danger";
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden select-none font-mono text-xs flex flex-col">
      {/* Table Action Header */}
      <div className="p-4 border-b border-border bg-card flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-text-main">FIELD DIGITIZATION LOG HISTORY</span>
          <span className="bg-background text-text-muted px-2 py-0.5 rounded text-[9px]">
            {filteredScans.length} RECORDS
          </span>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => triggerExport("csv")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background hover:bg-border/40 border border-border rounded-lg text-text-muted hover:text-text-main transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => triggerExport("excel")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background hover:bg-border/40 border border-border rounded-lg text-text-muted hover:text-text-main transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>EXCEL</span>
          </button>
          <button
            onClick={() => triggerExport("pdf")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-background hover:bg-border/40 border border-border rounded-lg text-text-muted hover:text-text-main transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF REPORT</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-background/50 border-b border-border grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-text-muted" />
          </span>
          <input
            type="text"
            placeholder="Search scans, fields..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg text-[10px] text-text-main focus:outline-none focus:border-secondary transition-all"
          />
        </div>

        {/* Crop Filter */}
        <select
          value={cropFilter}
          onChange={(e) => {
            setCropFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2 py-1.5 bg-card border border-border rounded-lg text-[10px] text-text-main focus:outline-none focus:border-secondary cursor-pointer"
        >
          <option value="all">Crop: All Varieties</option>
          <option value="corn">Corn (Zea mays)</option>
          <option value="soybean">Soybean (Glycine max)</option>
          <option value="wheat">Wheat (Triticum aestivum)</option>
          <option value="potato">Potato (Solanum tuberosum)</option>
        </select>

        {/* Scan Type Filter */}
        <select
          value={scanTypeFilter}
          onChange={(e) => {
            setScanTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2 py-1.5 bg-card border border-border rounded-lg text-[10px] text-text-main focus:outline-none focus:border-secondary cursor-pointer"
        >
          <option value="all">Source: All Methods</option>
          <option value="Leaf Image">Leaf Image</option>
          <option value="Field Drone">Field Drone</option>
          <option value="Satellite">Satellite Pass</option>
          <option value="Field Photo">Handheld Photo</option>
        </select>

        {/* Threat Level Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2 py-1.5 bg-card border border-border rounded-lg text-[10px] text-text-main focus:outline-none focus:border-secondary cursor-pointer"
        >
          <option value="all">Severity: All Levels</option>
          <option value="Healthy">Optimal (Healthy)</option>
          <option value="Warning">Warning (Blight/Spot)</option>
          <option value="Danger">Danger (Rust/Severe)</option>
        </select>
      </div>

      {/* Data Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-background border-b border-border/80 text-text-muted font-bold text-[9px] uppercase tracking-wider select-none">
              <th className="p-3.5 cursor-pointer hover:text-text-main" onClick={() => handleSort("id")}>
                <div className="flex items-center space-x-1">
                  <span>SCAN ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-text-main" onClick={() => handleSort("timestamp")}>
                <div className="flex items-center space-x-1">
                  <span>TIMESTAMP</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5">CROP TYPE</th>
              <th className="p-3.5">METHOD</th>
              <th className="p-3.5">PATHOLOGY DETECTED</th>
              <th className="p-3.5 cursor-pointer hover:text-text-main text-right" onClick={() => handleSort("confidence")}>
                <div className="flex items-center justify-end space-x-1">
                  <span>CONF%</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 cursor-pointer hover:text-text-main text-right" onClick={() => handleSort("severity")}>
                <div className="flex items-center justify-end space-x-1">
                  <span>SEV%</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3.5 text-right">RISK</th>
              <th className="p-3.5 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-text-main">
            {paginatedScans.length > 0 ? (
              paginatedScans.map((scan) => (
                <tr 
                  key={scan.id}
                  className="hover:bg-background/40 transition-colors"
                >
                  <td className="p-3.5 font-bold text-[10px] text-text-main">{scan.id}</td>
                  <td className="p-3.5 text-text-muted">{scan.timestamp}</td>
                  <td className="p-3.5">
                    <div className="font-bold">{scan.cropType}</div>
                    <div className="text-[9px] text-text-muted">{scan.fieldId}</div>
                  </td>
                  <td className="p-3.5 text-text-muted">{scan.scanType}</td>
                  <td className="p-3.5 max-w-xs truncate font-bold text-text-main">{scan.disease}</td>
                  <td className="p-3.5 text-right text-accent font-bold">{scan.confidence.toFixed(1)}%</td>
                  <td className="p-3.5 text-right text-warning font-bold">{scan.severity.toFixed(1)}%</td>
                  <td className="p-3.5 text-right">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold border",
                      getStatusStyle(scan.status)
                    )}>
                      {scan.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => onSelectScan(scan)}
                      className="px-2 py-1 bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 text-secondary rounded text-[9px] font-bold transition-all"
                    >
                      DIAGNOSE
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-10 text-center text-text-muted">
                  No scan logging history matches the active criteria filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer */}
      <div className="p-4 border-t border-border bg-card flex justify-between items-center select-none">
        <span className="text-[10px] text-text-muted font-bold">
          PAGE {currentPage} OF {totalPages}
        </span>
        <div className="flex space-x-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 border border-border bg-background hover:bg-card text-text-main rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-border bg-background hover:bg-card text-text-main rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
