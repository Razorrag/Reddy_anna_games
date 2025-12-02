import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Camera,
  Home,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserVerification } from '@/hooks/queries/user/useUserVerification';
import { useUploadVerificationDocument } from '@/hooks/mutations/user/useUploadVerificationDocument';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

type DocumentType = 'id_proof' | 'address_proof' | 'selfie';

interface DocumentStatus {
  type: DocumentType;
  status: 'pending' | 'approved' | 'rejected' | 'not_uploaded';
  rejectionReason?: string;
  uploadedAt?: string;
}

export default function Verification() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: verification, isLoading } = useUserVerification(user?.id || '');
  const uploadDocument = useUploadVerificationDocument();

  const [uploading, setUploading] = useState<DocumentType | null>(null);

  const handleFileUpload = async (type: DocumentType, file: File) => {
    if (!user?.id) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(type);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      await uploadDocument.mutateAsync({
        userId: user.id,
        type,
        file: formData,
      });

      toast.success('Document uploaded successfully! We will review it within 24-48 hours.');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Under Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Upload className="w-3 h-3" />
            Not Uploaded
          </Badge>
        );
    }
  };

  const documents: Array<{
    type: DocumentType;
    title: string;
    description: string;
    icon: any;
    examples: string[];
  }> = [
    {
      type: 'id_proof',
      title: 'ID Proof',
      description: 'Government-issued identification document',
      icon: User,
      examples: ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License', 'Voter ID'],
    },
    {
      type: 'address_proof',
      title: 'Address Proof',
      description: 'Document showing your residential address',
      icon: Home,
      examples: ['Utility Bill', 'Bank Statement', 'Rental Agreement', 'Aadhaar Card'],
    },
    {
      type: 'selfie',
      title: 'Selfie Verification',
      description: 'Clear selfie holding your ID proof',
      icon: Camera,
      examples: ['Hold ID next to face', 'Ensure good lighting', 'Face clearly visible'],
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading verification status...</div>
      </div>
    );
  }

  const verificationStatus = verification?.status || 'not_started';
  const documentStatuses: DocumentStatus[] = verification?.documents || documents.map(d => ({
    type: d.type,
    status: 'not_uploaded',
  }));

  const allApproved = documentStatuses.every((d: DocumentStatus) => d.status === 'approved');
  const anyRejected = documentStatuses.some((d: DocumentStatus) => d.status === 'rejected');
  const anyPending = documentStatuses.some((d: DocumentStatus) => d.status === 'pending');

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/user/profile')}
              className="text-white hover:text-[#FFD700]"
            >
              ← Back
            </Button>
            <Shield className="w-8 h-8 text-[#FFD700]" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Account Verification</h1>
              <p className="text-sm text-gray-400">Complete KYC to unlock all features</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Verification Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`p-6 mb-8 ${
            allApproved
              ? 'bg-gradient-to-r from-green-600/20 to-green-700/20 border-green-500/50'
              : anyRejected
              ? 'bg-gradient-to-r from-red-600/20 to-red-700/20 border-red-500/50'
              : anyPending
              ? 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border-[#FFD700]/50'
              : 'bg-[#1a1f3a] border-[#FFD700]/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {allApproved ? (
                  <CheckCircle className="w-12 h-12 text-green-500" />
                ) : anyRejected ? (
                  <XCircle className="w-12 h-12 text-red-500" />
                ) : anyPending ? (
                  <Clock className="w-12 h-12 text-[#FFD700]" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-gray-500" />
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {allApproved
                      ? 'Fully Verified'
                      : anyRejected
                      ? 'Verification Issues'
                      : anyPending
                      ? 'Under Review'
                      : 'Not Verified'}
                  </h2>
                  <p className="text-gray-400">
                    {allApproved
                      ? 'Your account is fully verified. You can now access all features.'
                      : anyRejected
                      ? 'Some documents were rejected. Please re-upload them.'
                      : anyPending
                      ? 'Your documents are under review. We will update you within 24-48 hours.'
                      : 'Upload the required documents to verify your account.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#00F5FF]/10 border-[#00F5FF]/30 p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#00F5FF] flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="text-white font-medium">Why verify your account?</p>
                <ul className="text-gray-400 space-y-1 list-disc list-inside">
                  <li>Secure withdrawals of winnings</li>
                  <li>Higher transaction limits</li>
                  <li>Priority customer support</li>
                  <li>Protection against fraud</li>
                  <li>Compliance with regulations</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Document Upload Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {documents.map((doc, index) => {
            const docStatus = documentStatuses.find((d: DocumentStatus) => d.type === doc.type);
            const Icon = doc.icon;

            return (
              <motion.div
                key={doc.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                <Card className={`bg-[#1a1f3a] p-6 h-full ${
                  docStatus?.status === 'approved'
                    ? 'border-green-500/50'
                    : docStatus?.status === 'rejected'
                    ? 'border-red-500/50'
                    : 'border-[#FFD700]/30'
                }`}>
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-[#FFD700]/10 rounded-lg">
                        <Icon className="w-6 h-6 text-[#FFD700]" />
                      </div>
                      {getStatusBadge(docStatus?.status || 'not_uploaded')}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{doc.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{doc.description}</p>
                    </div>

                    {/* Examples */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Accepted documents:</p>
                      <div className="flex flex-wrap gap-1">
                        {doc.examples.map((example, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-[#2a2f4a] text-gray-400 rounded"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {docStatus?.status === 'rejected' && docStatus.rejectionReason && (
                      <Card className="bg-red-500/10 border-red-500/30 p-3">
                        <p className="text-xs text-red-400">
                          <strong>Rejected:</strong> {docStatus.rejectionReason}
                        </p>
                      </Card>
                    )}

                    {/* Upload Button */}
                    <div>
                      <input
                        type="file"
                        id={`upload-${doc.type}`}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.type, file);
                        }}
                        disabled={uploading !== null}
                      />
                      <Button
                        variant={docStatus?.status === 'approved' ? 'outline' : 'gold'}
                        onClick={() => document.getElementById(`upload-${doc.type}`)?.click()}
                        disabled={uploading !== null || docStatus?.status === 'pending'}
                        className="w-full gap-2"
                      >
                        {uploading === doc.type ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : docStatus?.status === 'approved' ? (
                          <>
                            <Upload className="w-4 h-4" />
                            Re-upload
                          </>
                        ) : docStatus?.status === 'pending' ? (
                          <>
                            <Clock className="w-4 h-4" />
                            Under Review
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Document
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Max size: 5MB • Format: JPG, PNG
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FFD700]" />
              Upload Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">✅ Do's</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Ensure documents are clear and readable</li>
                  <li>• Use good lighting when taking photos</li>
                  <li>• Include all four corners of the document</li>
                  <li>• Make sure text is not blurry</li>
                  <li>• Upload recent documents (within 3 months)</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-3">❌ Don'ts</h4>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Don't upload blurry or cut-off images</li>
                  <li>• Don't use photocopies or scanned copies</li>
                  <li>• Don't hide or edit any information</li>
                  <li>• Don't upload expired documents</li>
                  <li>• Don't use documents belonging to others</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}