import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { activities, calculateDailyCalories, calculateExerciseTime } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Activity, Clock, Flame, Target, Check } from 'lucide-react';

const Activities: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState<number>(0);
  const [exercisePlan, setExercisePlan] = useState<any[]>([]);

  useEffect(() => {
    if (user?.age && user?.height && user?.weight && user?.goal) {
      const calories = calculateDailyCalories(
        user.age,
        user.height,
        user.weight,
        user.goal
      );
      setDailyCalorieTarget(calories);
    }
  }, [user]);

  useEffect(() => {
    if (selectedActivities.length > 0 && dailyCalorieTarget > 0) {
      const selectedActivityObjects = activities.filter(activity =>
        selectedActivities.includes(activity.id)
      );
      const plan = calculateExerciseTime(dailyCalorieTarget, selectedActivityObjects);
      setExercisePlan(plan);
    } else {
      setExercisePlan([]);
    }
  }, [selectedActivities, dailyCalorieTarget]);

  const handleActivityToggle = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const savePlan = () => {
    if (exercisePlan.length === 0) {
      toast({
        title: 'No activities selected',
        description: 'Please select at least one activity to create your plan.',
        variant: 'destructive',
      });
      return;
    }

    // In real app, this would save to backend
    localStorage.setItem('exercisePlan', JSON.stringify(exercisePlan));
    toast({
      title: 'Plan saved!',
      description: 'Your exercise plan has been saved successfully.',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cardio':
        return 'bg-primary text-primary-foreground';
      case 'Strength':
        return 'bg-secondary text-secondary-foreground';
      case 'Flexibility':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!user?.age || !user?.height || !user?.weight || !user?.goal) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Activity Planner
        </h1>
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              Please complete your profile first to use the activity planner.
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
          Activity Planner
        </h1>
        <p className="text-muted-foreground">
          Select activities to reach your daily calorie target of <span className="font-semibold text-primary">{dailyCalorieTarget}</span> calories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Available Activities</span>
              </CardTitle>
              <CardDescription>
                Choose activities you enjoy to create your personalized workout plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activities.map(activity => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                      selectedActivities.includes(activity.id)
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:shadow-sm'
                    }`}
                    onClick={() => handleActivityToggle(activity.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={selectedActivities.includes(activity.id)}
                        onChange={() => handleActivityToggle(activity.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{activity.name}</h3>
                          {selectedActivities.includes(activity.id) && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge className={getCategoryColor(activity.category)}>
                            {activity.category}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Flame className="h-3 w-3" />
                            <span>{activity.caloriesPerHour} cal/hr</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="shadow-lg bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Your Plan</span>
              </CardTitle>
              <CardDescription>
                Estimated time needed for each activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exercisePlan.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Select activities to see your personalized plan
                </p>
              ) : (
                <div className="space-y-4">
                  {exercisePlan.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg bg-background/50 border">
                      <h4 className="font-medium text-sm">{item.activity.name}</h4>
                      <div className="flex items-center justify-between mt-2 text-sm">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{item.timeMinutes} min</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Flame className="h-3 w-3" />
                          <span>{item.calories} cal</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Total Time:</span>
                      <span className="text-primary">
                        {exercisePlan.reduce((total, item) => total + item.timeMinutes, 0)} min
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium mt-1">
                      <span>Total Calories:</span>
                      <span className="text-primary">
                        {exercisePlan.reduce((total, item) => total + item.calories, 0)} cal
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={savePlan}
                  >
                    Save This Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Activities;