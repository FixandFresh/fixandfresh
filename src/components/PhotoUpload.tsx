import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void;
  existingPhotos?: string[];
  maxPhotos?: number;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  existingPhotos = [],
  maxPhotos = 5
}) => {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: t('common.error'),
        description: `Maximum ${maxPhotos} photos allowed`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const newPhotos: string[] = [];
      
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newPhotos.push(base64);
        }
      }
      
      const updatedPhotos = [...photos, ...newPhotos];
      setPhotos(updatedPhotos);
      onPhotosChange(updatedPhotos);
      
      toast({
        title: t('common.success'),
        description: `${newPhotos.length} photo(s) added successfully`
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "Failed to upload photos",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onPhotosChange(updatedPhotos);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            <h3 className="font-medium">Job Completion Photos</h3>
          </div>
          
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Job photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {photos.length < maxPhotos && (
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="w-full"
                  asChild
                >
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {uploading ? t('common.loading') : 'Add Photos'}
                  </span>
                </Button>
              </label>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            {photos.length}/{maxPhotos} photos uploaded
          </p>
        </div>
      </CardContent>
    </Card>
  );
};