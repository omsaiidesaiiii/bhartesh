import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50/50 px-4 dark:bg-gray-900/50">
      <Card className="w-full max-w-sm border-0 shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
        {footer && <CardFooter className="flex flex-col gap-4">{footer}</CardFooter>}
      </Card>
    </div>
  );
}
