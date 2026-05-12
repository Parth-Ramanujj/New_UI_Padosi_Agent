import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Heart, GraduationCap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

const Calculators = () => {
  // Human Life Value Calculator State
  const [hlvAge, setHlvAge] = useState(0);
  const [hlvRetirementAge, setHlvRetirementAge] = useState(60);
  const [hlvMonthlyIncome, setHlvMonthlyIncome] = useState(0);
  const [hlvAnnualIncome, setHlvAnnualIncome] = useState(0);
  const [hlvInsuranceCover, setHlvInsuranceCover] = useState(0);
  const [hlvLiabilities, setHlvLiabilities] = useState(0);
  const [hlvResult, setHlvResult] = useState<number | null>(null);

  // BMI Calculator State
  const [bmiHeight, setBmiHeight] = useState(0);
  const [bmiWeight, setBmiWeight] = useState(0);
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>(null);

  // Retirement Planning Calculator State
  const [retirementAge, setRetirementAge] = useState(0);
  const [retirementTargetAge, setRetirementTargetAge] = useState(60);
  const [retirementMonthlyExpenses, setRetirementMonthlyExpenses] = useState(0);
  const [retirementResult, setRetirementResult] = useState<number | null>(null);

  // Child Education Calculator State
  const [childAge, setChildAge] = useState(0);
  const [educationAge, setEducationAge] = useState(18);
  const [educationCost, setEducationCost] = useState(0);
  const [educationResult, setEducationResult] = useState<number | null>(null);

  const calculateHLV = () => {
    const yearsToRetirement = hlvRetirementAge - hlvAge;
    const totalIncome = (hlvMonthlyIncome * 12 + hlvAnnualIncome) * yearsToRetirement;
    const hlv = totalIncome - hlvInsuranceCover - hlvLiabilities;
    setHlvResult(Math.max(0, hlv));
  };

  const calculateBMI = () => {
    const heightInMeters = bmiHeight / 100;
    const bmi = bmiWeight / (heightInMeters * heightInMeters);
    let category = '';
    
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 18.5 && bmi < 25) category = 'Normal weight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else category = 'Obese';

    setBmiResult({ bmi: parseFloat(bmi.toFixed(2)), category });
  };

  const calculateRetirement = () => {
    const yearsToRetirement = retirementTargetAge - retirementAge;
    const monthlyExpenses = retirementMonthlyExpenses;
    const annualExpenses = monthlyExpenses * 12;
    const yearsAfterRetirement = 25; // Assume 25 years post-retirement
    const inflationRate = 0.06; // 6% inflation
    
    const futureValue = annualExpenses * Math.pow(1 + inflationRate, yearsToRetirement);
    const corpusNeeded = futureValue * yearsAfterRetirement;
    
    setRetirementResult(corpusNeeded);
  };

  const calculateEducation = () => {
    const yearsToEducation = educationAge - childAge;
    const inflationRate = 0.08; // 8% education inflation
    const futureEducationCost = educationCost * Math.pow(1 + inflationRate, yearsToEducation);
    
    setEducationResult(futureEducationCost);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section id="calculators-header" className="bg-gradient-to-br from-primary-lighter/40 via-background to-background pt-10 sm:pt-12 md:pt-16 pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Financial Planning Tools</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Insurance & Financial <span className="text-primary">Calculators</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Our calculators help you understand how much coverage in Life Insurance you and your family need.
          </p>
        </div>
      </section>

      {/* Calculators Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="hlv" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-muted/50 p-2 rounded-xl mb-8">
              <TabsTrigger value="hlv" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 rounded-lg text-sm md:text-base">
                <Calculator className="h-4 w-4 mr-2" />
                Human Life Value
              </TabsTrigger>
              <TabsTrigger value="bmi" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 rounded-lg text-sm md:text-base">
                <Heart className="h-4 w-4 mr-2" />
                BMI
              </TabsTrigger>
              <TabsTrigger value="retirement" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 rounded-lg text-sm md:text-base">
                <TrendingUp className="h-4 w-4 mr-2" />
                Retirement
              </TabsTrigger>
              <TabsTrigger value="education" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 rounded-lg text-sm md:text-base">
                <GraduationCap className="h-4 w-4 mr-2" />
                Child Education
              </TabsTrigger>
            </TabsList>

            {/* Human Life Value Calculator */}
            <TabsContent value="hlv">
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                  <CardTitle className="text-2xl md:text-3xl">Human Life Value Calculator</CardTitle>
                  <CardDescription className="text-base">
                    Find the Insurance Cover You Really Need
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-foreground mb-6">Personal Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hlv-age" className="text-base">Current Age (Years)*</Label>
                        <Input
                          id="hlv-age"
                          type="number"
                          value={hlvAge || ''}
                          onChange={(e) => setHlvAge(Number(e.target.value))}
                          placeholder="0"
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hlv-retirement" className="text-base">Desired Retirement Age (Years)*</Label>
                        <Input
                          id="hlv-retirement"
                          type="number"
                          value={hlvRetirementAge}
                          onChange={(e) => setHlvRetirementAge(Number(e.target.value))}
                          placeholder="60"
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-6 mt-8">Financial Details</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hlv-monthly-income" className="text-base">Monthly Net Income*</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            id="hlv-monthly-income"
                            type="number"
                            value={hlvMonthlyIncome || ''}
                            onChange={(e) => setHlvMonthlyIncome(Number(e.target.value))}
                            placeholder="0"
                            className="h-12 pl-8 text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hlv-annual-income" className="text-base">Annual Net Income</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            id="hlv-annual-income"
                            type="number"
                            value={hlvAnnualIncome || ''}
                            onChange={(e) => setHlvAnnualIncome(Number(e.target.value))}
                            placeholder="0"
                            className="h-12 pl-8 text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hlv-insurance" className="text-base">Existing Insurance Cover</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            id="hlv-insurance"
                            type="number"
                            value={hlvInsuranceCover || ''}
                            onChange={(e) => setHlvInsuranceCover(Number(e.target.value))}
                            placeholder="0"
                            className="h-12 pl-8 text-base"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="hlv-liabilities" className="text-base">Liabilities</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            id="hlv-liabilities"
                            type="number"
                            value={hlvLiabilities || ''}
                            onChange={(e) => setHlvLiabilities(Number(e.target.value))}
                            placeholder="0"
                            className="h-12 pl-8 text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={calculateHLV} 
                      className="w-full md:w-auto px-12 h-14 text-lg mt-8 bg-primary hover:bg-primary/90 font-semibold shadow-md"
                      size="lg"
                    >
                      Calculate
                    </Button>

                    {hlvResult !== null && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Your Recommended Life Insurance Cover:</h3>
                        <p className="text-4xl font-bold text-primary">₹ {hlvResult.toLocaleString('en-IN')}</p>
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <p className="text-muted-foreground mb-4">Ready to secure your family's future?</p>
                          <Link to="/agents?service=new-policy">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold shadow-md">
                              Find Insurance Agents
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BMI Calculator */}
            <TabsContent value="bmi">
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                  <CardTitle className="text-2xl md:text-3xl">BMI Calculator</CardTitle>
                  <CardDescription className="text-base">
                    Calculate your Body Mass Index
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6 max-w-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bmi-height" className="text-base">Height (cm)*</Label>
                        <Input
                          id="bmi-height"
                          type="number"
                          value={bmiHeight || ''}
                          onChange={(e) => setBmiHeight(Number(e.target.value))}
                          placeholder="170"
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bmi-weight" className="text-base">Weight (kg)*</Label>
                        <Input
                          id="bmi-weight"
                          type="number"
                          value={bmiWeight || ''}
                          onChange={(e) => setBmiWeight(Number(e.target.value))}
                          placeholder="70"
                          className="h-12 text-base"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={calculateBMI} 
                      className="w-full md:w-auto px-12 h-14 text-lg mt-4 bg-primary hover:bg-primary/90 font-semibold shadow-md"
                      size="lg"
                    >
                      Calculate BMI
                    </Button>

                    {bmiResult && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Your BMI Result:</h3>
                        <p className="text-4xl font-bold text-primary mb-2">{bmiResult.bmi}</p>
                        <p className="text-xl text-foreground font-semibold">{bmiResult.category}</p>
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <p className="text-muted-foreground mb-4">Protect your health with the right insurance</p>
                          <Link to="/agents?service=new-policy&type=health">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold shadow-md">
                              Get Health Insurance
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Retirement Planning Calculator */}
            <TabsContent value="retirement">
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                  <CardTitle className="text-2xl md:text-3xl">Retirement Planning Calculator</CardTitle>
                  <CardDescription className="text-base">
                    Plan your retirement corpus
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6 max-w-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="ret-age" className="text-base">Current Age (Years)*</Label>
                        <Input
                          id="ret-age"
                          type="number"
                          value={retirementAge || ''}
                          onChange={(e) => setRetirementAge(Number(e.target.value))}
                          placeholder="30"
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ret-target" className="text-base">Target Retirement Age*</Label>
                        <Input
                          id="ret-target"
                          type="number"
                          value={retirementTargetAge}
                          onChange={(e) => setRetirementTargetAge(Number(e.target.value))}
                          placeholder="60"
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="ret-expenses" className="text-base">Current Monthly Expenses*</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            id="ret-expenses"
                            type="number"
                            value={retirementMonthlyExpenses || ''}
                            onChange={(e) => setRetirementMonthlyExpenses(Number(e.target.value))}
                            placeholder="50000"
                            className="h-12 pl-8 text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={calculateRetirement} 
                      className="w-full md:w-auto px-12 h-14 text-lg mt-4 bg-primary hover:bg-primary/90 font-semibold shadow-md"
                      size="lg"
                    >
                      Calculate
                    </Button>

                    {retirementResult !== null && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Required Retirement Corpus:</h3>
                        <p className="text-4xl font-bold text-primary">₹ {retirementResult.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <p className="text-muted-foreground mb-4">Start planning your retirement today</p>
                          <Link to="/agents?service=new-policy">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold shadow-md">
                              Speak with an Agent
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Child Education Calculator */}
            <TabsContent value="education">
              <Card className="border-2 border-border/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                  <CardTitle className="text-2xl md:text-3xl">Child Education Planner Calculator</CardTitle>
                  <CardDescription className="text-base">
                    Plan for your child's education expenses
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-6">
                  <div className="space-y-6 max-w-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="child-age" className="text-base">Child's Current Age (Years)*</Label>
                        <Input
                          id="child-age"
                          type="number"
                          value={childAge || ''}
                          onChange={(e) => setChildAge(Number(e.target.value))}
                          placeholder="5"
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edu-age" className="text-base">Age for Higher Education*</Label>
                        <Input
                          id="edu-age"
                          type="number"
                          value={educationAge}
                          onChange={(e) => setEducationAge(Number(e.target.value))}
                          placeholder="18"
                          className="h-12 text-base"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="edu-cost" className="text-base">Current Education Cost*</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <Input
                            id="edu-cost"
                            type="number"
                            value={educationCost || ''}
                            onChange={(e) => setEducationCost(Number(e.target.value))}
                            placeholder="1000000"
                            className="h-12 pl-8 text-base"
                          />
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={calculateEducation} 
                      className="w-full md:w-auto px-12 h-14 text-lg mt-4 bg-primary hover:bg-primary/90 font-semibold shadow-md"
                      size="lg"
                    >
                      Calculate
                    </Button>

                    {educationResult !== null && (
                      <div className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Future Education Cost:</h3>
                        <p className="text-4xl font-bold text-primary">₹ {educationResult.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <p className="text-muted-foreground mb-4">Secure your child's future with proper planning</p>
                          <Link to="/agents?service=new-policy">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 font-semibold shadow-md">
                              Get Child Education Plan
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Calculators;
