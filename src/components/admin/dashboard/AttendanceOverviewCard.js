import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

const AttendanceOverviewCard = () => {
  return (
    <Card className="bg-[#1E2D3D] border-[#2A3747] shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-white">Attendance Overview</CardTitle>
        </div>
        <CardDescription className="text-gray-400">Recent attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { name: "Morning Session", attendees: "145/150", percentage: "97%", time: "Today, 8:30 AM" },
            { name: "Afternoon Workshop", attendees: "78/85", percentage: "92%", time: "Today, 1:45 PM" },
            { name: "Evening Lecture", attendees: "112/120", percentage: "93%", time: "Yesterday, 6:00 PM" },
            { name: "Lab Session", attendees: "45/50", percentage: "90%", time: "Mar 15, 10:30 AM" },
          ].map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-[#2A3747] hover:bg-[#3A4757] transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-[#3A4757] p-2 rounded-md">
                  <Users className="h-5 w-5 text-[#00D4FF]" />
                </div>
                <div>
                  <p className="font-medium text-white">{session.name}</p>
                  <p className="text-xs text-gray-400">{session.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{session.attendees}</p>
                <p className="text-xs text-green-400">{session.percentage}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceOverviewCard;