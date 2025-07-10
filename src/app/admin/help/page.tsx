'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function AdminHelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aide</h1>
        <p className="text-gray-600">Support et documentation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Centre d'aide
          </CardTitle>
          <CardDescription>
            Documentation et support pour l'utilisation du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Documentation et guides d'utilisation à implémenter...
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 