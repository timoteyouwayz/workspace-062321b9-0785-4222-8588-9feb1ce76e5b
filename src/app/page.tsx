"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Plus,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  Building2,
  Trash2,
  Edit,
  HelpCircle,
  ExternalLink,
  FileSpreadsheet,
  Key,
  Mail,
  Cloud,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
}

interface ExpenseItem {
  item: string;
  amount: number;
}

interface Receipt {
  id: string;
  fileName: string;
  uploadedAt: string;
  description?: string | null;
  amount?: number;
  verified?: boolean;
}

interface Requisition {
  id: string;
  reason: string;
  description: string;
  eventDate: string;
  dateNeeded: string;
  participants?: string | null;
  transportDistance?: string | null;
  transportQuantity?: string | null;
  expenseItems: string;
  totalAmount: number;
  totalReceived?: number;
  remainingBalance?: number;
  accountToCharge?: string | null;
  status: string;
  receiptSubmitted: boolean;
  receiptSubmittedAt?: string | null;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
  };
  checkedBy?: { name: string } | null;
  approvedBy?: { name: string } | null;
  receipts?: Receipt[];
}

// Status with simple descriptions
const statusConfig: Record<
  string,
  { color: string; label: string; description: string }
> = {
  PENDING: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    label: "Waiting for Review",
    description: "Your request is waiting for the finance team to check it",
  },
  CHECKED: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    label: "Checked",
    description: "The finance team has verified your request",
  },
  APPROVED: {
    color: "bg-green-100 text-green-800 border-green-300",
    label: "Approved",
    description: "Your request has been approved. Money will be sent soon.",
  },
  DISBURSED: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    label: "Money Sent",
    description: "The money has been sent to your account",
  },
  COMPLETED: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    label: "Completed",
    description: "All done! Receipt has been submitted.",
  },
  REJECTED: {
    color: "bg-red-100 text-red-800 border-red-300",
    label: "Rejected",
    description: "This request was not approved. Check the reason below.",
  },
};

const reasonOptions = [
  "Transport / Travel",
  "Office Supplies (pens, paper, etc.)",
  "Event / Program Activity",
  "Training / Workshop",
  "Utilities (water, electricity, internet)",
  "Equipment / Tools",
  "Communication (airtime, messages)",
  "Maintenance / Repairs",
  "Other",
];

// Convert number to words for amount
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  if (num === 0) return "Zero";
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? "-" + ones[num % 10] : "");
  if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " and " + numberToWords(num % 100) : "");
  if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numberToWords(num % 1000) : "");
  return num.toString();
}

