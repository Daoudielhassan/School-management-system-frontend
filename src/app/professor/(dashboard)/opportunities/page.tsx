"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Briefcase, Calendar, MapPin, DollarSign, Edit, Trash2, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

interface JobOpportunity {
  id: string
  title: string
  company: string
  job_type: "stage" | "emploi" | "alternance"
  description: string
  requirements: string
  location: string
  salary_range: string
  deadline: string
  is_active: boolean
}

export default function OpportunitiesPage() {
  const { userId, token } = useAuth()
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (userId && token) {
      loadOpportunities()
    }
  }, [userId, token])

  const loadOpportunities = async () => {
    if (!userId || !token) return

    try {
      const response = await axios.get(`http://localhost:8080/api/instructors/${userId}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOpportunities(response.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des opportunités:", error)
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOpportunity = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId || !token) return

    const formData = new FormData(event.currentTarget)

    try {
      await axios.post(`http://localhost:8080/api/instructors/${userId}/opportunities`, {
        title: formData.get("title") as string,
        company: formData.get("company") as string,
        job_type: formData.get("job_type") as "stage" | "emploi" | "alternance",
        description: formData.get("description") as string,
        requirements: formData.get("requirements") as string,
        location: formData.get("location") as string,
        salary_range: formData.get("salary_range") as string,
        deadline: formData.get("deadline") as string,
        is_active: true,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsDialogOpen(false)
      loadOpportunities()
    } catch (error) {
      console.error("Erreur lors de la création de l'opportunité:", error)
    }
  }

  const handleDelete = async (opportunityId: string) => {
    if (!userId || !token) return

    try {
      await axios.delete(`http://localhost:8080/api/instructors/${userId}/opportunities/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadOpportunities()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    }
  }

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "stage":
        return "secondary"
      case "emploi":
        return "default"
      case "alternance":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "stage":
        return "Stage"
      case "emploi":
        return "Emploi"
      case "alternance":
        return "Alternance"
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Opportunités de carrière</h1>
          <p className="text-gray-600">Publiez des offres de stages et d'emplois pour vos étudiants</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Publier une offre
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Publier une nouvelle offre</DialogTitle>
              <DialogDescription>Ajoutez une offre de stage ou d'emploi pour vos étudiants</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOpportunity} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre du poste</Label>
                  <Input id="title" name="title" placeholder="Ex: Développeur Web Junior" required />
                </div>
                <div>
                  <Label htmlFor="company">Entreprise</Label>
                  <Input id="company" name="company" placeholder="Nom de l'entreprise" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="job_type">Type</Label>
                  <Select name="job_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage">Stage</SelectItem>
                      <SelectItem value="emploi">Emploi</SelectItem>
                      <SelectItem value="alternance">Alternance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="deadline">Date limite</Label>
                  <Input id="deadline" name="deadline" type="date" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input id="location" name="location" placeholder="Ex: Paris, France" />
                </div>
                <div>
                  <Label htmlFor="salary_range">Rémunération</Label>
                  <Input id="salary_range" name="salary_range" placeholder="Ex: 800-1200€/mois" />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Description du poste..."
                  className="min-h-24"
                />
              </div>
              <div>
                <Label htmlFor="requirements">Prérequis</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Compétences requises..."
                  className="min-h-20"
                />
              </div>
              <Button type="submit" className="w-full">
                Publier l'offre
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{opportunities.length}</div>
                <p className="text-xs text-muted-foreground">Total offres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {opportunities.filter((opp) => new Date(opp.deadline) > new Date()).length}
                </div>
                <p className="text-xs text-muted-foreground">Actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Candidatures</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des opportunités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                  <CardDescription>{opportunity.company}</CardDescription>
                </div>
                <Badge variant={getTypeVariant(opportunity.job_type)}>{getTypeLabel(opportunity.job_type)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 line-clamp-2">{opportunity.description}</p>

              <div className="space-y-2">
                {opportunity.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {opportunity.location}
                  </div>
                )}
                {opportunity.salary_range && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    {opportunity.salary_range}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Échéance: {new Date(opportunity.deadline).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Users className="mr-2 h-4 w-4" />
                  Candidatures (0)
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(opportunity.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {opportunities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune opportunité</h3>
            <p className="text-gray-600 text-center mb-4">
              Vous n'avez pas encore publié d'offres d'emploi ou de stage.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Publier ma première offre
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
