import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, Loader2, Pencil, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GalleryImage {
  url: string;
  caption: string;
}

interface AgentGalleryManagerProps {
  agentId: string;
  planType: 'starter' | 'professional';
  images: GalleryImage[];
  onImagesUpdate: (images: GalleryImage[]) => void;
}

const AgentGalleryManager: React.FC<AgentGalleryManagerProps> = ({
  agentId,
  planType,
  images,
  onImagesUpdate
}) => {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxImages = planType === 'professional' ? 10 : 5;
  const remainingSlots = maxImages - images.length;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) {
      toast({
        title: "Gallery Full",
        description: `You can only upload ${maxImages} images with your ${planType} plan.`,
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const uploadedImages: GalleryImage[] = [];

    try {
      for (const file of filesToUpload) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid File",
            description: "Please upload only image files.",
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: "Please upload images smaller than 5MB.",
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${agentId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('agent-gallery')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive"
          });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('agent-gallery')
          .getPublicUrl(data.path);

        const newImage: GalleryImage = {
          url: urlData.publicUrl,
          caption: ''
        };
        uploadedImages.push(newImage);

        // Save to database
        await supabase
          .from('agent_gallery_images')
          .insert({
            agent_id: agentId,
            image_url: urlData.publicUrl,
            display_order: images.length + uploadedImages.length
          });
      }

      if (uploadedImages.length > 0) {
        onImagesUpdate([...images, ...uploadedImages]);
        toast({
          title: "Upload Successful",
          description: `${uploadedImages.length} image(s) uploaded successfully. Click the edit icon to add a caption.`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An error occurred while uploading images.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (index: number) => {
    setDeletingIndex(index);
    const imageUrl = images[index].url;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/agent-gallery/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        await supabase.storage
          .from('agent-gallery')
          .remove([filePath]);
      }

      // Delete from database
      await supabase
        .from('agent_gallery_images')
        .delete()
        .eq('image_url', imageUrl);

      // Update local state
      const newImages = images.filter((_, i) => i !== index);
      onImagesUpdate(newImages);

      toast({
        title: "Image Deleted",
        description: "The image has been removed from your gallery."
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "An error occurred while deleting the image.",
        variant: "destructive"
      });
    } finally {
      setDeletingIndex(null);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditCaption(images[index].caption);
  };

  const handleSaveCaption = (index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = {
      ...updatedImages[index],
      caption: editCaption
    };
    onImagesUpdate(updatedImages);
    setEditingIndex(null);
    setEditCaption('');
    toast({
      title: "Caption Saved",
      description: "Your photo caption has been updated."
    });
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleSaveCaption(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditCaption('');
    }
  };

  return (
    <Card className="shadow-md border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b bg-muted/30 p-4">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent rounded-lg">
              <ImageIcon className="h-4 w-4 text-white" />
            </div>
            Gallery Manager
          </div>
          <Badge variant="outline" className="text-xs">
            {images.length}/{maxImages} images • {planType === 'professional' ? 'Professional' : 'Starter'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Upload Area */}
        {remainingSlots > 0 && (
          <div className="mb-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full h-20 border-dashed border-2 hover:border-primary hover:bg-primary/5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Images ({remainingSlots} slots remaining)
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              You can add a caption to each photo after uploading (e.g., Office Premises, Achievement, Award)
            </p>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden border bg-muted/20">
                <div className="aspect-[4/3] relative">
                  <img
                    src={img.url}
                    alt={img.caption || `Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeleteImage(index)}
                    disabled={deletingIndex === index}
                    className="absolute top-1 right-1 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                  >
                    {deletingIndex === index ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>
                </div>
                
                {/* Caption Section */}
                <div className="p-2 border-t bg-background">
                  {editingIndex === index ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        onKeyDown={(e) => handleCaptionKeyDown(e, index)}
                        placeholder="e.g., Office Premises, Award..."
                        className="h-7 text-xs"
                        maxLength={100}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleSaveCaption(index)}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-between gap-1 cursor-pointer hover:bg-muted/50 rounded p-1 -m-1"
                      onClick={() => handleStartEdit(index)}
                    >
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {img.caption || 'Click to add caption...'}
                      </p>
                      <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No images in your gallery yet</p>
            <p className="text-xs">Upload images to showcase your work</p>
          </div>
        )}

        {/* Upgrade Prompt for Starter Plan */}
        {planType === 'starter' && remainingSlots <= 0 && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground">
              Upgrade to <strong className="text-primary">Professional Plan</strong> to upload up to 10 images
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentGalleryManager;