export default function NGOManagementSystem() {
    // Form states
    const [loginError, setLoginError] = useState('');
    const [receiptDescription, setReceiptDescription] = useState('');
    const [receiptAmount, setReceiptAmount] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewRequisition, setShowNewRequisition] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showRequisitionDetail, setShowRequisitionDetail] = useState(false);
  const [showEditRequisition, setShowEditRequisition] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDriveSettings, setShowDriveSettings] = useState(false);
  const [showAdminUsers, setShowAdminUsers] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  });
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [selectedRequisition, setSelectedRequisition] =
    useState<Requisition | null>(null);

  // Reset password states
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [driveStatus, setDriveStatus] = useState<{
    configured: boolean;
    message: string;
  } | null>(null);

  const { toast } = useToast();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    phone: "",
  });
  const [newReqForm, setNewReqForm] = useState({
    reason: "",
    description: "",
    eventDate: "",
    dateNeeded: "",
    participants: "",
    transportDistance: "",
    transportQuantity: "",
    accountToCharge: "",
    expenseItems: [{ item: "", amount: "" }] as {
      item: string;
      amount: string;
    }[],
  });
  const [editForm, setEditForm] = useState({
    reason: "",
    description: "",
    eventDate: "",
    dateNeeded: "",
    participants: "",
    transportDistance: "",
    transportQuantity: "",
    accountToCharge: "",
    expenseItems: [{ item: "", amount: "" }] as {
      item: string;
      amount: string;
    }[],
    status: "",
  });
  const [receiptDescription, setReceiptDescription] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
      if (data.user) {
        fetchRequisitions();
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequisitions = useCallback(async () => {
    try {
      const res = await fetch("/api/requisitions");
      const data = await res.json();
      setRequisitions(data.requisitions || []);
    } catch (error) {
      console.error("Fetch requisitions error:", error);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginForm),
        });
        const data = await res.json();
        if (data.error) {
          setLoginError(data.error);
          toast({ title: 'Oops!', description: data.error, variant: 'destructive' });
        } else {
          setLoginError('');
          setUser(data.user);
          fetchRequisitions();
          toast({ title: 'Welcome back!', description: `Hello, ${data.user.name}!` });
        }
      } catch (error) {
        setLoginError('Could not log in. Please try again.');
        toast({ title: 'Error', description: 'Could not log in. Please try again.', variant: 'destructive' });
      }
    };
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: "Oops!",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setUser(data.user);
        toast({
          title: "Welcome!",
          description: `Your account is ready, ${data.user.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not create account. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Admin: create user via admin panel
  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdminForm),
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "User Created",
          description: `${data.user.name} (${data.user.email})`,
        });
        setNewAdminForm({ name: "", email: "", password: "", role: "STAFF" });
        // refresh list
        fetchAdminUsers();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not create user.",
        variant: "destructive",
      });
    }
  };

  const fetchAdminUsers = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.users) setAdminUsers(data.users);
    } catch (err) {
      console.error("Fetch admin users error:", err);
      toast({
        title: "Error",
        description: "Could not load users.",
        variant: "destructive",
      });
    } finally {
      setAdminLoading(false);
    }
  };

  const deleteAdminUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Deleted", description: "User removed." });
        fetchAdminUsers();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not delete user.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setRequisitions([]);
    toast({ title: "Goodbye!", description: "You have been logged out." });
  };

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();

      if (data.demoResetUrl) {
        // Demo mode - show the reset link
        toast({
          title: "Reset Link Generated!",
          description: "Check the demo reset link below.",
        });
        setResetToken(data.demoToken);
        setShowResetPassword(true);
        setShowForgotPassword(false);
      } else {
        toast({
          title: "Email Sent!",
          description: data.message,
        });
        setShowForgotPassword(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Reset password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });
      const data = await res.json();

      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({ title: "Success!", description: data.message });
        setShowResetPassword(false);
        setResetToken("");
        setNewPassword("");
        setResetEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Google login handler
  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      // Demo mode - create a demo Google user
      fetch("/api/auth/google/callback?code=demo", { method: "GET" })
        .then(() => checkSession())
        .then(() => {
          toast({
            title: "Welcome!",
            description: "Logged in with Google (Demo Mode)",
          });
        });
    } else {
      // Real Google OAuth
      const redirectUri = encodeURIComponent(
        window.location.origin + "/api/auth/google/callback",
      );
      const scope = encodeURIComponent(
        "email profile https://www.googleapis.com/auth/drive.file",
      );
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline`;
    }
  };

  // Check drive status
  const checkDriveStatus = async () => {
    try {
      const res = await fetch("/api/drive");
      const data = await res.json();
      setDriveStatus(data);
    } catch (error) {
      console.error("Drive status error:", error);
    }
  };

  // Check for reset token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("reset");
    if (token) {
      setResetToken(token);
      setShowResetPassword(true);
    }

    // Check drive status
    checkDriveStatus();
  }, []);

  const handleNewRequisition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/requisitions/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newReqForm,
          expenseItems: newReqForm.expenseItems.filter(
            (i) => i.item && i.amount,
          ),
          totalAmount: newReqForm.expenseItems.reduce(
            (sum, i) => sum + (parseFloat(i.amount) || 0),
            0,
          ),
        }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.pendingRequisitions) {
          toast({
            title: "Action Needed",
            description:
              "Please upload receipts for your past requests before making a new one.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Oops!",
            description: data.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Your request has been sent for review.",
        });
        setShowNewRequisition(false);
        resetNewReqForm();
        fetchRequisitions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedRequisition) return;

    try {
      const res = await fetch(
        `/api/requisitions/update?id=${selectedRequisition.id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Deleted!",
          description: "The request has been removed.",
        });
        setShowDeleteConfirm(false);
        setSelectedRequisition(null);
        fetchRequisitions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not delete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequisition) return;

    try {
      const res = await fetch("/api/requisitions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requisitionId: selectedRequisition.id,
          ...editForm,
          expenseItems: editForm.expenseItems.filter((i) => i.item && i.amount),
          totalAmount: editForm.expenseItems.reduce(
            (sum, i) => sum + (parseFloat(i.amount) || 0),
            0,
          ),
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Updated!",
          description: "The request has been changed.",
        });
        setShowEditRequisition(false);
        fetchRequisitions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (requisitionId: string, action: string) => {
    try {
      const res = await fetch("/api/requisitions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requisitionId, action }),
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Done!",
          description: `Request has been ${action.toLowerCase()}ed.`,
        });
        fetchRequisitions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedRequisition || !receiptAmount) return;

    const formData = new FormData();
    formData.append("requisitionId", selectedRequisition.id);
    formData.append("file", selectedFile);
    formData.append("description", receiptDescription);
    formData.append("amount", receiptAmount);

    try {
      const res = await fetch("/api/requisitions/receipts", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        toast({
          title: "Oops!",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: data.message || "Receipt uploaded successfully!",
        });
        setShowReceiptUpload(false);
        setSelectedFile(null);
        setReceiptDescription("");
        setReceiptAmount("");
        fetchRequisitions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not upload receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = async (requisitionId: string) => {
    window.open(`/api/requisitions/export?id=${requisitionId}`, "_blank");
  };

  const handleExportToSheets = async () => {
    try {
      const res = await fetch("/api/sheets", { method: "POST" });
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `requisitions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded!",
        description: "Open this file in Google Sheets to view your data.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetNewReqForm = () => {
    setNewReqForm({
      reason: "",
      description: "",
      eventDate: "",
      dateNeeded: "",
      participants: "",
      transportDistance: "",
      transportQuantity: "",
      accountToCharge: "",
      expenseItems: [{ item: "", amount: "" }],
    });
  };

  const openEditForm = (req: Requisition) => {
    const expenseItems = JSON.parse(req.expenseItems);
    setEditForm({
      reason: req.reason,
      description: req.description,
      eventDate: new Date(req.eventDate).toISOString().split("T")[0],
      dateNeeded: new Date(req.dateNeeded).toISOString().split("T")[0],
      participants: req.participants || "",
      transportDistance: req.transportDistance || "",
      transportQuantity: req.transportQuantity || "",
      accountToCharge: req.accountToCharge || "",
      expenseItems:
        expenseItems.length > 0 ? expenseItems : [{ item: "", amount: "" }],
      status: req.status,
    });
    setSelectedRequisition(req);
    setShowEditRequisition(true);
  };

  const addExpenseItem = () => {
    setNewReqForm((prev) => ({
      ...prev,
      expenseItems: [...prev.expenseItems, { item: "", amount: "" }],
    }));
  };

  const updateExpenseItem = (
    index: number,
    field: "item" | "amount",
    value: string,
  ) => {
    setNewReqForm((prev) => ({
      ...prev,
      expenseItems: prev.expenseItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeExpenseItem = (index: number) => {
    if (newReqForm.expenseItems.length > 1) {
      setNewReqForm((prev) => ({
        ...prev,
        expenseItems: prev.expenseItems.filter((_, i) => i !== index),
      }));
    }
  };

  const addEditExpenseItem = () => {
    setEditForm((prev) => ({
      ...prev,
      expenseItems: [...prev.expenseItems, { item: "", amount: "" }],
    }));
  };

  const updateEditExpenseItem = (
    index: number,
    field: "item" | "amount",
    value: string,
  ) => {
    setEditForm((prev) => ({
      ...prev,
      expenseItems: prev.expenseItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeEditExpenseItem = (index: number) => {
    if (editForm.expenseItems.length > 1) {
      setEditForm((prev) => ({
        ...prev,
        expenseItems: prev.expenseItems.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotal = () => {
    return newReqForm.expenseItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );
  };

  const calculateEditTotal = () => {
    return editForm.expenseItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );
  };

  // Check if user needs to submit receipt (event date has passed)
  const needsToSubmitReceipt = (req: Requisition) => {
    return (
      req.status === "DISBURSED" &&
      !req.receiptSubmitted &&
      new Date(req.eventDate) < new Date()
    );
  };

  // Check if user can create new requisition
  const canCreateNewRequisition = () => {
    const blockingReqs = requisitions.filter(
      (r) => r.userId === user?.id && needsToSubmitReceipt(r),
    );
    return blockingReqs.length === 0;
  };

  // Get blocking requisitions
  const getBlockingRequisitions = () => {
    return requisitions.filter(
      (r) => r.userId === user?.id && needsToSubmitReceipt(r),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth pages
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-slate-700" />
            </div>
            <CardTitle className="text-2xl">Youth For Christ</CardTitle>
            <CardDescription>Money Request System</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Log In
                </Button>
                {/* Visible error message below button */}
                {loginError && (
                  <div className="text-red-600 text-sm mt-2 text-center">
                    {loginError}
                  </div>
                )}
                {/* Forgot Password Link */}
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={() => setShowForgotPassword(true)}
                >
                  <Key className="h-3 w-3 mr-1" />
                  Forgot your password?
                </Button>
                {/* Google Login Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleGoogleLogin}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Your Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your
                password.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Link
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Password</DialogTitle>
              <DialogDescription>
                Enter your new password below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResetPassword(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Password</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main dashboard
  const myRequisitions = requisitions.filter((r) => r.userId === user.id);
  const pendingForReview = requisitions.filter((r) => r.status === "PENDING");
  const pendingForApproval = requisitions.filter((r) => r.status === "CHECKED");
  const pendingForDisbursement = requisitions.filter(
    (r) => r.status === "APPROVED",
  );
  const needsReceipts = getBlockingRequisitions();
  const canCreateNew = canCreateNewRequisition();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-slate-700" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Youth For Christ
              </h1>
              <p className="text-sm text-slate-500">Money Request System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Google Drive Status */}
            {driveStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDriveSettings(true)}
                className={
                  driveStatus.configured ? "text-green-600" : "text-slate-400"
                }
              >
                <Cloud className="h-4 w-4 mr-1" />
                {driveStatus.configured ? "Drive Connected" : "Drive Setup"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)}>
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
            {user.role === "ADMIN" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminUsers(true)}
              >
                <Key className="h-4 w-4 mr-1" />
                Manage Users
              </Button>
            )}
            <div className="text-right">
              <p className="font-medium text-slate-800">{user.name}</p>
              <p className="text-sm text-slate-500">{user.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {/* Warning for pending receipts */}
        {needsReceipts.length > 0 && (
          <Alert className="mb-6 border-orange-300 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Action Required:</strong> You have {needsReceipts.length}{" "}
              request(s) that need receipts. Please upload receipts for past
              requests before making new ones.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">My Requests</p>
                  <p className="text-3xl font-bold">{myRequisitions.length}</p>
                </div>
                <FileText className="h-10 w-10 text-slate-300" />
              </div>
            </CardContent>
          </Card>

          {/* Accounts Officer - Can check and disburse */}
          {["ACCOUNTANT", "ADMIN"].includes(user.role) && (
            <>
              <Card className="border-l-4 border-l-yellow-400">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">To Check</p>
                      <p className="text-3xl font-bold">
                        {pendingForReview.length}
                      </p>
                    </div>
                    <Clock className="h-10 w-10 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-400">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">To Send Money</p>
                      <p className="text-3xl font-bold">
                        {pendingForDisbursement.length}
                      </p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Director - Can approve only */}
          {["DIRECTOR", "ADMIN"].includes(user.role) && (
            <Card className="border-l-4 border-l-blue-400">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">To Approve</p>
                    <p className="text-3xl font-bold">
                      {pendingForApproval.length}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="dashboard">Home</TabsTrigger>
              <TabsTrigger value="my-requests">My Requests</TabsTrigger>
              {["ACCOUNTANT", "DIRECTOR", "ADMIN"].includes(user.role) && (
                <TabsTrigger value="approvals">
                  Work Queue
                  {pendingForReview.length +
                    pendingForApproval.length +
                    pendingForDisbursement.length >
                    0 && (
                    <Badge className="ml-2 bg-red-500 text-white">
                      {pendingForReview.length +
                        pendingForApproval.length +
                        pendingForDisbursement.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            <div className="flex gap-2">
              {["ACCOUNTANT", "DIRECTOR", "ADMIN"].includes(user.role) && (
                <Button variant="outline" onClick={handleExportToSheets}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              <Button
                onClick={() => setShowNewRequisition(true)}
                disabled={!canCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    {requisitions.slice(0, 10).map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-slate-400" />
                          <div>
                            <p className="font-medium text-sm">{req.reason}</p>
                            <p className="text-xs text-slate-500">
                              by {req.user.name} •{" "}
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusConfig[req.status]?.color}>
                          {statusConfig[req.status]?.label}
                        </Badge>
                      </div>
                    ))}
                    {requisitions.length === 0 && (
                      <p className="text-center text-slate-500 py-8">
                        No requests yet
                      </p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Needs Action */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Needs Your Attention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    {needsReceipts.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-slate-600 mb-2">
                          Receipts Needed
                        </h4>
                        {needsReceipts.map((req) => (
                          <div
                            key={req.id}
                            className="flex items-center justify-between py-2 px-3 bg-orange-50 rounded-lg mb-2"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {req.reason}
                              </p>
                              <p className="text-xs text-slate-500">
                                Event was on{" "}
                                {new Date(req.eventDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequisition(req);
                                setShowReceiptUpload(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Upload Receipt
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {needsReceipts.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                        <CheckCircle className="h-12 w-12 text-green-400 mb-2" />
                        <p>All caught up!</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* My Requisitions Tab */}
          <TabsContent value="my-requests" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Money Requests</CardTitle>
                <CardDescription>View and manage your requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequisitions.map((req) => (
                    <Card
                      key={req.id}
                      className="border-l-4 border-l-slate-400"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge
                                className={statusConfig[req.status]?.color}
                              >
                                {statusConfig[req.status]?.label}
                              </Badge>
                              {needsToSubmitReceipt(req) && (
                                <Badge variant="destructive">
                                  Receipt Required
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold">{req.reason}</h3>
                            <p className="text-sm text-slate-600 mb-2">
                              {req.description}
                            </p>
                            <p className="text-xs text-slate-500">
                              {statusConfig[req.status]?.description}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                              <span className="font-semibold text-green-600">
                                KES {req.totalAmount.toLocaleString()}
                              </span>
                              <span>
                                Event:{" "}
                                {new Date(req.eventDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRequisition(req);
                                setShowRequisitionDetail(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {needsToSubmitReceipt(req) && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedRequisition(req);
                                  setShowReceiptUpload(true);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-1" />
                                Upload Receipt
                              </Button>
                            )}
                            {["PENDING", "REJECTED"].includes(req.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-300"
                                onClick={() => {
                                  setSelectedRequisition(req);
                                  setShowDeleteConfirm(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                            {req.status !== "PENDING" &&
                              req.status !== "REJECTED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleExport(req.id)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {myRequisitions.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>You haven't made any requests yet.</p>
                      <p className="text-sm mt-2">
                        Click "New Request" to get started!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Queue Tab - Role-based sections */}
          {["ACCOUNTANT", "DIRECTOR", "ADMIN"].includes(user.role) && (
            <TabsContent value="approvals" className="space-y-6">
              {/* Accounts Officer - Pending Review */}
              {["ACCOUNTANT", "ADMIN"].includes(user.role) &&
                pendingForReview.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        To Check ({pendingForReview.length})
                      </CardTitle>
                      <CardDescription>
                        Verify these requests from staff
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingForReview.map((req) => (
                          <Card
                            key={req.id}
                            className="border-l-4 border-l-yellow-400"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">
                                      {req.user.name}
                                    </span>
                                    {req.user.department && (
                                      <Badge variant="outline">
                                        {req.user.department}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold">
                                    {req.reason}
                                  </h3>
                                  <p className="text-sm text-slate-600 mb-2">
                                    {req.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="font-semibold">
                                      KES {req.totalAmount.toLocaleString()}
                                    </span>
                                    <span>
                                      Event:{" "}
                                      {new Date(
                                        req.eventDate,
                                      ).toLocaleDateString()}
                                    </span>
                                    <span>
                                      Needed by:{" "}
                                      {new Date(
                                        req.dateNeeded,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequisition(req);
                                      setShowRequisitionDetail(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {user.role === "ADMIN" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditForm(req)}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300"
                                    onClick={() =>
                                      handleApprove(req.id, "REJECT")
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApprove(req.id, "CHECK")
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark as Checked
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Director - Ready for Approval */}
              {["DIRECTOR", "ADMIN"].includes(user.role) &&
                pendingForApproval.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        To Approve ({pendingForApproval.length})
                      </CardTitle>
                      <CardDescription>
                        These have been checked by the accounts officer
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingForApproval.map((req) => (
                          <Card
                            key={req.id}
                            className="border-l-4 border-l-blue-400"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">
                                      {req.user.name}
                                    </span>
                                    {req.checkedBy && (
                                      <Badge
                                        variant="outline"
                                        className="text-blue-600 border-blue-300"
                                      >
                                        Checked by {req.checkedBy.name}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold">
                                    {req.reason}
                                  </h3>
                                  <p className="text-sm text-slate-600 mb-2">
                                    {req.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="font-semibold">
                                      KES {req.totalAmount.toLocaleString()}
                                    </span>
                                    <span>
                                      Event:{" "}
                                      {new Date(
                                        req.eventDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequisition(req);
                                      setShowRequisitionDetail(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-300"
                                    onClick={() =>
                                      handleApprove(req.id, "REJECT")
                                    }
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() =>
                                      handleApprove(req.id, "APPROVE")
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Accounts Officer - Ready for Disbursement */}
              {["ACCOUNTANT", "ADMIN"].includes(user.role) &&
                pendingForDisbursement.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        To Send Money ({pendingForDisbursement.length})
                      </CardTitle>
                      <CardDescription>
                        These requests are approved - send money and mark as
                        disbursed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingForDisbursement.map((req) => (
                          <Card
                            key={req.id}
                            className="border-l-4 border-l-green-400"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium">
                                      {req.user.name}
                                    </span>
                                    {req.approvedBy && (
                                      <Badge
                                        variant="outline"
                                        className="text-green-600 border-green-300"
                                      >
                                        Approved by {req.approvedBy.name}
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="font-semibold">
                                    {req.reason}
                                  </h3>
                                  <p className="text-sm text-slate-600 mb-2">
                                    {req.description}
                                  </p>
                                  <div className="flex flex-wrap gap-4 text-sm">
                                    <span className="font-bold text-green-600 text-lg">
                                      KES {req.totalAmount.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500">
                                      Event:{" "}
                                      {new Date(
                                        req.eventDate,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExport(req.id)}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download Form
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() =>
                                      handleApprove(req.id, "DISBURSE")
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark as Sent
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          Youth For Christ • Money Request System © {new Date().getFullYear()}
        </div>
      </footer>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>How to Use This System</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">For Staff:</h4>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                <li>Click "New Request" to create a money request</li>
                <li>Fill in the form with details and amounts</li>
                <li>Wait for Accounts to check and Director to approve</li>
                <li>After money is sent, upload your receipt</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-1">For Accounts Officer:</h4>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                <li>Go to "Work Queue" tab</li>
                <li>Check each request and click "Mark as Checked"</li>
                <li>
                  After Director approves, send money and click "Mark as Sent"
                </li>
                <li>Verify receipts when staff submit them</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-1">For National Director:</h4>
              <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
                <li>Go to "Work Queue" tab</li>
                <li>Review checked requests</li>
                <li>Click "Approve" or "Reject" for each</li>
              </ol>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Staff cannot create new requests
                until all pending receipts are uploaded after the event date.
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Partial Receipts:</strong> If a receipt is for less than
                the total amount, the balance remains until full amount is
                covered.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin: Manage Users Dialog */}
      <Dialog open={showAdminUsers} onOpenChange={setShowAdminUsers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Manage Users
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <h3 className="font-medium">Existing Users</h3>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {adminLoading ? (
                  <p className="text-sm text-slate-500">Loading...</p>
                ) : adminUsers.length === 0 ? (
                  <p className="text-sm text-slate-500">No users found.</p>
                ) : (
                  adminUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">
                          {u.name}{" "}
                          <span className="text-xs text-slate-500">
                            ({u.role})
                          </span>
                        </p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(u.email);
                            toast({
                              title: "Copied",
                              description: "Email copied to clipboard.",
                            });
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAdminUser(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <hr />

            <form onSubmit={createAdminUser} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newAdminForm.name}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newAdminForm.email}
                  onChange={(e) =>
                    setNewAdminForm({ ...newAdminForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newAdminForm.password}
                  onChange={(e) =>
                    setNewAdminForm({
                      ...newAdminForm,
                      password: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  onValueChange={(v) =>
                    setNewAdminForm({ ...newAdminForm, role: v })
                  }
                  value={newAdminForm.role}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                    <SelectItem value="DIRECTOR">Director</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Create User</Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowAdminUsers(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Drive Settings Dialog */}
      <Dialog open={showDriveSettings} onOpenChange={setShowDriveSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Google Drive Integration
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {driveStatus?.configured ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Connected to Google Drive</span>
                </div>
                <p className="text-sm text-green-600">{driveStatus.message}</p>
                <p className="text-xs text-green-500 mt-2">
                  Your receipts will be automatically backed up to Google Drive
                  when uploaded.
                </p>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Cloud className="h-5 w-5" />
                  <span className="font-medium">
                    Google Drive Not Configured
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">
                  {driveStatus?.message}
                </p>

                {driveStatus?.setupInstructions && (
                  <div className="bg-white p-3 rounded border text-xs text-slate-600 space-y-1">
                    {driveStatus.setupInstructions.map((instruction, i) => (
                      <p key={i}>{instruction}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google Drive
                </Button>
              </a>
              <Button variant="outline" onClick={checkDriveStatus}>
                Refresh Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Requisition Dialog */}
      <Dialog open={showNewRequisition} onOpenChange={setShowNewRequisition}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Money Request</DialogTitle>
            <DialogDescription>
              Fill in the details below to request funds
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleNewRequisition} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>What do you need money for? *</Label>
                <Select
                  value={newReqForm.reason}
                  onValueChange={(v) =>
                    setNewReqForm((prev) => ({ ...prev, reason: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Account to Charge</Label>
                <Input
                  placeholder="e.g., Program Fund"
                  value={newReqForm.accountToCharge}
                  onChange={(e) =>
                    setNewReqForm((prev) => ({
                      ...prev,
                      accountToCharge: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Explain what you need *</Label>
              <Textarea
                placeholder="Describe why you need this money..."
                value={newReqForm.description}
                onChange={(e) =>
                  setNewReqForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date of Event/Activity *</Label>
                <Input
                  type="date"
                  value={newReqForm.eventDate}
                  onChange={(e) =>
                    setNewReqForm((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label>When do you need the money? *</Label>
                <Input
                  type="date"
                  value={newReqForm.dateNeeded}
                  onChange={(e) =>
                    setNewReqForm((prev) => ({
                      ...prev,
                      dateNeeded: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label>Who will be involved? (Optional)</Label>
              <Input
                placeholder="e.g., 5 staff members, 20 youth..."
                value={newReqForm.participants}
                onChange={(e) =>
                  setNewReqForm((prev) => ({
                    ...prev,
                    participants: e.target.value,
                  }))
                }
              />
            </div>

            {newReqForm.reason.includes("Transport") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Distance</Label>
                  <Input
                    placeholder="e.g., 50 km"
                    value={newReqForm.transportDistance}
                    onChange={(e) =>
                      setNewReqForm((prev) => ({
                        ...prev,
                        transportDistance: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Number of Trips</Label>
                  <Input
                    placeholder="e.g., 2 trips"
                    value={newReqForm.transportQuantity}
                    onChange={(e) =>
                      setNewReqForm((prev) => ({
                        ...prev,
                        transportQuantity: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Item List *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExpenseItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {newReqForm.expenseItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Item name"
                      value={item.item}
                      onChange={(e) =>
                        updateExpenseItem(index, "item", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        updateExpenseItem(index, "amount", e.target.value)
                      }
                    />
                  </div>
                  {newReqForm.expenseItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExpenseItem(index)}
                      className="text-red-500"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <div className="bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-slate-600">Total: </span>
                  <span className="font-bold text-lg">
                    KES {calculateTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewRequisition(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Requisition Dialog (Admin Only) */}
      <Dialog open={showEditRequisition} onOpenChange={setShowEditRequisition}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              Change the details of this request
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Reason</Label>
                <Select
                  value={editForm.reason}
                  onValueChange={(v) =>
                    setEditForm((prev) => ({ ...prev, reason: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((prev) => ({ ...prev, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Waiting for Review</SelectItem>
                    <SelectItem value="CHECKED">Checked</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="DISBURSED">Money Sent</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Event Date</Label>
                <Input
                  type="date"
                  value={editForm.eventDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Date Needed</Label>
                <Input
                  type="date"
                  value={editForm.dateNeeded}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      dateNeeded: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Item List</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEditExpenseItem}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {editForm.expenseItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Item name"
                      value={item.item}
                      onChange={(e) =>
                        updateEditExpenseItem(index, "item", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) =>
                        updateEditExpenseItem(index, "amount", e.target.value)
                      }
                    />
                  </div>
                  {editForm.expenseItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEditExpenseItem(index)}
                      className="text-red-500"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <div className="bg-slate-100 px-4 py-2 rounded-lg">
                  <span className="text-sm text-slate-600">Total: </span>
                  <span className="font-bold text-lg">
                    KES {calculateEditTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditRequisition(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this request? This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog open={showReceiptUpload} onOpenChange={setShowReceiptUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Receipt</DialogTitle>
            <DialogDescription>
              Upload a receipt for: {selectedRequisition?.reason}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadReceipt} className="space-y-4">
            <div>
              <Label>Receipt Amount (KES) *</Label>
              <Input
                type="number"
                placeholder="Enter amount on this receipt"
                value={receiptAmount}
                onChange={(e) => setReceiptAmount(e.target.value)}
                required
                min="0"
                step="0.01"
              />
              <p className="text-xs text-slate-500 mt-1">
                Remaining balance: KES{" "}
                {selectedRequisition
                  ? (
                      selectedRequisition.totalAmount -
                      (selectedRequisition.totalReceived || 0)
                    ).toLocaleString()
                  : "0"}
              </p>
            </div>
            <div>
              <Label>Select Receipt File *</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                You can upload images or PDF files
              </p>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this receipt..."
                value={receiptDescription}
                onChange={(e) => setReceiptDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReceiptUpload(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedFile || !receiptAmount}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Requisition Detail Dialog */}
      <Dialog
        open={showRequisitionDetail}
        onOpenChange={setShowRequisitionDetail}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequisition && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge
                    className={statusConfig[selectedRequisition.status]?.color}
                  >
                    {statusConfig[selectedRequisition.status]?.label}
                  </Badge>
                  <p className="text-sm text-slate-500 mt-1">
                    {statusConfig[selectedRequisition.status]?.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(selectedRequisition.id)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Form
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-500">Requested By</Label>
                  <p className="font-medium">{selectedRequisition.user.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Department</Label>
                  <p className="font-medium">
                    {selectedRequisition.user.department || "Not specified"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Reason</Label>
                  <p className="font-medium">{selectedRequisition.reason}</p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Total Amount</Label>
                  <p className="font-medium text-green-600">
                    KES {selectedRequisition.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Event Date</Label>
                  <p className="font-medium">
                    {new Date(
                      selectedRequisition.eventDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Date Needed</Label>
                  <p className="font-medium">
                    {new Date(
                      selectedRequisition.dateNeeded,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-500">Description</Label>
                <p className="mt-1">{selectedRequisition.description}</p>
              </div>

              {selectedRequisition.participants && (
                <div>
                  <Label className="text-sm text-slate-500">Participants</Label>
                  <p className="mt-1">{selectedRequisition.participants}</p>
                </div>
              )}

              <div>
                <Label className="text-sm text-slate-500">Item List</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-2 text-sm">Item</th>
                        <th className="text-right p-2 text-sm">Amount (KES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        try {
                          return JSON.parse(
                            selectedRequisition.expenseItems,
                          ).map((item: ExpenseItem, i: number) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{item.item}</td>
                              <td className="p-2 text-right">
                                {item.amount.toLocaleString()}
                              </td>
                            </tr>
                          ));
                        } catch {
                          return null;
                        }
                      })()}
                      <tr className="border-t bg-slate-50">
                        <td className="p-2 font-semibold">Total</td>
                        <td className="p-2 text-right font-semibold">
                          {selectedRequisition.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-500">
                  Amount in Words
                </Label>
                <p className="mt-1 italic">
                  {numberToWords(Math.floor(selectedRequisition.totalAmount))}{" "}
                  Kenya Shillings
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-slate-500">Checked By</Label>
                  <p className="font-medium">
                    {selectedRequisition.checkedBy?.name || "Pending"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Approved By</Label>
                  <p className="font-medium">
                    {selectedRequisition.approvedBy?.name || "Pending"}
                  </p>
                </div>
              </div>

              {selectedRequisition.receipts &&
                selectedRequisition.receipts.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm text-slate-500">
                        Receipts Uploaded
                      </Label>
                      <div className="mt-2 space-y-2">
                        {selectedRequisition.receipts.map((receipt) => (
                          <div
                            key={receipt.id}
                            className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                          >
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium text-sm">
                                {receipt.fileName}
                              </p>
                              <p className="text-xs text-slate-500">
                                Uploaded:{" "}
                                {new Date(
                                  receipt.uploadedAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
  }
