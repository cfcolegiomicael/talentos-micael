"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { updateProfileAction } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { id: string; name: string };

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
    formState: { errors },
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
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Sobre você / seu negócio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias</CardTitle>
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
          <CardTitle>Contato (visível só para membros logados)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="whatsapp">WhatsApp / telefone</Label>
            <Input id="whatsapp" placeholder="(11) 99999-9999" {...register("whatsapp")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="publicEmail">E-mail de contato (opcional, se diferente do login)</Label>
            <Input id="publicEmail" type="email" {...register("publicEmail")} />
            {errors.publicEmail && (
              <p className="text-sm text-destructive">{errors.publicEmail.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visibilidade</CardTitle>
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>
    </form>
  );
}
