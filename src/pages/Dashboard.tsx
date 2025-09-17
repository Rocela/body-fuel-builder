import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBMI, calculateDailyCalories } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Scale, 
  Flame, 
  Activity, 
  TrendingUp, 
  Calendar,
  Clock,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentBMI, setCurrentBMI] = useState<number | null>(null);
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);
  const [exercisePlan, setExercisePlan] = useState<any[]>([]);

  useEffect(() => {
    if (user?.height && user?.weight) {
      const bmi = calculateBMI(user.height, user.weight);
      setCurrentBMI(bmi);
    }
  }, [user]);

  useEffect(() => {
    if (user?.age && user?.height && user?.weight && user?.goal) {
      const calories = calculateDailyCalories(
        user.age,
        user.height,
        user.weight,
        user.goal
      );
      setDailyCalories(calories);
    }
  }, [user]);

  useEffect(() => {
    // Load saved exercise plan
    const savedPlan = localStorage.getItem('exercisePlan');
    if (savedPlan) {
      setExercisePlan(JSON.parse(savedPlan));
    }
  }, []);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-warning text-warning-foreground' };
    if (bmi < 25) return { category: 'Normal weight', color: 'bg-success text-success-foreground' };
    if (bmi < 30) return { category: 'Overweight', color: 'bg-warning text-warning-foreground' };
    return { category: 'Obese', color: 'bg-destructive text-destructive-foreground' };
  };

  const getGoalInfo = (goal: string) => {
    switch (goal) {
      case 'loss':
        return { title: 'Weight Loss', icon: TrendingUp, color: 'text-primary' };
      case 'gain':
        return { title: 'Weight Gain', icon: TrendingUp, color: 'text-secondary' };
      default:
        return { title: 'Weight Maintenance', icon: Target, color: 'text-success' };
    }
  };

  const totalExerciseTime = exercisePlan.reduce((total, item) => total + item.timeMinutes, 0);
  const totalCaloriesBurn = exercisePlan.reduce((total, item) => total + item.calories, 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Welcome to FitnessPro</h2>
          <p className="text-muted-foreground">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's your fitness overview for today
        </p>
      </div>

      {(!user.age || !user.height || !user.weight || !user.goal) && (
        <Card className="border-warning bg-warning/5 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning/20 rounded-full">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Add your personal information to get personalized fitness recommendations
                </p>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentBMI && (
          <Card className="shadow-lg bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Scale className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">BMI Status</span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">
                {currentBMI.toFixed(1)}
              </div>
              <Badge className={getBMICategory(currentBMI).color}>
                {getBMICategory(currentBMI).category}
              </Badge>
            </CardContent>
          </Card>
        )}

        {user.goal && (
          <Card className="shadow-lg bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                {React.createElement(getGoalInfo(user.goal).icon, {
                  className: `h-4 w-4 ${getGoalInfo(user.goal).color}`
                })}
                <span className="text-sm font-medium">Current Goal</span>
              </div>
              <div className="text-lg font-bold text-primary">
                {getGoalInfo(user.goal).title}
              </div>
            </CardContent>
          </Card>
        )}

        {dailyCalories && (
          <Card className="shadow-lg bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Daily Target</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {dailyCalories}
              </div>
              <div className="text-sm text-muted-foreground">calories</div>
            </CardContent>
          </Card>
        )}

        {exercisePlan.length > 0 && (
          <Card className="shadow-lg bg-gradient-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Activities</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {exercisePlan.length}
              </div>
              <div className="text-sm text-muted-foreground">planned</div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {exercisePlan.length > 0 ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Today's Workout Plan</span>
              </CardTitle>
              <CardDescription>
                Your personalized exercise schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercisePlan.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <h4 className="font-medium">{item.activity.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.timeMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Flame className="h-3 w-3" />
                          <span>{item.calories} cal</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Start
                    </Button>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <div className="text-lg font-bold text-primary">{totalExerciseTime} min</div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </div>
                    <div className="p-3 rounded-lg bg-success/10">
                      <div className="text-lg font-bold text-success">{totalCaloriesBurn} cal</div>
                      <div className="text-xs text-muted-foreground">Total Burn</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>No Workout Plan</span>
              </CardTitle>
              <CardDescription>
                Create your personalized exercise plan
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven't created a workout plan yet. Start by selecting your favorite activities.
              </p>
              <Button variant="gradient" onClick={() => window.location.href = '/activities'}>
                Create Workout Plan
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>
              Manage your fitness journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/profile'}
              >
                <Target className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/goals'}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Set New Goal
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/activities'}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Plan Activities
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;