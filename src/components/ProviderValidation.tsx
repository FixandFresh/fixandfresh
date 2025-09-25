import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProviderValidationProps {
  onValidationComplete: () => void;
  onSkip?: () => void;
  providerType: 'individual' | 'company';
  providerName: string;
  providerEmail: string;
}

const ProviderValidation: React.FC<ProviderValidationProps> = ({ 
  onValidationComplete, 
  onSkip,
  providerType, 
  providerName, 
  providerEmail 
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [uploads, setUploads] = useState<{[key: string]: File | null}>({
    id: null,
    cv: null,
    policeRecord: null,
    businessPermit: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (type: string, file: File | null) => {
    setUploads(prev => ({ ...prev, [type]: file }));
  };

  const requiredDocs = providerType === 'individual' 
    ? ['id', 'cv', 'policeRecord']
    : ['businessPermit'];

  const isComplete = requiredDocs.every(doc => uploads[doc]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (!isComplete) return;
    
    setIsSubmitting(true);
    
    try {
      const documents: {[key: string]: string} = {};
      for (const docType of requiredDocs) {
        const file = uploads[docType];
        if (file) {
          const base64 = await fileToBase64(file);
          documents[docType] = base64;
        }
      }

      const providerId = `provider_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data: insertData, error: dbError } = await supabase
        .from('provider_validations')
        .insert({
          provider_id: providerId,
          provider_name: providerName,
          provider_email: providerEmail,
          provider_type: providerType,
          documents: documents,
          status: 'pending'
        })
        .select();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Try to send validation email (non-blocking)
      try {
        await supabase.functions.invoke('send-validation-email', {
          body: {
            providerName,
            providerEmail,
            providerType,
            documents: requiredDocs
          }
        });
      } catch (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't block the process if email fails
      }

      toast({
        title: 'Documents Submitted Successfully!',
        description: 'Your documents have been submitted for review. You will be notified once approved.',
      });
      
      // Complete the validation process
      onValidationComplete();
    } catch (error) {
      console.error('Validation submission error:', error);
      toast({
        title: 'Submission Error',
        description: error instanceof Error ? error.message : "There was an error submitting your documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipValidation = () => {
    toast({
      title: 'Validation Skipped',
      description: 'You can complete validation later from your dashboard.',
    });
    if (onSkip) {
      onSkip();
    } else {
      onValidationComplete();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Provider Validation</CardTitle>
        <CardDescription>
          {providerType === 'individual' 
            ? 'Upload your ID, CV, and police record for verification'
            : 'Upload your business permit for verification'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {providerType === 'individual' && (
          <>
            <DocumentUpload
              label="Government ID"
              type="id"
              file={uploads.id}
              onUpload={handleFileUpload}
            />
            <DocumentUpload
              label="CV/Resume"
              type="cv"
              file={uploads.cv}
              onUpload={handleFileUpload}
            />
            <DocumentUpload
              label="Police Record"
              type="policeRecord"
              file={uploads.policeRecord}
              onUpload={handleFileUpload}
            />
          </>
        )}
        
        {providerType === 'company' && (
          <DocumentUpload
            label="Business Permit"
            type="businessPermit"
            file={uploads.businessPermit}
            onUpload={handleFileUpload}
          />
        )}

        <div className="flex gap-4">
          <Button 
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Documents'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleSkipValidation}
            disabled={isSubmitting}
            className="flex-1"
          >
            Skip for Now
          </Button>
        </div>
        
        <p className="text-sm text-gray-500 text-center">
          You can complete validation later from your provider dashboard.
        </p>
      </CardContent>
    </Card>
  );
};

const DocumentUpload: React.FC<{
  label: string;
  type: string;
  file: File | null;
  onUpload: (type: string, file: File | null) => void;
}> = ({ label, type, file, onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onUpload(type, selectedFile);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-2">
        <Input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="flex-1"
        />
        {file ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Upload className="w-5 h-5 text-gray-400" />
        )}
      </div>
      {file && (
        <p className="text-sm text-green-600 flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {file.name}
        </p>
      )}
    </div>
  );
};

export default ProviderValidation;