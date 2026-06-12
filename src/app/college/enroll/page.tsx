'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {
 Upload,
 Download,
 FileSpreadsheet,
 UserPlus,
 CheckCircle2,
 XCircle,
 AlertCircle,
 Users,
 FileText,
 ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface EnrollmentEntry {
 name: string;
 email: string;
 branch: string;
 degree: string;
 year: string;
 status: 'pending' | 'success' | 'error';
 error?: string;
}

export default function CollegeEnrollPage() {
 const { token } = useAppStore();
 const [mode, setMode] = React.useState<'manual' | 'csv'>('csv');
 const [manualForm, setManualForm] = React.useState({
 name: '',
 email: '',
 branch: '',
 degree: '',
 year: '',
 });
 const [csvData, setCsvData] = React.useState<EnrollmentEntry[]>([]);
 const [isUploading, setIsUploading] = React.useState(false);
 const [enrollmentResults, setEnrollmentResults] = React.useState<EnrollmentEntry[]>([]);
 const [showResults, setShowResults] = React.useState(false);

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (!file.name.endsWith('.csv')) {
 toast.error('Please upload a CSV file');
 return;
 }

 const reader = new FileReader();
 reader.onload = (event) => {
 const text = event.target?.result as string;
 const lines = text.split('\n').filter((line) => line.trim());
 if (lines.length < 2) {
 toast.error('CSV file is empty or has no data rows');
 return;
 }

 const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
 const entries: EnrollmentEntry[] = [];

 for (let i = 1; i < lines.length; i++) {
 const values = lines[i].split(',').map((v) => v.trim());
 const entry: EnrollmentEntry = {
 name: values[headers.indexOf('name')] || '',
 email: values[headers.indexOf('email')] || '',
 branch: values[headers.indexOf('branch')] || '',
 degree: values[headers.indexOf('degree')] || '',
 year: values[headers.indexOf('year')] || '',
 status: 'pending',
 };
 if (entry.name && entry.email) {
 entries.push(entry);
 }
 }

 setCsvData(entries);
 toast.success(`${entries.length} students found in CSV`);
 };
 reader.readAsText(file);
 };

 const handleManualAdd = () => {
 if (!manualForm.name || !manualForm.email) {
 toast.error('Name and email are required');
 return;
 }
 setCsvData((prev) => [...prev, { ...manualForm, status: 'pending' as const }]);
 setManualForm({ name: '', email: '', branch: '', degree: '', year: '' });
 toast.success('Student added to enrollment list');
 };

 const handleEnroll = async () => {
 if (csvData.length === 0) {
 toast.error('No students to enroll');
 return;
 }

 setIsUploading(true);
 try {
 const headers: Record<string, string> = { 'Content-Type': 'application/json' };
 if (token) headers['Authorization'] = `Bearer ${token}`;

 const res = await fetch('/api/college/enroll', {
 method: 'POST',
 headers,
 body: JSON.stringify({ students: csvData }),
 });

 const data = await res.json();
 if (res.ok) {
 const results: EnrollmentEntry[] = csvData.map((entry) => ({
 ...entry,
 status: 'success' as const,
 }));
 // Mark any failed ones
 if (data.errors) {
 data.errors.forEach((err: { index: number; error: string }) => {
 results[err.index].status = 'error';
 results[err.index].error = err.error;
 });
 }
 setEnrollmentResults(results);
 setShowResults(true);
 const successCount = results.filter((r) => r.status === 'success').length;
 toast.success(`${successCount} students enrolled successfully!`);
 } else {
 toast.error(data.error || 'Enrollment failed');
 }
 } catch {
 toast.error('Something went wrong');
 } finally {
 setIsUploading(false);
 }
 };

 const downloadTemplate = () => {
 const csv = 'name,email,branch,degree,year\nPriya Sharma,priya@college.edu,CSE,B.Tech,3rd Year\nRahul Verma,rahul@college.edu,IT,B.Tech,4th Year';
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = 'campuscred_enrollment_template.csv';
 a.click();
 URL.revokeObjectURL(url);
 toast.success('Template downloaded!');
 };

 if (showResults) {
 const successCount = enrollmentResults.filter((r) => r.status === 'success').length;
 const errorCount = enrollmentResults.filter((r) => r.status === 'error').length;

 return (
 <div className="space-y-6">
 <div className="text-center py-8">
 <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
 <CheckCircle2 className="w-10 h-10 text-emerald-600" />
 </div>
 <h2 className="text-2xl font-bold font-heading">Enrollment Complete!</h2>
 <p className="text-sm text-text-secondary mt-2">
 {successCount} students enrolled successfully
 {errorCount > 0 && ` • ${errorCount} failed`}
 </p>
 </div>

 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-3">Results</h3>
 <div className="space-y-2 max-h-96 overflow-y-auto">
 {enrollmentResults.map((result, i) => (
 <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 {result.status === 'success' ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 ) : (
 <XCircle className="w-4 h-4 text-red-500" />
 )}
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium">{result.name}</p>
 <p className="text-xs text-text-secondary">{result.email}</p>
 </div>
 {result.status === 'error' && result.error && (
 <p className="text-xs text-red-500">{result.error}</p>
 )}
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <div className="flex gap-3 justify-center">
 <Button variant="outline" onClick={() => { setShowResults(false); setCsvData([]); setEnrollmentResults([]); }}>
 Enroll More Students
 </Button>
 <Link href="/college/students">
 <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
 <Users className="w-4 h-4" />
 View Students
 </Button>
 </Link>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Enroll Students</h1>
 <p className="text-sm text-text-secondary mt-1">Bulk enroll students via CSV upload or add them manually</p>
 </div>

 {/* Mode toggle */}
 <div className="flex gap-2">
 <Button
 variant={mode === 'csv' ? 'default' : 'outline'}
 onClick={() => setMode('csv')}
 className={mode === 'csv' ? 'bg-amber-500 hover:bg-amber-600 text-white gap-2' : 'gap-2'}
 >
 <FileSpreadsheet className="w-4 h-4" />
 CSV Upload
 </Button>
 <Button
 variant={mode === 'manual' ? 'default' : 'outline'}
 onClick={() => setMode('manual')}
 className={mode === 'manual' ? 'bg-amber-500 hover:bg-amber-600 text-white gap-2' : 'gap-2'}
 >
 <UserPlus className="w-4 h-4" />
 Manual Entry
 </Button>
 </div>

 {mode === 'csv' && (
 <div className="space-y-4">
 {/* Download template */}
 <Card>
 <CardContent className="p-5">
 <div className="flex items-center justify-between">
 <div>
 <h3 className="text-sm font-bold">CSV Template</h3>
 <p className="text-xs text-text-secondary mt-1">Download the template, fill in student data, and upload</p>
 </div>
 <Button variant="outline" onClick={downloadTemplate} className="gap-2">
 <Download className="w-4 h-4" />
 Download Template
 </Button>
 </div>
 <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs text-text-secondary">
 <p className="font-medium mb-1">Required columns:</p>
 <code className="text-[10px]">name, email, branch, degree, year</code>
 </div>
 </CardContent>
 </Card>

 {/* Upload area */}
 <Card>
 <CardContent className="p-6">
 <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors">
 <Upload className="w-10 h-10 text-text-secondary/40 mx-auto mb-3" />
 <p className="text-sm font-medium">Drop your CSV file here</p>
 <p className="text-xs text-text-secondary mt-1">or click to browse</p>
 <input
 type="file"
 accept=".csv"
 onChange={handleFileUpload}
 className="absolute inset-0 opacity-0 cursor-pointer"
 style={{ position: 'relative', marginTop: '12px' }}
 />
 </div>
 </CardContent>
 </Card>

 {/* Preview uploaded data */}
 {csvData.length > 0 && (
 <Card>
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-sm font-bold">Preview ({csvData.length} students)</h3>
 <Button variant="ghost" size="sm" onClick={() => setCsvData([])} className="text-xs text-red-500">
 Clear
 </Button>
 </div>
 <div className="space-y-2 max-h-64 overflow-y-auto">
 {csvData.map((entry, i) => (
 <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <Badge variant="outline" className="text-[10px] w-6 h-6 rounded-full flex items-center justify-center p-0">
 {i + 1}
 </Badge>
 <div className="flex-1 min-w-0">
 <p className="font-medium truncate">{entry.name}</p>
 <p className="text-xs text-text-secondary">{entry.email} • {entry.degree} {entry.branch}</p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 </div>
 )}

 {mode === 'manual' && (
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold mb-4">Add Student Manually</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm">Full Name *</Label>
 <Input
 value={manualForm.name}
 onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
 placeholder="Student name"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm">Email *</Label>
 <Input
 type="email"
 value={manualForm.email}
 onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
 placeholder="student@college.edu"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm">Degree</Label>
 <Input
 value={manualForm.degree}
 onChange={(e) => setManualForm({ ...manualForm, degree: e.target.value })}
 placeholder="e.g., B.Tech"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm">Branch</Label>
 <Input
 value={manualForm.branch}
 onChange={(e) => setManualForm({ ...manualForm, branch: e.target.value })}
 placeholder="e.g., CSE"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm">Year</Label>
 <Select value={manualForm.year} onValueChange={(val) => setManualForm({ ...manualForm, year: val })}>
 <SelectTrigger>
 <SelectValue placeholder="Select year" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="1st Year">1st Year</SelectItem>
 <SelectItem value="2nd Year">2nd Year</SelectItem>
 <SelectItem value="3rd Year">3rd Year</SelectItem>
 <SelectItem value="4th Year">4th Year</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="flex items-end">
 <Button onClick={handleManualAdd} className="bg-amber-500 hover:bg-amber-600 text-white gap-2 w-full">
 <UserPlus className="w-4 h-4" />
 Add Student
 </Button>
 </div>
 </div>

 {csvData.length > 0 && (
 <div className="mt-6">
 <h4 className="text-xs font-medium text-text-secondary mb-2">Students to enroll ({csvData.length})</h4>
 <div className="space-y-2 max-h-48 overflow-y-auto">
 {csvData.map((entry, i) => (
 <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <span className="text-xs text-text-secondary">{i + 1}.</span>
 <span className="font-medium">{entry.name}</span>
 <span className="text-xs text-text-secondary">({entry.email})</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 )}

 {/* Enroll button */}
 {csvData.length > 0 && (
 <Button
 onClick={handleEnroll}
 disabled={isUploading}
 className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2 py-3"
 >
 {isUploading ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 <Users className="w-4 h-4" />
 Enroll {csvData.length} Student{csvData.length !== 1 ? 's' : ''}
 </>
 )}
 </Button>
 )}
 </div>
 );
}
