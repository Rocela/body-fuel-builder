import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, calculateBMI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Scale, Ruler, Calendar, Target } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    age: user?.age || '',
    height: user?.height || '', // cm
    weight: user?.weight || '', // kg
    goal: user?.goal || '',
  });

  const [bmi, setBmi] = useState<number | null>(null);

  useEffect(() => {
    if (formData.height && formData.weight) {
      const calculatedBMI = calculateBMI(Number(formData.height), Number(formData.weight));
      setBmi(calculatedBMI);
    } else {
      setBmi(null);
    }
  }, [formData.height, formData.weight]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-warning' };
    if (bmi < 25) return { category: 'Normal weight', color: 'text-success' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-warning' };
    return { category: 'Obese', color: 'text-destructive' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.age || !formData.height || !formData.weight || !formData.goal) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await updateUserProfile({
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        goal: formData.goal as 'loss' | 'maintenance' | 'gain',
      });
      
      updateUser(updatedUser);
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-muted-foreground">
          Tell us about yourself to get personalized fitness recommendations
        </p>
      </div>

      <Card className="shadow-lg border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>
            Your basic information helps us calculate your fitness metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Age (years)</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  min="13"
                  max="120"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center space-x-2">
                  <Ruler className="h-4 w-4" />
                  <span>Height (cm)</span>
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={formData.height}
                  onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  min="100"
                  max="250"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center space-x-2">
                  <Scale className="h-4 w-4" />
                  <span>Weight (kg)</span>
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  min="30"
                  max="300"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Fitness Goal</span>
                </Label>
                <Select value={formData.goal} onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loss">Weight Loss</SelectItem>
                    <SelectItem value="maintenance">Weight Maintenance</SelectItem>
                    <SelectItem value="gain">Weight Gain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {bmi && (
              <Card className="bg-muted/50 border-0">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Your BMI</h3>
                    <div className="text-3xl font-bold text-primary">
                      {bmi.toFixed(1)}
                    </div>
                    <div className={`text-sm font-medium ${getBMICategory(bmi).color}`}>
                      {getBMICategory(bmi).category}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;