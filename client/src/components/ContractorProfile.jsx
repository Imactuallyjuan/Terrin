import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";
import { Upload, Camera } from "lucide-react";
import { z } from "zod";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../lib/firebase";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  specialties: z.string().min(1, "At least one specialty is required"),
  description: z.string().min(50, "Please provide a detailed description (at least 50 characters)"),
  experience: z.string().min(1, "Experience is required"),
  location: z.string().min(1, "Location is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  website: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export default function ContractorProfile() {
  const { user } = useFirebaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user?.photoURL || null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      specialties: "",
      description: "",
      experience: "",
      location: "",
      phone: "",
      website: "",
      licenseNumber: "",
    },
  });

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      setProfilePhoto(file);
      setProfilePhotoUrl(URL.createObjectURL(file));
    }
  };

  const uploadProfilePhoto = async () => {
    if (!profilePhoto || !user) return null;

    setPhotoUploading(true);
    try {
      const photoRef = ref(storage, `professionals/${user.uid}/profile.jpg`);
      await uploadBytes(photoRef, profilePhoto);
      const downloadURL = await getDownloadURL(photoRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Photo upload failed",
        description: "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setPhotoUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a professional profile.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let photoUrl = profilePhotoUrl;

      // Upload new photo if selected
      if (profilePhoto) {
        photoUrl = await uploadProfilePhoto();
        if (!photoUrl) {
          setLoading(false);
          return;
        }
      }

      // Save professional profile to Firestore
      await setDoc(doc(db, 'professionals', user.uid), {
        ...data,
        userId: user.uid,
        email: user.email,
        profilePhotoUrl: photoUrl,
        rating: 5.0,
        reviewCount: 0,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update user role to professional
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'professional',
        profilePhotoUrl: photoUrl,
        createdAt: new Date(),
      }, { merge: true });

      toast({
        title: "Profile created successfully!",
        description: "Your professional profile is now live and visible to homeowners.",
      });

      form.reset();
    } catch (error) {
      console.error('Error creating professional profile:', error);
      toast({
        title: "Error",
        description: "Failed to create professional profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Contractor Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white hover:bg-blue-700"
                disabled={photoUploading}
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <p className="text-sm text-gray-600">Upload your profile photo</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Construction LLC" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialties</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select primary specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="General Contractor">General Contractor</SelectItem>
                          <SelectItem value="Kitchen & Bath">Kitchen & Bath</SelectItem>
                          <SelectItem value="Roofing">Roofing</SelectItem>
                          <SelectItem value="Flooring">Flooring</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                          <SelectItem value="HVAC">HVAC</SelectItem>
                          <SelectItem value="Painting">Painting</SelectItem>
                          <SelectItem value="Landscaping">Landscaping</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell homeowners about your business, experience, and what sets you apart..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-2 years">1-2 years</SelectItem>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="6-10 years">6-10 years</SelectItem>
                          <SelectItem value="11-20 years">11-20 years</SelectItem>
                          <SelectItem value="20+ years">20+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Area</FormLabel>
                      <FormControl>
                        <Input placeholder="City, State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://yourwebsite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="License #123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading || photoUploading}
              >
                {loading ? "Creating Profile..." : "Create Contractor Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}