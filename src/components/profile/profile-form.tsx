"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, MapPin, Phone, Mail, Tag, Eye } from "lucide-react";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { updateProfileAction } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { id: string; name: string };

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ProfileForm({
  categories,
  defaultValues,
}: {
  categories: Category[];
  defaultValues: ProfileInput;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = (data: ProfileInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfileAction(data);
      if (result?.error) {
        setServerError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Perfil salvo.");
        reset(data);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4" />
            Sobre você / seu negócio
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="businessName">Nome do negócio (opcional)</Label>
            <Input id="businessName" {...register("businessName")} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição dos serviços</Label>
            <Textarea
              id="description"
              rows={5}
              placeholder="Conte à comunidade o que você oferece, sua experiência e como pode ajudar."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address" className="flex items-center gap-1.5">
              <MapPin className="size-3.5" />
              Endereço (opcional, se atender em local fixo)
            </Label>
            <Input id="address" {...register("address")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="size-4" />
            Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="categoryIds"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {categories.map((category) => {
                  const checked = field.value.includes(category.id);
                  return (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          if (next) {
                            field.onChange([...field.value, category.id]);
                          } else {
                            field.onChange(
                              field.value.filter((id) => id !== category.id)
                            );
                          }
                        }}
                      />
                      {category.name}
                    </label>
                  );
                })}
              </div>
            )}
          />
          {errors.categoryIds && (
            <p className="text-sm text-destructive mt-2">{errors.categoryIds.message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="size-4" />
            Contato (visível só para membros logados)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsapp">WhatsApp / telefone</Label>
            <Controller
              name="whatsapp"
              control={control}
              render={({ field }) => (
                <Input
                  id="whatsapp"
                  placeholder="(11) 99999-9999"
                  value={field.value}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="publicEmail" className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              E-mail de contato (opcional, se diferente do login)
            </Label>
            <Input id="publicEmail" type="email" {...register("publicEmail")} />
            {errors.publicEmail && (
              <p className="text-sm text-destructive">{errors.publicEmail.message}</p>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Confira os dados de contato antes de salvar — é por eles que outros membros vão falar com você.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="size-4" />
            Visibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="isPublished"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(next) => field.onChange(Boolean(next))}
                />
                Publicar meu perfil no diretório da comunidade
              </label>
            )}
          />
        </CardContent>
      </Card>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div>
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>
    </form>
  );
}
