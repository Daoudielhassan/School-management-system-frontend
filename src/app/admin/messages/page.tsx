'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Gestion des messages système</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages système
          </CardTitle>
          <CardDescription>
            Gestion des notifications et messages du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Fonctionnalité de gestion des messages à implémenter...
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 