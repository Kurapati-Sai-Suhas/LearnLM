import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { BarChart3, TrendingUp } from "lucide-react";
import api from "@/services/api";

export default function AITutor() {
  const [data, setData] = useState({
    univariate: [],
    bivariate: []
  });

  useEffect(() => {
    api.get("/analytics/charts/")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Analytics failed", err));
  }, []);

  return (
    <div className="space-y-8 p-8 animate-in fade-in max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          Performance Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
           Data-driven insights into your learning patterns.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* CHART 1: UNIVARIATE (Histogram) */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <BarChart3 className="h-5 w-5 text-blue-500"/>
               Score Distribution (Univariate)
            </CardTitle>
            <p className="text-sm text-muted-foreground">How consistent are your quiz results?</p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.univariate}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Number of Quizzes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CHART 2: BIVARIATE (Scatter / Correlation) */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-green-500"/>
               Effort vs. Impact (Bivariate)
            </CardTitle>
            <p className="text-sm text-muted-foreground">Does studying more lead to higher scores?</p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="hours_studied" name="Hours Studied" unit="h" />
                <YAxis type="number" dataKey="average_score" name="Avg Score" unit=" pts" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter name="Subjects" data={data.bivariate} fill="#22c55e">
                    {/* Add label for each dot */}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}