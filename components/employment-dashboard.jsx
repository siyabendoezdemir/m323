"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
  "hsl(var(--chart-8))",
];

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
  },
};

export default function EmploymentDashboard() {
  const [data, setData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("0");
  const [selectedSector, setSelectedSector] = useState("TOT");

  useEffect(() => {
    fetch("/api/employment-data")
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData));
  }, []);

  if (!data) return <div>Loading...</div>;

  const regions = data.dataset.dimension.Grossregion.category;
  const sectors = data.dataset.dimension.Wirtschaftssektor.category;
  const quarters = data.dataset.dimension.Quartal.category;

  const getGenderDistribution = (regionId, sectorId) => {
    const baseIndex = regions.index[regionId] * sectors.index[sectorId] * 3;
    const maleIndex =
      baseIndex + data.dataset.dimension.Geschlecht.category.index["1"];
    const femaleIndex =
      baseIndex + data.dataset.dimension.Geschlecht.category.index["2"];

    return {
      male: data.dataset.value[maleIndex] || 0,
      female: data.dataset.value[femaleIndex] || 0,
    };
  };

  const getGenderTrend = () => {
    const trend = [];
    const quarterLabels = Object.keys(quarters.label);

    quarterLabels.forEach((quarter, idx) => {
      const baseIndex =
        idx * regions.index[selectedRegion] * sectors.index[selectedSector] * 3;
      const maleValue =
        data.dataset.value[
          baseIndex + data.dataset.dimension.Geschlecht.category.index["1"]
        ] || 0;
      const femaleValue =
        data.dataset.value[
          baseIndex + data.dataset.dimension.Geschlecht.category.index["2"]
        ] || 0;
      const total = maleValue + femaleValue;

      trend.push({
        quarter,
        male: maleValue,
        female: femaleValue,
        malePercentage: ((maleValue / total) * 100).toFixed(1),
        femalePercentage: ((femaleValue / total) * 100).toFixed(1),
      });
    });

    return trend;
  };

  const getSectorComparison = () => {
    return Object.entries(sectors.label)
      .filter(([sectorId]) => sectorId !== "TOT")
      .map(([sectorId, sectorLabel]) => {
        const { male, female } = getGenderDistribution(
          selectedRegion,
          sectorId
        );
        const total = male + female;

        return {
          sector: sectorLabel,
          malePercentage: ((male / total) * 100).toFixed(1),
          femalePercentage: ((female / total) * 100).toFixed(1),
          total,
        };
      });
  };

  const genderDistributionData = getGenderDistribution(
    selectedRegion,
    selectedSector
  );
  const genderTrendData = getGenderTrend();
  const sectorComparisonData = getSectorComparison();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-8">
      <div className="flex gap-4 mb-6">
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Region wählen" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(regions.label).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sektor wählen" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sectors.label).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
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
              <CardDescription>
                Aktuelle Verteilung nach Geschlecht für die gewählte Region und
                Sektor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Männer", value: genderDistributionData.male },
                        {
                          name: "Frauen",
                          value: genderDistributionData.female,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                    >
                      <Cell fill={colors[0]} />
                      <Cell fill={colors[1]} />
                    </Pie>
                    <ChartTooltip />
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
                  <TableRow>
                    <TableCell>Männer</TableCell>
                    <TableCell>{genderDistributionData.male}</TableCell>
                    <TableCell>
                      {(
                        (genderDistributionData.male /
                          (genderDistributionData.male +
                            genderDistributionData.female)) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Frauen</TableCell>
                    <TableCell>{genderDistributionData.female}</TableCell>
                    <TableCell>
                      {(
                        (genderDistributionData.female /
                          (genderDistributionData.male +
                            genderDistributionData.female)) *
                        100
                      ).toFixed(1)}
                      %
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Entwicklung über Zeit</CardTitle>
              <CardDescription>
                Trend der Geschlechterverteilung über die Quartale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={genderTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <ChartTooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="malePercentage"
                      name="Männer %"
                      stroke={colors[0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="femalePercentage"
                      name="Frauen %"
                      stroke={colors[1]}
                    />
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
                  {genderTrendData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.quarter}</TableCell>
                      <TableCell>{item.malePercentage}%</TableCell>
                      <TableCell>{item.femalePercentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Sektorvergleich</CardTitle>
              <CardDescription>
                Geschlechterverteilung nach Wirtschaftssektoren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="sector" type="category" width={120} />
                    <ChartTooltip />
                    <Legend />
                    <Bar
                      dataKey="malePercentage"
                      name="Männer %"
                      fill={colors[0]}
                      stackId="a"
                    />
                    <Bar
                      dataKey="femalePercentage"
                      name="Frauen %"
                      fill={colors[1]}
                      stackId="a"
                    />
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
                  {sectorComparisonData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.sector}</TableCell>
                      <TableCell>{item.malePercentage}%</TableCell>
                      <TableCell>{item.femalePercentage}%</TableCell>
                      <TableCell>{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
