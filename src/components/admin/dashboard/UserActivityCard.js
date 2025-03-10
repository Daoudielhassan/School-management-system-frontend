import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const UserActivityCard = () => {
  return (
    <Card className="bg-[#1E2D3D] border-[#2A3747] shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-white">User  Activity</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1E2D3D] border-[#2A3747] text-white">
              <DropdownMenuItem className="hover:bg-[#2A3747] cursor-pointer">Daily</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#2A3747] cursor-pointer">Weekly</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-[#2A3747] cursor-pointer">Monthly</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-gray-400">Active users over time</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full">
          <ChartContainer
            config={{
              users: {
                label: "Users",
                color: "hsl(191, 100%, 50%)",
              },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: "Mon", users: 2400 },
                  { name: "Tue", users: 1398 },
                  { name: "Wed", users: 9800 },
                  { name: "Thu", users: 3908 },
                  { name: "Fri", users: 4800 },
                  { name: "Sat", users: 3800 },
                  { name: "Sun", users: 4300 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  dot={{ fill: "#00D4FF", r: 4 }}
                  activeDot={{ r: 6, fill: "#00D4FF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActivityCard;