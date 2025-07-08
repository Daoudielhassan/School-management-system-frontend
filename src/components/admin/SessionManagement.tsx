'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Schedule from '@/components/shared/schedule';

// Define interfaces for the data
interface Department {
    id: number;
    name: string;
}

interface Classe {
    id: number;
    name: string;
    departmentId: number;
}

const SessionManagement = () => {
    const { token } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [loading, setLoading] = useState({
        departments: false,
        classes: false,
    });
    const [error, setError] = useState<string | null>(null);

    // Fetch departments
    useEffect(() => {
        const fetchDepartments = async () => {
            if (!token) return;
            setLoading(prev => ({ ...prev, departments: true }));
            try {
                const response = await fetch('http://localhost:8080/api/departments', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch departments');
                const data = await response.json();
                setDepartments(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(prev => ({ ...prev, departments: false }));
            }
        };
        fetchDepartments();
    }, [token]);

    // Fetch classes when department changes
    useEffect(() => {
        const fetchClasses = async () => {
            if (!selectedDepartment || !token) {
                setClasses([]);
                setSelectedClass('');
                return;
            }
            setLoading(prev => ({ ...prev, classes: true }));
            try {
                const response = await fetch(`http://localhost:8080/api/classes/department/${selectedDepartment}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch classes');
                const data = await response.json();
                setClasses(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(prev => ({ ...prev, classes: false }));
            }
        };
        fetchClasses();
    }, [selectedDepartment, token]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtres</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Department Filter */}
                        <div>
                            <label
                                htmlFor="department-select"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Département
                            </label>
                            <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                                <SelectTrigger id="department-select" className="w-full">
                                    <SelectValue placeholder="Sélectionner un département" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-md">
                                    {loading.departments ? (
                                        <div className="flex justify-center p-2">
                                            <Loader2 className="animate-spin" />
                                        </div>
                                    ) : (
                                        departments.map((dep) => (
                                            <SelectItem key={dep.id} value={dep.id.toString()}>
                                                {dep.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>

                            </Select>
                        </div>

                        {/* Class Filter */}
                        <div>
                            <label
                                htmlFor="class-select"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                                Classe
                            </label>
                            <Select
                                onValueChange={setSelectedClass}
                                value={selectedClass}
                                disabled={!selectedDepartment || loading.classes}
                            >
                                <SelectTrigger id="class-select" className="w-full">
                                    <SelectValue placeholder="Sélectionner une classe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loading.classes ? (
                                        <div className="flex justify-center p-2">
                                            <Loader2 className="animate-spin" />
                                        </div>
                                    ) : classes.length > 0 ? (
                                        classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id.toString()}>
                                                {cls.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <p className="p-2 text-sm text-gray-500">Aucune classe trouvée</p>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <p className="text-red-500 p-4 bg-red-100 dark:bg-red-900/20 rounded-md">
                    {error}
                </p>
            )}

            {/* Schedule or Prompt */}
            {selectedDepartment && selectedClass ? (
                <Schedule departmentId={selectedDepartment} classeId={selectedClass} />
            ) : (
                <Card className="text-center p-8">
                    <p className="text-gray-600 dark:text-gray-300">
                        Veuillez sélectionner un département et une classe pour afficher l’emploi du temps.
                    </p>
                </Card>
            )}
        </div>
    )

};

export default SessionManagement;
