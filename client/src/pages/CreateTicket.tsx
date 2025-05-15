import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertTicketSchema, InsertTicket } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CreateTicket() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<InsertTicket>({
    resolver: zodResolver(insertTicketSchema),
    defaultValues: {
      facilityType: undefined,
      facilityName: "",
      location: "",
      priority: undefined,
      description: "",
      createdBy: 1, // Default user ID, would be replaced with actual user session ID
    },
  });
  
  const createTicketMutation = useMutation({
    mutationFn: async (data: InsertTicket) => {
      const response = await apiRequest("POST", "/api/tickets", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tiket berhasil dibuat",
        description: "Tiket telah berhasil ditambahkan ke sistem",
      });
      navigate("/tickets");
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat tiket",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: InsertTicket) => {
    createTicketMutation.mutate(data);
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-medium">Buat Tiket Baru</h3>
      </div>
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="facilityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Fasilitas</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jenis Fasilitas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electrical">Elektrikal</SelectItem>
                        <SelectItem value="plumbing">Pipa/Plumbing</SelectItem>
                        <SelectItem value="ac">AC/Pendingin</SelectItem>
                        <SelectItem value="furniture">Furnitur</SelectItem>
                        <SelectItem value="it">Perangkat IT</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="facilityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Fasilitas</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: AC Ruang Rapat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Lantai 2, Ruang Rapat Utama" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Prioritas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Rendah</SelectItem>
                        <SelectItem value="medium">Sedang</SelectItem>
                        <SelectItem value="high">Tinggi</SelectItem>
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
                <FormItem className="mb-4">
                  <FormLabel>Deskripsi Masalah</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Jelaskan detail masalah yang dialami..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mb-4">
              <FormLabel>Lampiran (Opsional)</FormLabel>
              <div className="border border-dashed border-neutral-200 rounded-lg p-4 text-center">
                <span className="material-icons text-neutral-300 mb-2">file_upload</span>
                <p className="text-sm text-neutral-400 mb-1">Tarik file ke sini atau</p>
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-sm text-primary font-medium p-0 m-0 h-auto"
                >
                  Pilih File
                </Button>
                <p className="text-xs text-neutral-300 mt-1">Format: JPG, PNG, PDF (Maks. 5 MB)</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/tickets")}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? "Membuat..." : "Buat Tiket"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
