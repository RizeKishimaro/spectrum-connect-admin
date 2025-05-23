"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

const data = [
  {
    name: "Mon",
    inbound: 40,
    outbound: 24,
  },
  {
    name: "Tue",
    inbound: 30,
    outbound: 28,
  },
  {
    name: "Wed",
    inbound: 45,
    outbound: 35,
  },
  {
    name: "Thu",
    inbound: 50,
    outbound: 40,
  },
  {
    name: "Fri",
    inbound: 35,
    outbound: 30,
  },
  {
    name: "Sat",
    inbound: 15,
    outbound: 10,
  },
  {
    name: "Sun",
    inbound: 10,
    outbound: 5,
  },
]

export function CallStatsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="inbound" name="Inbound Calls" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="outbound" name="Outbound Calls" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
