"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export const AttendanceCard = ({
  overallProgress,
  subjectsAttendance,
  studentid
}: {
  overallProgress: number
  subjectsAttendance: { subject: string; attendanceStatus: string; sessionDate: string; startTime: string; endTime: string }[]
  studentid: number
}) => (
  <Card className="bg-white border-gray-200 shadow-lg rounded-lg col-span-1 lg:col-span-2">
    <CardHeader className="border-b pb-4">
      <CardTitle className="font-heading text-lg text-gray-800">Aperçu de la présence</CardTitle>
      <CardDescription className="text-gray-600 font-body">Derniers enregistrements de présence</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Barre de progression de la présence globale */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 font-medium">Présence globale</span>
            <span className="font-semibold text-gray-800">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-gray-200 rounded-full" />
          <div className="h-full bg-gradient-to-r from-cyan-600 to-pink-600 rounded-full" style={{ width: `${overallProgress}%` }} />
          <p className="text-xs text-gray-500 mt-2 text-center">5 derniers enregistrements de présence</p>
          {subjectsAttendance.length === 0 && (
            <p className="text-sm text-gray-500 text-center p-3 border border-gray-300 rounded-lg mt-4">
              Aucun enregistrement de présence trouvé pour l'ID étudiant {studentid}
            </p>
          )}
        </div>

        {/* Section des enregistrements de présence */}
        {subjectsAttendance.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {subjectsAttendance.map((attendance, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg border shadow-md transition duration-300 transform hover:scale-105 flex flex-col justify-between ${
                  attendance.attendanceStatus === "Justifié"
                    ? "bg-green-50 border-green-400"
                    : "bg-red-50 border-red-400"
                }`}
              >
                <div className="mb-3">
                  <p className="text-base font-semibold text-gray-800">{attendance.subject}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">Statut</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-md ${
                        attendance.attendanceStatus === "Justifié"
                          ? "text-green-800 bg-green-200"
                          : "text-red-800 bg-red-200"
                      }`}
                    >
                      {attendance.attendanceStatus}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Date de la session</span>
                    <span className="text-xs font-medium">{attendance.sessionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Heure</span>
                    <span className="text-xs font-medium">{attendance.startTime} - {attendance.endTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)