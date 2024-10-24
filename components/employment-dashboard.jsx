"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ChartContainer } from "@/components/ui/chart"
import dataProcessor from './dataProcessor.js'

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
]

const chartConfig = {
  male: {
    label: "Männer",
    color: colors[0],
  },
  female: {
    label: "Frauen",
    color: colors[1],
  },
  total: {
    label: "Total",
    color: colors[2],
  },
  sector2: {
    label: "Sektor 2",
    color: colors[3],
  },
  sector3: {
    label: "Sektor 3",
    color: colors[4],
  }
}

export default function Component() {
  const [selectedRegion, setSelectedRegion] = useState("0")
  const [selectedSector, setSelectedSector] = useState("TOT")
  const [selectedQuarter, setSelectedQuarter] = useState(dataProcessor.getLatestQuarter())

  const regions = dataProcessor.getRegions()
  const sectors = dataProcessor.getSectors()
  const quarters = dataProcessor.getQuarters()

  const genderDistribution = dataProcessor.getGenderDistribution(selectedRegion, selectedSector, selectedQuarter)
  const genderTrend = dataProcessor.getGenderTrend()
  const sectorComparison = dataProcessor.getSectorComparison(selectedRegion)

  return (
      <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
        <div className="flex gap-4 mb-6">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Region wählen" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sektor wählen" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sector.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Quartal wählen" />
            </SelectTrigger>
            <SelectContent>
              {quarters.map(quarter => (
                  <SelectItem key={quarter.id} value={quarter.id}>
                    {quarter.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="distribution">
          <TabsList>
            <TabsTrigger value="distribution">Geschlechterverteilung</TabsTrigger>
            <TabsTrigger value="trend">Zeitliche Entwicklung</TabsTrigger>
            <TabsTrigger value="comparison">Sektorvergleich</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <Card>
              <CardHeader>
                <CardTitle>Geschlechterverteilung</CardTitle>
                <CardDescription>Aktuelle Verteilung nach Geschlecht für die gewählte Region, Sektor und Quartal</CardDescription>
              </CardHeader>
              <CardContent>
                {genderDistribution && (
                    <>
                      <ChartContainer config={chartConfig} className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                                data={[
                                  { name: 'Männer', value: genderDistribution.male },
                                  { name: 'Frauen', value: genderDistribution.female }
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            >
                              <Cell fill={colors[0]} />
                              <Cell fill={colors[1]} />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <Table className="mt-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Geschlecht</TableHead>
                            <TableHead>Anzahl</TableHead>
                            <TableHead>Prozent</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {['Männer', 'Frauen'].map((gender) => {
                            const value = genderDistribution[gender.toLowerCase() === 'männer' ? 'male' : 'female']
                            const total = genderDistribution.male + genderDistribution.female
                            const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0'
                            return (
                                <TableRow key={gender}>
                                  <TableCell>{gender}</TableCell>
                                  <TableCell>{value.toLocaleString()}</TableCell>
                                  <TableCell>{percent}%</TableCell>
                                </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trend">
            <Card>
              <CardHeader>
                <CardTitle>Entwicklung über Zeit</CardTitle>
                <CardDescription>Trend der Geschlechterverteilung über die Quartale</CardDescription>
              </CardHeader>
              <CardContent>
                {genderTrend && genderTrend.length > 0 && (
                    <>
                      <ChartContainer config={chartConfig} className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={genderTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="quarter" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="malePercentage" name="Männer %" stroke={colors[0]} />
                            <Line type="monotone" dataKey="femalePercentage" name="Frauen %" stroke={colors[1]} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <Table className="mt-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Quartal</TableHead>
                            <TableHead>Männer %</TableHead>
                            <TableHead>Frauen %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {genderTrend.map((item) => (
                              <TableRow key={item.quarter}>
                                <TableCell>{item.quarter}</TableCell>
                                <TableCell>{item.malePercentage}%</TableCell>
                                <TableCell>{item.femalePercentage}%</TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Sektorvergleich</CardTitle>
                <CardDescription>Geschlechterverteilung nach Wirtschaftssektoren</CardDescription>
              </CardHeader>
              <CardContent>
                {sectorComparison && sectorComparison.length > 0 && (
                    <>
                      <ChartContainer config={chartConfig} className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sectorComparison} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="sector" type="category" width={120} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="malePercentage" name="Männer %" fill={colors[0]} stackId="a" />
                            <Bar dataKey="femalePercentage" name="Frauen %" fill={colors[1]} stackId="a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                      <Table className="mt-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sektor</TableHead>

                            <TableHead>Männer %</TableHead>
                            <TableHead>Frauen %</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sectorComparison.map((item) => (
                              <TableRow key={item.sector}>
                                <TableCell>{item.sector}</TableCell>
                                <TableCell>{item.malePercentage}%</TableCell>
                                <TableCell>{item.femalePercentage}%</TableCell>
                                <TableCell>{item.total.toLocaleString()}</TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}