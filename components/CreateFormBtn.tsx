"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImSpinner2 } from "react-icons/im";
import { BsFileEarmarkPlus } from "react-icons/bs";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CreateFormSchema, CreateFormType } from "../schemas/form";
import { createForm } from "@/lib/form";

export function CreateFormBtn() {
  const form = useForm<CreateFormType>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function onSubmit(values: CreateFormType) {
    try {
      await createForm(values);
      toast.success("Форма успешно создана!");
      form.reset();
    } catch (error) {
    }
  }

  return (
    <div suppressHydrationWarning={true}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="rounded-xl border-2 border-dashed border-primary/20 h-full min-h-64 w-full flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 hover:shadow-lg transition-all group"
          >
            <BsFileEarmarkPlus className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
            <p className="text-lg font-semibold text-muted-foreground group-hover:text-primary">
              Создать новую форму
            </p>
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Создать форму</DialogTitle>
            <DialogDescription>
              Создайте новую форму, чтобы начать собирать ответы
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название *</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: Опрос удовлетворённости" {...field} />
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
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Необязательно. Краткое описание формы..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <ImSpinner2 className="mr-2 h-4 w-4 animate-spin" />
                      Создаём...
                    </>
                  ) : (
                    "Создать форму"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}