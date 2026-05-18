"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { LoginGate } from "@/components/guards/login-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/services/auth.service";
import { applyAuthResponse } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/http/client";
import { useAuthStore } from "@/stores/auth-store";
import { getHomeByRole } from "@/lib/navigation";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().min(8, "Invalid phone number"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const routeByRole = () => {
    const role = useAuthStore.getState().role ?? "user";
    router.replace(getHomeByRole(role));
  };

  const onLogin = async (values: LoginValues) => {
    try {
      setIsLoginLoading(true);
      const response = await authService.login(values);
      const data = response.data.data;

      if (!data) {
        throw new Error("Login data was not returned");
      }

      await applyAuthResponse(data);
      toast.success(response.data.message);
      routeByRole();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoginLoading(false);
    }
  };

  const onRegister = async (values: RegisterValues) => {
    try {
      setIsRegisterLoading(true);
      const response = await authService.register(values);
      const data = response.data.data;

      if (!data) {
        throw new Error("Registration data was not returned");
      }

      await applyAuthResponse(data);
      toast.success(response.data.message);
      routeByRole();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <LoginGate>
      <div className="flex min-h-screen items-center justify-center bg-muted/25 px-4 py-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Welcome to Stay Saga</CardTitle>
            <CardDescription>
              Sign in or create an account to use the booking platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList>
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="register">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="pt-4">
                <Form {...loginForm}>
                  <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoginLoading}>
                      {isLoginLoading ? "Processing..." : "Sign in"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="pt-4">
                <Form {...registerForm}>
                  <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegister)}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input placeholder="0901234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isRegisterLoading}>
                      {isRegisterLoading ? "Processing..." : "Create account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </LoginGate>
  );
}
