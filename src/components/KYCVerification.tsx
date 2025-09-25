import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface KYCVerificationProps {
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_started';
  onKYCSubmit: (documents: KYCDocuments) => void;
}

interface KYCDocuments {
  idDocument: File | null;
  proofOfAddress: File | null;
  bankStatement: File | null;
}

export const KYCVerification: React.FC<KYCVerificationProps> = ({ kycStatus, onKYCSubmit }) => {
  const { t } = useLanguage();
  const [documents, setDocuments] = useState<KYCDocuments>({
    idDocument: null,
    proofOfAddress: null,
    bankStatement: null
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (documentType: keyof KYCDocuments, file: File | null) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleSubmit = async () => {
    if (!documents.idDocument || !documents.proofOfAddress) {
      alert('Please upload required documents');
      return;
    }
    
    setUploading(true);
    try {
      await onKYCSubmit(documents);
    } catch (error) {
      console.error('KYC submission failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('kyc.approved')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {t('kyc.pending')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t('kyc.rejected')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const FileUploadField = ({ 
    label, 
    documentType, 
    required = false 
  }: { 
    label: string; 
    documentType: keyof KYCDocuments; 
    required?: boolean; 
  }) => {
    const file = documents[documentType];
    
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">{file.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFileUpload(documentType, null)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  handleFileUpload(documentType, file);
                }}
                className="hidden"
                id={`file-${documentType}`}
              />
              <Label htmlFor={`file-${documentType}`} className="cursor-pointer">
                <Button variant="outline" size="sm" type="button">
                  {t('kyc.upload')}
                </Button>
              </Label>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (kycStatus === 'approved') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('kyc.title')}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your KYC verification has been approved. You can now request payouts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('kyc.title')}</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your KYC documents are being reviewed. This process typically takes 1-3 business days.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('kyc.title')}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {kycStatus === 'rejected' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your KYC verification was rejected. Please upload new documents and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('kyc.required')}
          </AlertDescription>
        </Alert>

        <FileUploadField 
          label={t('kyc.idDocument')} 
          documentType="idDocument" 
          required 
        />
        
        <FileUploadField 
          label={t('kyc.proofOfAddress')} 
          documentType="proofOfAddress" 
          required 
        />
        
        <FileUploadField 
          label={t('kyc.bankDetails')} 
          documentType="bankStatement" 
        />

        <div className="pt-4">
          <Button 
            onClick={handleSubmit} 
            disabled={uploading || !documents.idDocument || !documents.proofOfAddress}
            className="w-full"
          >
            {uploading ? t('common.loading') : t('form.submit')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};