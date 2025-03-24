'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import React from 'react';
import { CalendarIcon, Camera, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/utils/upload';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { PageLayout } from '@/components/page-layout';
// import { workSans } from "@/lib/fonts";
import { FUND_CARD_PLACEHOLDER_IMAGE } from '@/constants/links';
import { Card, CardContent } from '@/shadcn/components/ui/card';
import { Input } from '@/shadcn/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shadcn/components/ui/form';
import { Button } from '@/shadcn/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/components/ui/popover';
import { Calendar } from '@/shadcn/components/ui/calendar';
import { Textarea } from '@/shadcn/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Name must be at least 3 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  fundraisingGoal: z.string().min(1, {
    message: 'Fundraising goal is required.',
  }),
  fundraisingDeadline: z.date({
    required_error: 'Fundraising deadline is required.',
  }),
});

interface ProfileHeaderProps {
  onImageUpload: (file: File) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onImageUpload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
          onImageUpload(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    multiple: false,
  });

  return (
    <Card className="w-full h-[200px] md:h-[320px] relative mb-20 md:mb-24">
      <div className="w-full h-full bg-[#0d0d0d] flex items-center justify-center">
        {/* You can add a background image or pattern here */}
        {previewUrl ? (
          <Image src={previewUrl || FUND_CARD_PLACEHOLDER_IMAGE} alt="Profile" layout="fill" className="object-cover" />
        ) : (
          <Camera className="w-6 h-6 text-[#aeb3b6]" />
        )}
      </div>
      <div className="absolute left-6 -bottom-[75px] md:left-16 md:-bottom-[75px]">
        <div className="relative" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="cursor-pointer w-[150px] h-[150px] rounded-full border-4 border-background bg-[#0d0d0d] overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Plus size={48} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function UploadPage() {
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      fundraisingGoal: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here you would typically send both the form values and the profile image to your server
    console.log(values, profileImage);
  }

  return (
    <PageLayout title="App" description="main-app" app={true}>
      <div className={`relative min-h-screen w-screen overflow-hidden pt-6 px-4 sm:px-8 md:px-16 lg:px-20 text-left`}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <ProfileHeader onImageUpload={setProfileImage} />
            <Card className="w-full bg-[#0d0d0d]">
              <CardContent className="space-y-6 pt-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project"
                          className="resize-none h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fundraisingGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl">Fundraising goal</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" placeholder="0.00" {...field} className="h-12 pl-16" />
                          <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-muted-foreground font-medium">
                            ETH
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fundraisingDeadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xl">Fundraising deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full md:w-[240px] h-12 pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Select date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90 hover:text-black">
                  Submit
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </PageLayout>
  );
}
