"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Mail, MailOpen, Reply, Forward, Trash2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import axios from "axios"

interface Message {
  id: string
  subject: string
  content: string
  sender_id: string
  sender_type: string
  is_read: boolean
  created_at: string
}

export default function MessagesPage() {
  const { userId, token } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (userId && token) {
      loadMessages()
    }
  }, [userId, token])

  const loadMessages = async () => {
    if (!userId || !token) return

    try {
      const response = await axios.get(`http://localhost:8080/api/instructors/${userId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(response.data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    if (!userId || !token) return

    try {
      await axios.put(`http://localhost:8080/api/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadMessages()
    } catch (error) {
      console.error("Erreur lors du marquage:", error)
    }
  }

  const filteredMessages = messages.filter(
    (message) =>
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const unreadCount = messages.filter((m) => !m.is_read).length

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
          <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
          <p className="text-gray-600">
            {unreadCount > 0 && (
              <span className="text-orange-600 font-medium">
                {unreadCount} message{unreadCount > 1 ? "s" : ""} non lu{unreadCount > 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau message</DialogTitle>
              <DialogDescription>Envoyer un message à un étudiant ou collègue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Destinataire</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un destinataire" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student1">Alice Martin (Étudiant)</SelectItem>
                    <SelectItem value="student2">Bob Dupont (Étudiant)</SelectItem>
                    <SelectItem value="prof1">Prof. Durand (Collègue)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subject">Sujet</Label>
                <Input id="subject" placeholder="Sujet du message" />
              </div>
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea id="content" placeholder="Votre message..." className="min-h-32" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Envoyer</Button>
                <Button variant="outline">Brouillon</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des messages */}
        <div className="lg:col-span-1 space-y-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages reçus</CardTitle>
              <CardDescription>
                {filteredMessages.length} message{filteredMessages.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? "bg-blue-50 border-blue-200" : ""
                    } ${!message.is_read ? "bg-blue-50/50" : ""}`}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (!message.is_read) {
                        handleMarkAsRead(message.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback>{message.sender_type === "student" ? "ET" : "PR"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">Expéditeur #{message.sender_id.slice(0, 8)}</p>
                          {!message.is_read && <Mail className="h-3 w-3 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-900 truncate">{message.subject}</p>
                        <p className="text-xs text-gray-500">{new Date(message.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu du message */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedMessage.subject}</CardTitle>
                    <CardDescription>
                      De: Expéditeur #{selectedMessage.sender_id.slice(0, 8)} •
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Reply className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Forward className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MailOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez un message</h3>
                <p className="text-gray-600 text-center">Choisissez un message dans la liste pour le lire.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
