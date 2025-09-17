import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateBMI, calculateDailyCalories } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingDown, TrendingUp, Minus, Scale, Flame, Activity } from 'lucide-react';

const Goals: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [currentBMI, setCurrentBMI] = useState<number | null>(null);
  const [dailyCalories, setDailyCalories] = useState<number | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<'loss' | 'maintenance' | 'gain' | null>(null);

  useEffect(() => {
    if (user?.height && user?.weight) {
      const bmi = calculateBMI(user.height, user.weight);
      setCurrentBMI(bmi);
    }
    setSelectedGoal(user?.goal || null);
  }, [user]);

  useEffect(() => {
    if (user?.age && user?.height && user?.weight && selectedGoal) {
      const calories = calculateDailyCalories(
        user.age,
        user.height,
        user.weight,
        selectedGoal
      );
      setDailyCalories(calories);
    }
  }, [user, selectedGoal]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'bg-warning text-warning-foreground', progress: 25 };
    if (bmi < 25) return { category: 'Normal weight', color: 'bg-success text-success-foreground', progress: 75 };
    if (bmi < 30) return { category: 'Overweight', color: 'bg-warning text-warning-foreground', progress: 50 };
    return { category: 'Obese', color: 'bg-destructive text-destructive-foreground', progress: 25 };
  };

  const goals = [
    {
      id: 'loss',
      title: 'Weight Loss',
      description: 'Burn more calories than you consume',
      icon: TrendingDown,
      color: 'border-primary bg-primary/5 hover:bg-primary/10',
      iconColor: 'text-primary',
      benefits: ['Reduce body fat', 'Improve cardiovascular health', 'Increase energy levels'],
    },
    {
      id: 'maintenance',
      title: 'Weight Maintenance',
      description: 'Maintain your current weight',
      icon: Minus,
      color: 'border-success bg-success/5 hover:bg-success/10',
      iconColor: 'text-success',
      benefits: ['Maintain current fitness', 'Stabilize metabolism', 'Focus on strength'],
    },
    {
      id: 'gain',
      title: 'Weight Gain',
      description: 'Build muscle and increase body mass',
      icon: TrendingUp,
      color: 'border-secondary bg-secondary/5 hover:bg-secondary/10',
      iconColor: 'text-secondary',
      benefits: ['Build lean muscle', 'Increase strength', 'Improve body composition'],
    },
  ];

  const handleGoalSelect = async (goalId: 'loss' | 'maintenance' | 'gain') => {
    setSelectedGoal(goalId);
    
    if (user) {
      const updatedUser = { ...user, goal: goalId };
      updateUser(updatedUser);
    }
  };

  if (!user?.age || !user?.height || !user?.weight) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Set Your Goals
        </h1>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              Please complete your profile first to set your fitness goals.
            </p>
            <Button variant="gradient" onClick={() => window.location.href = '/profile'}>
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Your Fitness Goals
        </h1>
        <p className="text-muted-foreground">
          Choose your goal to get personalized recommendations and calorie targets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-primary" />
                <span>Current Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{user.weight} kg</div>
                  <div className="text-sm text-muted-foreground">Current Weight</div>
                </div>
                
                {currentBMI && (
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{currentBMI.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">BMI</div>
                    <Badge className={`mt-2 ${getBMICategory(currentBMI).color}`}>
                      {getBMICategory(currentBMI).category}
                    </Badge>
                  </div>
                )}
                
                {dailyCalories && (
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{dailyCalories}</div>
                    <div className="text-sm text-muted-foreground">Daily Calories</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Choose Your Goal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;
                
                return (
                  <Card
                    key={goal.id}
                    className={`cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg ${
                      isSelected 
                        ? `${goal.color} border-2 shadow-lg transform scale-105` 
                        : 'border hover:border-primary/50'
                    }`}
                    onClick={() => handleGoalSelect(goal.id as 'loss' | 'maintenance' | 'gain')}
                  >
                    <CardHeader className="text-center">
                      <div className={`w-12 h-12 rounded-full ${goal.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className={`h-6 w-6 ${goal.iconColor}`} />
                      </div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {goal.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {goal.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {currentBMI && (
            <Card className="shadow-lg bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Health Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">BMI Status</span>
                    <span className="text-sm text-muted-foreground">{currentBMI.toFixed(1)}</span>
                  </div>
                  <Progress value={getBMICategory(currentBMI).progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Healthy range: 18.5 - 24.9
                  </p>
                </div>

                {selectedGoal && dailyCalories && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center space-x-2 mb-3">
                      <Flame className="h-4 w-4 text-primary" />
                      <span className="font-medium">Daily Target</span>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/50">
                      <div className="text-2xl font-bold text-primary">{dailyCalories}</div>
                      <div className="text-sm text-muted-foreground">calories per day</div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => window.location.href = '/activities'}
                    disabled={!selectedGoal}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Plan Activities
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Goals;